/**
 * WebRTC Call Manager
 * Handles peer-to-peer voice calls using native WebRTC APIs
 * Uses ActionCable for signaling (frontend-only implementation)
 */

import { AUTH_CONFIG } from '@/config/auth.config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
export type CallDirection = 'outgoing' | 'incoming';

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
  startTime?: Date;
  endTime?: Date;
}

export class WebRTCCallManager {
  private localStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private remoteStream: MediaStream | null = null;
  private signalingSubscription: any = null;
  private currentCall: CallData | null = null;
  private iceServers: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  // Callbacks
  private onCallStateChange?: (call: CallData | null) => void;
  private onRemoteStream?: (stream: MediaStream) => void;
  private onCallEnded?: () => void;

  constructor(
    onCallStateChange?: (call: CallData | null) => void,
    onRemoteStream?: (stream: MediaStream) => void,
    onCallEnded?: () => void
  ) {
    this.onCallStateChange = onCallStateChange;
    this.onRemoteStream = onRemoteStream;
    this.onCallEnded = onCallEnded;
  }

  /**
   * Initialize ActionCable connection for signaling
   */
  private async connectSignaling() {
    try {
      const ActionCableModule = await import('@rails/actioncable');
      const ActionCable = ActionCableModule.default || ActionCableModule;
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
      
      if (!token) {
        throw new Error('No authentication token');
      }

      const protocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
      const baseUrl = API_BASE_URL.replace(/^https?/, protocol);
      const cableUrl = `${baseUrl}/cable?token=${encodeURIComponent(token)}`;
      
      const consumer = ActionCable.createConsumer(cableUrl);
      return consumer;
    } catch (error) {
      console.error('Failed to connect signaling:', error);
      throw error;
    }
  }

  /**
   * Create a peer connection
   */
  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.iceServers);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote stream');
      this.remoteStream = event.streams[0];
      this.onRemoteStream?.(event.streams[0]);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.signalingSubscription && this.currentCall) {
        console.log('Sending ICE candidate:', event.candidate);
        this.signalingSubscription.send({
          type: 'ice-candidate',
          callId: this.currentCall.callId,
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.log('Peer connection failed or disconnected');
        this.endCall();
      }
    };

    return pc;
  }

  /**
   * Start a call to another user
   */
  async startCall(from: CallParticipant, to: CallParticipant): Promise<void> {
    if (this.currentCall) {
      throw new Error('A call is already in progress');
    }

    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      // Create call data
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.currentCall = {
        callId,
        from,
        to,
        state: 'calling', // Outgoing calls start in 'calling' state
        direction: 'outgoing',
        startTime: new Date(),
      };

      console.log('📞 Outgoing call created:', this.currentCall);
      this.onCallStateChange?.(this.currentCall);

      // Connect to signaling
      const consumer = await this.connectSignaling();
      
      // Subscribe to current user's channel for receiving responses (answers, ICE candidates)
      this.signalingSubscription = consumer.subscriptions.create(
        {
          channel: 'CallChannel',
          user_id: from.id, // Subscribe to caller's channel to receive answers
        },
        {
          connected: () => {
            console.log('✅ Connected to CallChannel for outgoing call');
          },
          disconnected: () => {
            console.log('❌ Disconnected from CallChannel');
          },
          received: (data: any) => {
            console.log('📨 Signaling message received in outgoing call:', data);
            this.handleSignalingMessage(data);
          },
        }
      );

      // Create peer connection
      this.peerConnection = this.createPeerConnection();

      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Send offer via signaling
      if (this.signalingSubscription) {
        console.log('📤 Sending call offer:', { callId, from: from.id, to: to.id });
        this.signalingSubscription.send({
          type: 'call-offer',
          callId,
          from,
          to,
          offer: offer,
        });
      } else {
        console.error('❌ No signaling subscription available to send offer');
      }
    } catch (error) {
      console.error('Failed to start call:', error);
      this.endCall();
      throw error;
    }
  }

  /**
   * Send call offer notification
   */
  private sendCallOffer(callId: string, from: CallParticipant, to: CallParticipant) {
    // This will be handled by ActionCable broadcast from backend
    // For now, we'll use the subscription to send the offer
  }

  /**
   * Handle incoming call
   */
  async handleIncomingCall(callData: CallData, offer: RTCSessionDescriptionInit): Promise<void> {
    console.log('📞 handleIncomingCall called:', { callData, offer });
    
    if (this.currentCall) {
      console.log('⚠️ Already in a call, rejecting new call');
      // Reject if already in a call
      this.rejectCall(callData.callId);
      return;
    }

    try {
      console.log('🎤 Requesting user media...');
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      console.log('✅ User media obtained');

      this.currentCall = {
        ...callData,
        state: 'ringing',
        direction: 'incoming',
      };

      console.log('📞 Setting call state to ringing');
      this.onCallStateChange?.(this.currentCall);

      // Create peer connection
      console.log('🔗 Creating peer connection...');
      this.peerConnection = this.createPeerConnection();
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('✅ Remote description set');

      // Connect to signaling for sending answer/reject
      console.log('📡 Connecting to signaling...');
      const consumer = await this.connectSignaling();
      this.signalingSubscription = consumer.subscriptions.create(
        {
          channel: 'CallChannel',
          user_id: callData.to.id, // Subscribe to recipient's channel for sending answer
        },
        {
          connected: () => {
            console.log('✅ Connected to CallChannel for incoming call (to send answer)');
          },
          disconnected: () => {
            console.log('❌ Disconnected from CallChannel');
          },
          received: (data: any) => {
            console.log('📨 Signaling message received in call manager:', data);
            this.handleSignalingMessage(data);
          },
        }
      );
      console.log('✅ Signaling subscription created for incoming call');
    } catch (error) {
      console.error('❌ Failed to handle incoming call:', error);
      this.rejectCall(callData.callId);
      throw error;
    }
  }

  /**
   * Accept an incoming call
   */
  async acceptCall(): Promise<void> {
    if (!this.currentCall || !this.peerConnection) {
      throw new Error('No call to accept');
    }

    try {
      console.log('✅ Accepting call:', this.currentCall.callId);
      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log('✅ Answer created and local description set');

      // Send answer via signaling
      if (this.signalingSubscription) {
        console.log('📤 Sending call answer to:', this.currentCall.from.id);
        this.signalingSubscription.send({
          type: 'call-answer',
          callId: this.currentCall.callId,
          from: this.currentCall.to,
          to: this.currentCall.from,
          answer: answer,
        });
      } else {
        console.error('❌ No signaling subscription to send answer');
      }

      // Update call state
      this.currentCall.state = 'connected';
      this.onCallStateChange?.(this.currentCall);
      console.log('✅ Call accepted and connected');
    } catch (error) {
      console.error('❌ Failed to accept call:', error);
      this.endCall();
      throw error;
    }
  }

  /**
   * Reject an incoming call
   */
  rejectCall(callId: string): void {
    if (this.signalingSubscription) {
      this.signalingSubscription.send({
        type: 'call-reject',
        callId,
      });
    }
    this.endCall();
  }

  /**
   * End the current call
   */
  endCall(): void {
    if (this.signalingSubscription && this.currentCall) {
      this.signalingSubscription.send({
        type: 'call-end',
        callId: this.currentCall.callId,
      });
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.localStream = null;
    }

    // Update call state
    if (this.currentCall) {
      this.currentCall.state = 'ended';
      this.currentCall.endTime = new Date();
      this.onCallStateChange?.(this.currentCall);
    }

    // Unsubscribe from signaling
    if (this.signalingSubscription) {
      this.signalingSubscription.unsubscribe();
      this.signalingSubscription = null;
    }

    const endedCall = this.currentCall;
    this.currentCall = null;
    this.remoteStream = null;

    this.onCallEnded?.();
  }

  /**
   * Handle signaling messages
   */
  private async handleSignalingMessage(data: any) {
    console.log('📨 handleSignalingMessage:', data, 'currentCall:', this.currentCall);
    
    if (!this.peerConnection || !this.currentCall) {
      console.warn('⚠️ No peer connection or current call, ignoring message');
      return;
    }

    try {
      if (data.type === 'call-offer' && this.currentCall.direction === 'incoming') {
        // Already handled in handleIncomingCall
        console.log('📞 Call offer already handled for incoming call');
        return;
      }

      if (data.type === 'call-answer' && this.currentCall.direction === 'outgoing') {
        console.log('✅ Processing call answer for outgoing call');
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        this.currentCall.state = 'connected';
        this.onCallStateChange?.(this.currentCall);
        console.log('✅ Call connected');
      }

      if (data.type === 'ice-candidate') {
        console.log('🧊 Processing ICE candidate');
        if (this.peerConnection.remoteDescription) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('✅ ICE candidate added');
        } else {
          // Store ICE candidates if remote description not set yet
          console.log('⏳ Storing ICE candidate for later (remote description not set)');
        }
      }

      if (data.type === 'call-reject' || data.type === 'call-end') {
        console.log('❌ Call rejected or ended');
        this.endCall();
      }
    } catch (error) {
      console.error('❌ Failed to handle signaling message:', error);
    }
  }

  /**
   * Mute/unmute microphone
   */
  mute(): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    }
  }

  unmute(): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
    }
  }

  isMuted(): boolean {
    if (!this.localStream) return true;
    return this.localStream.getAudioTracks().some((track) => !track.enabled);
  }

  /**
   * Get current call
   */
  getCurrentCall(): CallData | null {
    return this.currentCall;
  }

  /**
   * Get remote audio stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
}
