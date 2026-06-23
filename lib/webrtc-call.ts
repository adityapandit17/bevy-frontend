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
  private signalingConnected: boolean = false;
  private currentCall: CallData | null = null;
  private pendingOffer: RTCSessionDescriptionInit | null = null; // Store offer for recovery
  private pendingIceCandidates: RTCIceCandidate[] = []; // Store ICE candidates until remote description is set
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
  private callStartTime: Date | null = null;

  /** Notify state change with a new object reference so React re-renders (caller/callee UI) */
  private notifyCallStateChange(): void {
    if (this.currentCall) {
      this.onCallStateChange?.({ ...this.currentCall });
    } else {
      this.onCallStateChange?.(null);
    }
  }

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
   * Request microphone access (must run from a user gesture for incoming calls).
   */
  private async requestAudioStream(): Promise<MediaStream> {
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
        video: false,
      });
    } catch (error: any) {
      if (error?.name === 'NotAllowedError') {
        throw new Error(
          'Microphone access was denied. Allow microphone for this site in your browser settings, then try again.'
        );
      }
      if (error?.name === 'NotFoundError') {
        throw new Error('No microphone found. Connect a microphone and try again.');
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

    if (offerToSet.type !== 'offer') {
      console.warn('⚠️ Offer type is not "offer":', offerToSet.type);
    }

    return offerToSet;
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

    // Add local stream tracks BEFORE setting remote description
    // This is critical - tracks must be added before setting remote description
    if (this.localStream) {
      console.log('📊 Adding local tracks to peer connection:', this.localStream.getTracks().length);
      this.localStream.getTracks().forEach((track) => {
        console.log('📊 Adding track:', { kind: track.kind, enabled: track.enabled, id: track.id });
        pc.addTrack(track, this.localStream!);
      });
      console.log('✅ Local tracks added to peer connection');
    } else {
      console.warn('⚠️ No local stream available when creating peer connection');
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
        console.log('📤 Sending ICE candidate:', event.candidate);
        const otherUser = this.currentCall.direction === 'outgoing' 
          ? this.currentCall.to 
          : this.currentCall.from;
        
        this.signalingSubscription.send({
          type: 'ice-candidate',
          callId: this.currentCall.callId,
          from: this.currentCall.direction === 'outgoing' ? this.currentCall.from : this.currentCall.to,
          to: otherUser,
          candidate: event.candidate,
        });
      } else if (!event.candidate) {
        console.log('✅ ICE gathering complete (null candidate)');
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('📊 Connection state changed:', pc.connectionState);
      console.log('📊 ICE connection state:', pc.iceConnectionState);
      console.log('📊 ICE gathering state:', pc.iceGatheringState);
      
      if (pc.connectionState === 'connected') {
        console.log('✅ Peer connection established!');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.log('❌ Peer connection failed or disconnected');
        this.endCall();
      }
    };

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state changed:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log('✅ ICE connection established!');
      } else if (pc.iceConnectionState === 'failed') {
        console.log('❌ ICE connection failed');
      }
    };

    // Handle signaling state changes (important for debugging)
    pc.onsignalingstatechange = () => {
      console.log('📊 Signaling state changed:', pc.signalingState);
      if (pc.signalingState === 'closed') {
        console.log('⚠️ Peer connection signaling closed');
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
      // Get user media (outgoing call — triggered by user clicking Call)
      this.localStream = await this.requestAudioStream();

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
      this.notifyCallStateChange();

      // Connect to signaling
      const consumer = await this.connectSignaling();
      
      // Subscribe to current user's channel for receiving responses (answers, ICE candidates)
      this.signalingConnected = false;
      this.signalingSubscription = consumer.subscriptions.create(
        {
          channel: 'CallChannel',
          user_id: Number(from.id), // Ensure user_id is a number
        },
        {
          connected: () => {
            console.log('✅ Connected to CallChannel for outgoing call, user_id:', from.id);
            this.signalingConnected = true;
          },
          disconnected: () => {
            console.log('❌ Disconnected from CallChannel');
            this.signalingConnected = false;
          },
          rejected: () => {
            console.error('❌ CallChannel subscription rejected for outgoing call');
            this.signalingConnected = false;
            throw new Error('CallChannel subscription rejected');
          },
          received: (data: any) => {
            console.log('📨 Signaling message received in outgoing call:', data);
            this.handleSignalingMessage(data);
          },
        }
      );
      
      // Wait for subscription to connect (with timeout)
      let attempts = 0;
      while (!this.signalingConnected && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!this.signalingConnected) {
        throw new Error('Failed to connect to CallChannel within timeout');
      }
      
      // Verify subscription is active
      if (!this.signalingSubscription) {
        throw new Error('Failed to create signaling subscription');
      }

      // Create peer connection
      this.peerConnection = this.createPeerConnection();

      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Send offer via signaling
      if (this.signalingSubscription) {
        console.log('📤 Sending call offer:', { callId, from: from.id, to: to.id });
        console.log('📤 Call offer data:', {
          type: 'call-offer',
          callId,
          from: { id: from.id, name: from.name, email: from.email },
          to: { id: to.id, name: to.name, email: to.email },
          offer: offer ? 'present' : 'missing'
        });
        this.signalingSubscription.send({
          type: 'call-offer',
          callId,
          from,
          to,
          offer: offer,
        });
        console.log('✅ Call offer sent successfully');
      } else {
        console.error('❌ No signaling subscription available to send offer');
        throw new Error('No signaling subscription available');
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
   * Handle incoming call — ring only; microphone is requested when the user taps Accept.
   */
  async handleIncomingCall(callData: CallData, offer: RTCSessionDescriptionInit): Promise<void> {
    console.log('📞 handleIncomingCall called:', { callData, offer });

    if (this.currentCall) {
      console.log('⚠️ Already in a call, rejecting new call');
      this.rejectCall(callData.callId);
      return;
    }

    try {
      this.pendingOffer = this.parseOffer(offer);

      this.currentCall = {
        ...callData,
        state: 'ringing',
        direction: 'incoming',
      };

      console.log('📞 Incoming call ringing — waiting for user to accept');
      this.notifyCallStateChange();

      console.log('📡 Connecting to signaling...');
      const consumer = await this.connectSignaling();
      this.signalingConnected = false;
      this.signalingSubscription = consumer.subscriptions.create(
        {
          channel: 'CallChannel',
          user_id: Number(callData.to.id),
        },
        {
          connected: () => {
            console.log('✅ Connected to CallChannel for incoming call, user_id:', callData.to.id);
            this.signalingConnected = true;
          },
          disconnected: () => {
            console.log('❌ Disconnected from CallChannel');
            this.signalingConnected = false;
          },
          rejected: () => {
            console.error('❌ CallChannel subscription rejected for incoming call');
            this.signalingConnected = false;
          },
          received: (data: any) => {
            console.log('📨 Signaling message received in call manager:', data);
            this.handleSignalingMessage(data);
          },
        }
      );

      let attempts = 0;
      while (!this.signalingConnected && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (!this.signalingConnected) {
        console.warn('⚠️ Signaling subscription not connected yet, but continuing...');
      }

      console.log('✅ Incoming call ready to accept');
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
    if (!this.currentCall) {
      throw new Error('No call to accept');
    }

    if (!this.pendingOffer) {
      throw new Error('No call offer available');
    }

    console.log('📞 acceptCall called');
    console.log('📊 Current call state:', this.currentCall.state);
    console.log('📊 Pending offer exists:', !!this.pendingOffer);

    if (!this.signalingSubscription) {
      console.error('❌ No signaling subscription available');
      throw new Error('No signaling subscription available. Please try again.');
    }

    if (!this.signalingConnected) {
      console.warn('⚠️ Signaling subscription not connected yet, waiting...');
      let attempts = 0;
      while (!this.signalingConnected && attempts < 5) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        attempts++;
      }
      if (!this.signalingConnected) {
        throw new Error('Signaling subscription not connected. Please try again.');
      }
    }

    try {
      console.log('🎤 Requesting microphone (user accepted call)...');
      this.localStream = await this.requestAudioStream();
      console.log('✅ User media obtained');

      this.peerConnection = this.createPeerConnection();

      const rtcOffer = new RTCSessionDescription(this.pendingOffer);
      await this.peerConnection.setRemoteDescription(rtcOffer);
      console.log('✅ Remote description set, state:', this.peerConnection.signalingState);

      if (!['have-remote-offer', 'have-local-pranswer'].includes(this.peerConnection.signalingState)) {
        throw new Error(
          `Peer connection not ready. Current state: ${this.peerConnection.signalingState}`
        );
      }

      console.log('✅ Accepting call:', this.currentCall.callId);
      console.log('🔧 Creating answer...');

      let answer: RTCSessionDescriptionInit;
      try {
        const finalStateCheck = this.peerConnection.signalingState;
        if (!['have-remote-offer', 'have-local-pranswer'].includes(finalStateCheck)) {
          throw new Error(`State changed between checks: ${finalStateCheck}`);
        }

        answer = await this.peerConnection.createAnswer();
        console.log('✅ Answer created:', answer.type);
      } catch (error: any) {
        console.error('❌ Failed to create answer:', error);
        console.log('📊 Current peer connection state at error:', {
          signalingState: this.peerConnection.signalingState,
          connectionState: this.peerConnection.connectionState,
          iceConnectionState: this.peerConnection.iceConnectionState,
          hasRemoteDescription: !!this.peerConnection.remoteDescription,
          hasLocalDescription: !!this.peerConnection.localDescription,
          remoteDescriptionType: this.peerConnection.remoteDescription?.type,
          localDescriptionType: this.peerConnection.localDescription?.type,
          pendingOfferExists: !!this.pendingOffer,
        });
        throw new Error(`Failed to create answer: ${error.message}`);
      }
      
      await this.peerConnection.setLocalDescription(answer);
      console.log('✅ Local description set:', this.peerConnection.localDescription?.type);
      
      // Process any pending ICE candidates that arrived before remote description was set
      console.log(`📦 Processing ${this.pendingIceCandidates.length} pending ICE candidates`);
      for (const candidate of this.pendingIceCandidates) {
        try {
          await this.peerConnection.addIceCandidate(candidate);
          console.log('✅ Added pending ICE candidate');
        } catch (error) {
          console.warn('⚠️ Failed to add pending ICE candidate:', error);
        }
      }
      this.pendingIceCandidates = [];

      // Send answer via signaling
      console.log('📤 Sending call answer to caller (from.id):', this.currentCall.from.id);
      console.log('📤 Call answer data:', {
        type: 'call-answer',
        callId: this.currentCall.callId,
        from: { id: this.currentCall.to.id, name: this.currentCall.to.name },
        to: { id: this.currentCall.from.id, name: this.currentCall.from.name },
        answer: answer ? 'present' : 'missing'
      });
      
      this.signalingSubscription.send({
        type: 'call-answer',
        callId: this.currentCall.callId,
        from: this.currentCall.to,
        to: this.currentCall.from,
        answer: answer,
      });
      console.log('✅ Call answer sent successfully');

      // Update call state
      this.currentCall.state = 'connected';
      this.callStartTime = new Date(); // Start timer when call is connected
      this.notifyCallStateChange();
      console.log('✅ Call accepted and connected');
    } catch (error: any) {
      console.error('❌ Failed to accept call:', error);
      const errorMessage = error.message || 'Failed to accept call';
      this.endCall();
      throw new Error(errorMessage);
    }
  }

  /**
   * Reject an incoming call
   */
  rejectCall(callId: string): void {
    if (this.signalingSubscription && this.currentCall) {
      this.signalingSubscription.send({
        type: 'call-reject',
        callId,
        from: this.currentCall.from,
        to: this.currentCall.to,
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
        from: this.currentCall.from,
        to: this.currentCall.to,
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
      this.notifyCallStateChange();
    }

    // Unsubscribe from signaling
    if (this.signalingSubscription) {
      this.signalingSubscription.unsubscribe();
      this.signalingSubscription = null;
    }
    this.signalingConnected = false;

    const endedCall = this.currentCall;
    this.currentCall = null;
    this.remoteStream = null;
    this.pendingOffer = null;
    this.pendingIceCandidates = [];
    this.callStartTime = null;

    this.onCallEnded?.();
  }

  /**
   * Handle signaling messages
   */
  async handleSignalingMessage(data: any) {
    console.log('📨 handleSignalingMessage:', data, 'currentCall:', this.currentCall);

    if (!this.currentCall) {
      console.warn('⚠️ No current call, ignoring message');
      return;
    }

    try {
      if (data.type === 'call-reject' || data.type === 'call-end') {
        console.log('❌ Call rejected or ended');
        this.endCall();
        return;
      }

      if (data.type === 'ice-candidate') {
        console.log('🧊 Processing ICE candidate:', data.candidate);
        const candidate = new RTCIceCandidate(data.candidate);
        try {
          if (this.peerConnection?.remoteDescription) {
            await this.peerConnection.addIceCandidate(candidate);
            console.log('✅ ICE candidate added successfully');
          } else {
            console.log('⏳ Storing ICE candidate for later');
            this.pendingIceCandidates.push(candidate);
          }
        } catch (error: any) {
          console.error('❌ Failed to add ICE candidate:', error);
        }
        return;
      }

      if (!this.peerConnection) {
        console.warn('⚠️ No peer connection yet, ignoring message type:', data.type);
        return;
      }

      if (data.type === 'call-offer' && this.currentCall.direction === 'incoming') {
        console.log('📞 Call offer already handled for incoming call');
        return;
      }

      if (data.type === 'call-answer' && this.currentCall.direction === 'outgoing') {
        console.log('✅ Processing call answer for outgoing call');
        console.log('📊 State before setting remote description:', this.peerConnection.signalingState);
        
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        console.log('✅ Remote description set from answer');
        console.log('📊 State after setting remote description:', this.peerConnection.signalingState);
        
        // Process any pending ICE candidates
        console.log(`📦 Processing ${this.pendingIceCandidates.length} pending ICE candidates`);
        for (const candidate of this.pendingIceCandidates) {
          try {
            await this.peerConnection.addIceCandidate(candidate);
            console.log('✅ Added pending ICE candidate');
          } catch (error) {
            console.warn('⚠️ Failed to add pending ICE candidate:', error);
          }
        }
        this.pendingIceCandidates = [];
        
        // Wait a moment for connection to establish
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('📊 Final connection states:', {
          connectionState: this.peerConnection.connectionState,
          iceConnectionState: this.peerConnection.iceConnectionState,
          signalingState: this.peerConnection.signalingState
        });
        
        this.currentCall.state = 'connected';
        this.callStartTime = new Date(); // Start duration timer for caller when connected
        this.notifyCallStateChange();
        console.log('✅ Call connected');
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

  /**
   * Get call duration in seconds
   */
  getCallDuration(): number {
    if (!this.callStartTime) return 0;
    return Math.floor((new Date().getTime() - this.callStartTime.getTime()) / 1000);
  }

  /**
   * Get call start time
   */
  getCallStartTime(): Date | null {
    return this.callStartTime;
  }
}
