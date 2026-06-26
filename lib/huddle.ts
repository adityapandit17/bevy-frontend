/**
 * Huddle API and WebRTC Client
 * Handles voice and video calls using WebRTC and ActionCable signaling
 */

import { apiRequest, getApiUrl } from './api';
import { AUTH_CONFIG } from '@/config/auth.config';
import { getActionCableUrl } from '@/lib/action-cable-url';

export interface Huddle {
  id: number;
  channel_id: number;
  started_by: {
    id: number;
    name: string;
    email: string;
  };
  status: 'active' | 'ended';
  started_at: string;
  ended_at?: string;
  participants: Array<{
    id: number;
    name: string;
    email: string;
    joined_at?: string;
  }>;
  participants_count: number;
}

export interface HuddleParticipant {
  id: number;
  name: string;
  email: string;
}

export const huddleApi = {
  // Get active huddles for a channel
  getHuddles: async (channelId: number): Promise<Huddle[]> => {
    const url = getApiUrl(`api/v1/channels/${channelId}/huddles`);
    const response = await apiRequest<{ success: boolean; huddles: Huddle[] }>(url);
    return response.huddles;
  },

  // Get a specific huddle
  getHuddle: async (channelId: number, huddleId: number): Promise<Huddle> => {
    const url = getApiUrl(`api/v1/channels/${channelId}/huddles/${huddleId}`);
    const response = await apiRequest<{ success: boolean; huddle: Huddle }>(url);
    return response.huddle;
  },

  // Start or join a huddle
  startHuddle: async (channelId: number): Promise<Huddle> => {
    const url = getApiUrl(`api/v1/channels/${channelId}/huddles`);
    const response = await apiRequest<{ success: boolean; huddle: Huddle }>(url, {
      method: 'POST',
    });
    return response.huddle;
  },

  // Join an existing huddle
  joinHuddle: async (channelId: number, huddleId: number): Promise<Huddle> => {
    const url = getApiUrl(`api/v1/channels/${channelId}/huddles/${huddleId}/join`);
    const response = await apiRequest<{ success: boolean; huddle: Huddle }>(url, {
      method: 'POST',
    });
    return response.huddle;
  },

  // Leave a huddle
  leaveHuddle: async (channelId: number, huddleId: number): Promise<void> => {
    const url = getApiUrl(`api/v1/channels/${channelId}/huddles/${huddleId}/leave`);
    await apiRequest<{ success: boolean }>(url, {
      method: 'POST',
    });
  },

  // End a huddle (only for creator)
  endHuddle: async (channelId: number, huddleId: number): Promise<void> => {
    const url = getApiUrl(`api/v1/channels/${channelId}/huddles/${huddleId}`);
    await apiRequest<{ success: boolean }>(url, {
      method: 'DELETE',
    });
  },
};

/**
 * WebRTC Client for handling peer-to-peer audio and video connections
 */
export class HuddleWebRTC {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<number, RTCPeerConnection> = new Map();
  private localAudio: HTMLAudioElement | null = null;
  private remoteAudios: Map<number, HTMLAudioElement> = new Map();
  private remoteVideoStreams: Map<number, MediaStream> = new Map();
  private signalingSubscription: any = null;
  private huddleId: number | null = null;
  private currentUserId: number | null = null;
  private onParticipantsUpdate?: (participants: HuddleParticipant[]) => void;
  private onError?: (error: Error) => void;

  constructor(
    huddleId: number,
    currentUserId: number,
    onParticipantsUpdate?: (participants: HuddleParticipant[]) => void,
    onError?: (error: Error) => void
  ) {
    this.huddleId = huddleId;
    this.currentUserId = currentUserId;
    this.onParticipantsUpdate = onParticipantsUpdate;
    this.onError = onError;
  }

  async initialize(enableVideo: boolean = true) {
    try {
      // Get user media (microphone and optionally camera)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: enableVideo,
      });

      // Create local audio element for monitoring
      this.localAudio = new Audio();
      this.localAudio.srcObject = this.localStream;
      this.localAudio.volume = 0; // Mute local audio to prevent feedback

      // Connect to ActionCable for signaling
      await this.connectSignaling();
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      this.onError?.(new Error('Failed to access microphone/camera. Please check permissions.'));
      throw error;
    }
  }

  private async connectSignaling() {
    try {
      const { default: ActionCable } = await import('@rails/actioncable');
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
      
      if (!token) {
        throw new Error('No authentication token');
      }

      const cableUrl = getActionCableUrl(token);
      
      const consumer = ActionCable.createConsumer(cableUrl);

      this.signalingSubscription = consumer.subscriptions.create(
        {
          channel: 'HuddleChannel',
          huddle_id: this.huddleId,
        },
        {
          connected: () => {
            console.log('Connected to HuddleChannel for signaling');
          },
          received: (data: any) => {
            this.handleSignalingMessage(data);
          },
        }
      );
    } catch (error) {
      console.error('Failed to connect signaling:', error);
      throw error;
    }
  }

  private handleSignalingMessage(data: any) {
    if (data.type === 'webrtc_signal' && data.from_user_id !== this.currentUserId) {
      const userId = data.from_user_id;
      const signalType = data.signal_type;
      const signalData = data.signal_data;

      if (signalType === 'offer') {
        this.handleOffer(userId, signalData);
      } else if (signalType === 'answer') {
        this.handleAnswer(userId, signalData);
      } else if (signalType === 'ice-candidate') {
        this.handleIceCandidate(userId, signalData);
      }
    } else if (data.type === 'signaling_ready' && data.user.id !== this.currentUserId) {
      // Another user is ready, create peer connection
      this.createPeerConnection(data.user.id);
    } else if (data.type === 'participant_joined') {
      this.onParticipantsUpdate?.([data.user]);
    } else if (data.type === 'participant_left') {
      this.removePeerConnection(data.user.id);
    }
  }

  private async createPeerConnection(userId: number) {
    if (this.peerConnections.has(userId)) {
      return;
    }

    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream (both audio and video)
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];
      
      // Store video stream
      this.remoteVideoStreams.set(userId, remoteStream);
      
      // Create audio element for remote audio
      const remoteAudio = new Audio();
      remoteAudio.srcObject = remoteStream;
      remoteAudio.autoplay = true;
      this.remoteAudios.set(userId, remoteAudio);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(userId, 'ice-candidate', event.candidate);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with user ${userId}:`, peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
        this.removePeerConnection(userId);
      }
    };

    this.peerConnections.set(userId, peerConnection);

    // Create and send offer
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      this.sendSignal(userId, 'offer', offer);
    } catch (error) {
      console.error('Failed to create offer:', error);
      this.removePeerConnection(userId);
    }
  }

  private async handleOffer(userId: number, offer: RTCSessionDescriptionInit) {
    await this.createPeerConnection(userId);
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      this.sendSignal(userId, 'answer', answer);
    } catch (error) {
      console.error('Failed to handle offer:', error);
      this.removePeerConnection(userId);
    }
  }

  private async handleAnswer(userId: number, answer: RTCSessionDescriptionInit) {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Failed to handle answer:', error);
      this.removePeerConnection(userId);
    }
  }

  private async handleIceCandidate(userId: number, candidate: RTCIceCandidateInit) {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) return;

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error);
    }
  }

  private sendSignal(userId: number, signalType: string, signalData: any) {
    if (!this.signalingSubscription) return;

    this.signalingSubscription.send({
      signal_type: signalType,
      signal_data: signalData,
    });
  }

  private removePeerConnection(userId: number) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }

    const remoteAudio = this.remoteAudios.get(userId);
    if (remoteAudio) {
      remoteAudio.pause();
      remoteAudio.srcObject = null;
      this.remoteAudios.delete(userId);
    }

    // Clean up video stream
    this.remoteVideoStreams.delete(userId);
  }

  async mute() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    }
  }

  async unmute() {
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

  // Add methods to get video streams
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(userId: number): MediaStream | null {
    return this.remoteVideoStreams.get(userId) || null;
  }

  async toggleVideo(): Promise<void> {
    if (!this.localStream) return;
    
    const videoTracks = this.localStream.getVideoTracks();
    
    // If video tracks exist, toggle them
    if (videoTracks.length > 0) {
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
    } else {
      // If no video tracks, enable video by adding tracks
      await this.enableVideo();
    }
  }

  async enableVideo(): Promise<void> {
    if (!this.localStream) {
      throw new Error('Local stream not initialized');
    }

    try {
      // Get video stream
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      // Add video tracks to existing local stream
      videoStream.getVideoTracks().forEach((track) => {
        this.localStream!.addTrack(track);
      });

      // Update all peer connections with new video tracks
      this.peerConnections.forEach((peerConnection, userId) => {
        videoStream.getVideoTracks().forEach((track) => {
          const sender = peerConnection.getSenders().find(
            (s) => s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            // Replace existing video track
            sender.replaceTrack(track);
          } else {
            // Add new video track
            peerConnection.addTrack(track, this.localStream!);
          }
        });
      });

      // Stop the temporary video stream (tracks are now in localStream)
      videoStream.getTracks().forEach((track) => {
        if (track !== videoStream.getVideoTracks()[0]) {
          track.stop();
        }
      });

      console.log('✅ Video enabled and added to all peer connections');
    } catch (error) {
      console.error('Failed to enable video:', error);
      throw new Error('Failed to enable video. Please check camera permissions.');
    }
  }

  isVideoEnabled(): boolean {
    if (!this.localStream) return false;
    const videoTracks = this.localStream.getVideoTracks();
    return videoTracks.length > 0 && videoTracks.some((track) => track.enabled);
  }

  hasVideoCapability(): boolean {
    if (!this.localStream) return false;
    return this.localStream.getVideoTracks().length > 0;
  }

  async disconnect() {
    // Close all peer connections
    this.peerConnections.forEach((peerConnection, userId) => {
      this.removePeerConnection(userId);
    });

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.localStream = null;
    }

    // Clean up audio elements
    if (this.localAudio) {
      this.localAudio.pause();
      this.localAudio.srcObject = null;
      this.localAudio = null;
    }

    // Clean up video streams
    this.remoteVideoStreams.clear();

    // Unsubscribe from signaling
    if (this.signalingSubscription) {
      this.signalingSubscription.unsubscribe();
      this.signalingSubscription = null;
    }
  }
}
