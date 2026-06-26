/**
 * WebRTC Call Manager — 1:1 voice/video calls with ActionCable signaling.
 * Signaling is owned by CallProvider (single subscription per user).
 */

import { apiRequest, getApiUrl } from '@/lib/api';

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
export type CallDirection = 'outgoing' | 'incoming';
export type CallMediaType = 'audio' | 'video';

export interface CallParticipant {
  id: number;
  name: string;
  email: string;
}

export interface CallData {
  callId: string;
  from: CallParticipant;
  to: CallParticipant;
  state: CallState;
  direction: CallDirection;
  mediaType: CallMediaType;
  startTime?: Date;
  endTime?: Date;
}

export interface StartCallOptions {
  video?: boolean;
}

export interface CallSignalingAdapter {
  send: (data: Record<string, unknown>) => void;
  waitUntilReady: () => Promise<void>;
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

const SIGNALING_READY_TIMEOUT_MS = 5000;
const DISCONNECT_GRACE_MS = 8000;

function isTurnUrl(url: string): boolean {
  return url.startsWith('turn:') || url.startsWith('turns:');
}

/** Browsers throw if TURN URLs are present without username + credential. */
export function normalizeIceServers(servers: RTCIceServer[]): RTCIceServer[] {
  return servers.filter((server) => {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
    const hasTurn = urls.some((url) => typeof url === 'string' && isTurnUrl(url));
    if (!hasTurn) return true;
    return Boolean(server.username && server.credential);
  });
}

export class WebRTCCallManager {
  private localStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private remoteStream: MediaStream | null = null;
  private signaling: CallSignalingAdapter | null = null;
  private currentCall: CallData | null = null;
  private pendingOffer: RTCSessionDescriptionInit | null = null;
  private pendingIceCandidates: RTCIceCandidate[] = [];
  private iceServers: RTCConfiguration = { iceServers: DEFAULT_ICE_SERVERS };
  private iceServersLoaded = false;
  private remoteAnswerApplied = false;
  private disconnectGraceTimer: ReturnType<typeof setTimeout> | null = null;

  private onCallStateChange?: (call: CallData | null) => void;
  private onRemoteStream?: (stream: MediaStream) => void;
  private onLocalStream?: (stream: MediaStream | null) => void;
  private onCallEnded?: () => void;
  private callStartTime: Date | null = null;

  constructor(
    onCallStateChange?: (call: CallData | null) => void,
    onRemoteStream?: (stream: MediaStream) => void,
    onCallEnded?: () => void,
    onLocalStream?: (stream: MediaStream | null) => void
  ) {
    this.onCallStateChange = onCallStateChange;
    this.onRemoteStream = onRemoteStream;
    this.onCallEnded = onCallEnded;
    this.onLocalStream = onLocalStream;
  }

  bindSignaling(adapter: CallSignalingAdapter | null): void {
    this.signaling = adapter;
  }

  private notifyCallStateChange(): void {
    if (this.currentCall) {
      this.onCallStateChange?.({ ...this.currentCall });
    } else {
      this.onCallStateChange?.(null);
    }
  }

  private async ensureIceServers(): Promise<void> {
    if (this.iceServersLoaded) return;
    try {
      const response = await apiRequest<{ success?: boolean; data?: { ice_servers: RTCIceServer[] }; ice_servers?: RTCIceServer[] }>(
        getApiUrl('api/v1/calls/ice_config'),
        { suppressToast: true }
      );
      const servers = response.data?.ice_servers ?? response.ice_servers;
      if (servers?.length) {
        const normalized = normalizeIceServers(servers);
        this.iceServers = {
          iceServers: normalized.length ? normalized : DEFAULT_ICE_SERVERS,
          iceCandidatePoolSize: 10,
        };
      }
    } catch {
      this.iceServers = { iceServers: DEFAULT_ICE_SERVERS };
    } finally {
      this.iceServersLoaded = true;
    }
  }

  private async ensureSignalingReady(): Promise<void> {
    if (!this.signaling) {
      throw new Error('Call signaling is not connected. Please refresh the page.');
    }
    await this.signaling.waitUntilReady();
  }

  private sendSignaling(data: Record<string, unknown>): void {
    if (!this.signaling) {
      throw new Error('Call signaling is not connected.');
    }
    this.signaling.send(data);
  }

  private async requestMediaStream(includeVideo: boolean): Promise<MediaStream> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone is not supported in this browser.');
    }

    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: includeVideo
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            }
          : false,
      });
    } catch (error: unknown) {
      const err = error as { name?: string };
      if (err?.name === 'NotAllowedError') {
        throw new Error(
          includeVideo
            ? 'Camera/microphone access was denied. Allow permissions for this site in your browser settings, then try again.'
            : 'Microphone access was denied. Allow microphone for this site in your browser settings, then try again.'
        );
      }
      if (err?.name === 'NotFoundError') {
        throw new Error(
          includeVideo
            ? 'No camera or microphone found. Connect devices and try again.'
            : 'No microphone found. Connect a microphone and try again.'
        );
      }
      throw error;
    }
  }

  private parseOffer(offer: RTCSessionDescriptionInit | string): RTCSessionDescriptionInit {
    if (!offer) {
      throw new Error('Invalid offer received from caller: offer is missing');
    }

    let offerToSet: RTCSessionDescriptionInit;
    if (typeof offer === 'string') {
      try {
        offerToSet = JSON.parse(offer);
      } catch {
        throw new Error('Invalid offer format: cannot parse offer string');
      }
    } else {
      offerToSet = offer;
    }

    if (!offerToSet.type || !offerToSet.sdp) {
      throw new Error('Invalid offer received from caller: missing type or sdp');
    }

    return offerToSet;
  }

  private clearDisconnectGrace(): void {
    if (this.disconnectGraceTimer) {
      clearTimeout(this.disconnectGraceTimer);
      this.disconnectGraceTimer = null;
    }
  }

  private markConnected(): void {
    if (!this.currentCall || this.currentCall.state === 'connected') return;
    this.currentCall.state = 'connected';
    if (!this.callStartTime) {
      this.callStartTime = new Date();
    }
    this.notifyCallStateChange();
  }

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.iceServers);

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    pc.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.onRemoteStream?.(event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate || !this.currentCall) return;
      const otherUser =
        this.currentCall.direction === 'outgoing' ? this.currentCall.to : this.currentCall.from;
      const fromUser =
        this.currentCall.direction === 'outgoing' ? this.currentCall.from : this.currentCall.to;

      this.sendSignaling({
        type: 'ice-candidate',
        callId: this.currentCall.callId,
        from: fromUser,
        to: otherUser,
        candidate: event.candidate,
      });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        this.clearDisconnectGrace();
        this.markConnected();
      } else if (pc.connectionState === 'failed') {
        this.endCall();
      } else if (pc.connectionState === 'disconnected') {
        this.clearDisconnectGrace();
        this.disconnectGraceTimer = setTimeout(() => {
          if (
            pc.connectionState === 'disconnected' ||
            pc.connectionState === 'failed' ||
            pc.connectionState === 'closed'
          ) {
            this.endCall();
          }
        }, DISCONNECT_GRACE_MS);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (
        pc.iceConnectionState === 'connected' ||
        pc.iceConnectionState === 'completed'
      ) {
        this.markConnected();
      } else if (pc.iceConnectionState === 'failed') {
        this.endCall();
      }
    };

    return pc;
  }

  async startCall(
    from: CallParticipant,
    to: CallParticipant,
    options: StartCallOptions = {}
  ): Promise<void> {
    if (this.currentCall) {
      throw new Error('A call is already in progress');
    }

    const mediaType: CallMediaType = options.video ? 'video' : 'audio';

    try {
      await this.ensureIceServers();
      await this.ensureSignalingReady();

      this.localStream = await this.requestMediaStream(mediaType === 'video');
      this.onLocalStream?.(this.localStream);

      const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      this.currentCall = {
        callId,
        from,
        to,
        state: 'calling',
        direction: 'outgoing',
        mediaType,
        startTime: new Date(),
      };
      this.remoteAnswerApplied = false;
      this.notifyCallStateChange();

      this.peerConnection = this.createPeerConnection();

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      this.sendSignaling({
        type: 'call-offer',
        callId,
        from,
        to,
        offer,
        mediaType,
      });
    } catch (error) {
      this.endCall();
      throw error;
    }
  }

  async handleIncomingCall(
    callData: CallData,
    offer: RTCSessionDescriptionInit,
    mediaType: CallMediaType = 'audio'
  ): Promise<void> {
    if (this.currentCall) {
      this.rejectCall(callData.callId);
      return;
    }

    this.pendingOffer = this.parseOffer(offer);
    this.currentCall = {
      ...callData,
      state: 'ringing',
      direction: 'incoming',
      mediaType: mediaType ?? callData.mediaType ?? 'audio',
    };
    this.remoteAnswerApplied = false;
    this.notifyCallStateChange();
  }

  async acceptCall(withVideo: boolean = false): Promise<void> {
    if (!this.currentCall) {
      throw new Error('No call to accept');
    }
    if (!this.pendingOffer) {
      throw new Error('No call offer available');
    }

    await this.ensureIceServers();
    await this.ensureSignalingReady();

    try {
      this.localStream = await this.requestMediaStream(withVideo);
      this.onLocalStream?.(this.localStream);

      this.peerConnection = this.createPeerConnection();
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(this.pendingOffer));

      if (!['have-remote-offer', 'have-local-pranswer'].includes(this.peerConnection.signalingState)) {
        throw new Error(
          `Peer connection not ready. Current state: ${this.peerConnection.signalingState}`
        );
      }

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      for (const candidate of this.pendingIceCandidates) {
        try {
          await this.peerConnection.addIceCandidate(candidate);
        } catch {
          // ICE candidates can fail individually
        }
      }
      this.pendingIceCandidates = [];

      this.sendSignaling({
        type: 'call-answer',
        callId: this.currentCall.callId,
        from: this.currentCall.to,
        to: this.currentCall.from,
        answer,
      });

      if (withVideo) {
        this.currentCall.mediaType = 'video';
        this.notifyCallStateChange();
      }

      // UI may show ringing until ICE connects; markConnected runs on connection events
      if (
        this.peerConnection.connectionState === 'connected' ||
        this.peerConnection.iceConnectionState === 'connected' ||
        this.peerConnection.iceConnectionState === 'completed'
      ) {
        this.markConnected();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to accept call';
      this.endCall();
      throw new Error(message);
    }
  }

  rejectCall(callId: string): void {
    try {
      if (this.currentCall) {
        this.sendSignaling({
          type: 'call-reject',
          callId,
          from:
            this.currentCall.direction === 'incoming' ? this.currentCall.to : this.currentCall.from,
          to:
            this.currentCall.direction === 'incoming' ? this.currentCall.from : this.currentCall.to,
        });
      }
    } catch {
      // Signaling may be unavailable
    }
    this.endCall();
  }

  endCall(): void {
    if (this.currentCall) {
      try {
        this.sendSignaling({
          type: 'call-end',
          callId: this.currentCall.callId,
          from: this.currentCall.from,
          to: this.currentCall.to,
        });
      } catch {
        // Signaling may already be torn down
      }
    }

    this.clearDisconnectGrace();

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
      this.onLocalStream?.(null);
    }

    if (this.currentCall) {
      this.currentCall.state = 'ended';
      this.currentCall.endTime = new Date();
      this.notifyCallStateChange();
    }

    this.currentCall = null;
    this.remoteStream = null;
    this.pendingOffer = null;
    this.pendingIceCandidates = [];
    this.remoteAnswerApplied = false;
    this.callStartTime = null;

    this.onCallEnded?.();
  }

  async handleSignalingMessage(data: Record<string, unknown>): Promise<void> {
    if (!this.currentCall) return;

    const type = data.type as string;

    if (type === 'call-reject' || type === 'call-end') {
      this.endCall();
      return;
    }

    if (type === 'ice-candidate' && data.candidate) {
      const candidate = new RTCIceCandidate(data.candidate as RTCIceCandidateInit);
      if (this.peerConnection?.remoteDescription) {
        try {
          await this.peerConnection.addIceCandidate(candidate);
        } catch {
          // Non-fatal
        }
      } else {
        this.pendingIceCandidates.push(candidate);
      }
      return;
    }

    if (!this.peerConnection) return;

    if (type === 'call-answer' && this.currentCall.direction === 'outgoing') {
      if (this.remoteAnswerApplied || this.peerConnection.remoteDescription?.type === 'answer') {
        return;
      }

      const answer = data.answer as RTCSessionDescriptionInit;
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      this.remoteAnswerApplied = true;

      for (const candidate of this.pendingIceCandidates) {
        try {
          await this.peerConnection.addIceCandidate(candidate);
        } catch {
          // Non-fatal
        }
      }
      this.pendingIceCandidates = [];

      if (
        this.peerConnection.connectionState === 'connected' ||
        this.peerConnection.iceConnectionState === 'connected' ||
        this.peerConnection.iceConnectionState === 'completed'
      ) {
        this.markConnected();
      }
      return;
    }

    if (type === 'call-renegotiate-offer') {
      const offer = this.parseOffer(data.offer as RTCSessionDescriptionInit | string);
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.currentCall.mediaType = 'video';
      this.notifyCallStateChange();

      const otherUser =
        this.currentCall.direction === 'outgoing' ? this.currentCall.to : this.currentCall.from;
      const fromUser =
        this.currentCall.direction === 'outgoing' ? this.currentCall.from : this.currentCall.to;

      this.sendSignaling({
        type: 'call-renegotiate-answer',
        callId: this.currentCall.callId,
        from: fromUser,
        to: otherUser,
        answer,
      });
      return;
    }

    if (type === 'call-renegotiate-answer') {
      const answer = data.answer as RTCSessionDescriptionInit;
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  mute(): void {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
  }

  unmute(): void {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
  }

  isMuted(): boolean {
    if (!this.localStream) return true;
    return this.localStream.getAudioTracks().some((track) => !track.enabled);
  }

  toggleVideo(): boolean {
    const videoTrack = this.localStream?.getVideoTracks()[0];
    if (!videoTrack) return false;
    videoTrack.enabled = !videoTrack.enabled;
    this.onLocalStream?.(this.localStream);
    return videoTrack.enabled;
  }

  async enableVideo(): Promise<void> {
    if (!this.peerConnection || !this.localStream || !this.currentCall) {
      throw new Error('Call not connected');
    }

    const existingTrack = this.localStream.getVideoTracks()[0];
    if (existingTrack) {
      existingTrack.enabled = true;
      this.onLocalStream?.(this.localStream);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera is not supported in this browser.');
    }

    let videoStream: MediaStream;
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });
    } catch (error: unknown) {
      const err = error as { name?: string };
      if (err?.name === 'NotAllowedError') {
        throw new Error(
          'Camera access was denied. Allow camera for this site in your browser settings, then try again.'
        );
      }
      if (err?.name === 'NotFoundError') {
        throw new Error('No camera found. Connect a camera and try again.');
      }
      throw error;
    }

    const videoTrack = videoStream.getVideoTracks()[0];
    this.localStream.addTrack(videoTrack);
    this.peerConnection.addTrack(videoTrack, this.localStream);
    this.currentCall.mediaType = 'video';
    this.onLocalStream?.(this.localStream);
    this.notifyCallStateChange();

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    const otherUser =
      this.currentCall.direction === 'outgoing' ? this.currentCall.to : this.currentCall.from;
    const fromUser =
      this.currentCall.direction === 'outgoing' ? this.currentCall.from : this.currentCall.to;

    this.sendSignaling({
      type: 'call-renegotiate-offer',
      callId: this.currentCall.callId,
      from: fromUser,
      to: otherUser,
      offer,
    });
  }

  isVideoEnabled(): boolean {
    const videoTrack = this.localStream?.getVideoTracks()[0];
    return videoTrack ? videoTrack.enabled : false;
  }

  hasVideo(): boolean {
    return (this.localStream?.getVideoTracks().length ?? 0) > 0;
  }

  hasRemoteVideo(): boolean {
    return (this.remoteStream?.getVideoTracks().length ?? 0) > 0;
  }

  getCurrentCall(): CallData | null {
    return this.currentCall;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  getCallDuration(): number {
    if (!this.callStartTime) return 0;
    return Math.floor((Date.now() - this.callStartTime.getTime()) / 1000);
  }

  getCallStartTime(): Date | null {
    return this.callStartTime;
  }
}

export async function waitForSignalingReady(
  isReady: () => boolean,
  timeoutMs = SIGNALING_READY_TIMEOUT_MS
): Promise<void> {
  const started = Date.now();
  while (!isReady()) {
    if (Date.now() - started > timeoutMs) {
      throw new Error('Call signaling connection timed out. Please refresh and try again.');
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
