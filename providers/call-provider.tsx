"use client"

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react"
import { useAuthContext } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { AUTH_CONFIG } from "@/config/auth.config"
import { getActionCableUrl } from "@/lib/action-cable-url"
import {
  WebRTCCallManager,
  CallData,
  CallMediaType,
  StartCallOptions,
  waitForSignalingReady,
} from "@/lib/webrtc-call"
import { CallNotification } from "@/components/call/call-notification"
import { CallAudio } from "@/components/call/call-audio"

export type CallEventType = "accepted" | "rejected" | "ended"

export interface CallEventPayload {
  call: CallData
  duration?: number
  otherUser: { id: number; name: string; email: string }
  rejectedByThem?: boolean
}

export interface CallEventSink {
  onCallAccepted?: (payload: CallEventPayload) => void | Promise<void>
  onCallRejected?: (payload: CallEventPayload) => void | Promise<void>
  onCallEnded?: (payload: CallEventPayload) => void | Promise<void>
}

interface CallContextValue {
  callManager: WebRTCCallManager
  currentCall: CallData | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  callDuration: number
  callMuted: boolean
  callVideoEnabled: boolean
  acceptingCall: boolean
  enablingVideo: boolean
  setCallEventSink: (sink: CallEventSink | null) => void
  startCall: (
    to: { id: number; name: string; email: string },
    options?: StartCallOptions
  ) => Promise<void>
  acceptCall: (withVideo?: boolean) => Promise<void>
  rejectCall: () => void
  endCall: () => void
  toggleCallMute: () => void
  toggleCallVideo: () => Promise<void>
  formatDuration: (seconds: number) => string
}

const CallContext = createContext<CallContextValue | null>(null)

export function useCallContext(): CallContextValue {
  const ctx = useContext(CallContext)
  if (!ctx) {
    throw new Error("useCallContext must be used within a CallProvider")
  }
  return ctx
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { user: currentUser } = useAuthContext()
  const [currentCall, setCurrentCall] = useState<CallData | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [callMuted, setCallMuted] = useState(false)
  const [callVideoEnabled, setCallVideoEnabled] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [acceptingCall, setAcceptingCall] = useState(false)
  const [enablingVideo, setEnablingVideo] = useState(false)
  const callEventSinkRef = useRef<CallEventSink | null>(null)
  const callSubscriptionRef = useRef<{ send: (data: unknown) => void } | null>(null)
  const signalingReadyRef = useRef(false)

  const setCallEventSink = useCallback((sink: CallEventSink | null) => {
    callEventSinkRef.current = sink
  }, [])

  const [callManager] = useState(
    () =>
      new WebRTCCallManager(
        (call) => setCurrentCall(call),
        (stream) => setRemoteStream(stream),
        () => {
          setCurrentCall(null)
          setLocalStream(null)
          setRemoteStream(null)
          setCallDuration(0)
          setCallMuted(false)
          setCallVideoEnabled(false)
        },
        (stream) => {
          setLocalStream(stream)
          setCallVideoEnabled(stream?.getVideoTracks().some((t) => t.enabled) ?? false)
        }
      )
  )

  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }, [])

  const handleIncomingCall = useCallback(
    async (data: Record<string, unknown>) => {
      if (!currentUser) return
      if (!data.offer) {
        toast({
          title: "Call Error",
          description: "Invalid call data received. Missing offer.",
          variant: "destructive",
        })
        return
      }
      if (callManager.getCurrentCall()) return

      const mediaType = (data.mediaType as CallMediaType) || "audio"
      const callData: CallData = {
        callId: String(data.callId),
        from: data.from as CallData["from"],
        to:
          (data.to as CallData["to"]) || {
            id: Number(currentUser.id),
            name: currentUser.name ?? "",
            email: currentUser.email ?? "",
          },
        state: "ringing",
        direction: "incoming",
        mediaType,
      }

      try {
        await callManager.handleIncomingCall(
          callData,
          data.offer as RTCSessionDescriptionInit,
          mediaType
        )
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to handle incoming call"
        toast({
          title: "Call Error",
          description: message,
          variant: "destructive",
        })
      }
    },
    [currentUser, callManager]
  )

  const acceptCall = useCallback(async (withVideo = false) => {
    const call = callManager.getCurrentCall()
    if (!call || call.state !== "ringing") return
    setAcceptingCall(true)
    try {
      await callManager.acceptCall(withVideo)
      setCallMuted(callManager.isMuted())
      setCallVideoEnabled(callManager.isVideoEnabled())
      const sink = callEventSinkRef.current
      if (sink?.onCallAccepted) {
        await Promise.resolve(
          sink.onCallAccepted({
            call,
            otherUser: call.from,
          })
        )
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to accept call. Please try again."
      toast({
        title: "Call Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setAcceptingCall(false)
    }
  }, [callManager])

  const rejectCall = useCallback(() => {
    const call = callManager.getCurrentCall()
    if (call) {
      const sink = callEventSinkRef.current
      if (sink?.onCallRejected) {
        Promise.resolve(
          sink.onCallRejected({
            call,
            otherUser: call.from,
          })
        ).catch(() => {})
      }
      callManager.rejectCall(call.callId)
    }
  }, [callManager])

  const endCall = useCallback(() => {
    const call = callManager.getCurrentCall()
    if (call) {
      const otherUser = call.direction === "outgoing" ? call.to : call.from
      const duration = callManager.getCallDuration()
      const sink = callEventSinkRef.current
      if (sink?.onCallEnded) {
        Promise.resolve(
          sink.onCallEnded({
            call,
            duration,
            otherUser,
          })
        ).catch(() => {})
      }
    }
    callManager.endCall()
  }, [callManager])

  const toggleCallMute = useCallback(() => {
    if (callMuted) {
      callManager.unmute()
    } else {
      callManager.mute()
    }
    setCallMuted(callManager.isMuted())
  }, [callManager, callMuted])

  const toggleCallVideo = useCallback(async () => {
    try {
      if (callManager.hasVideo()) {
        const enabled = callManager.toggleVideo()
        setCallVideoEnabled(enabled)
        return
      }

      setEnablingVideo(true)
      await callManager.enableVideo()
      setCallVideoEnabled(callManager.isVideoEnabled())
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to enable camera"
      toast({
        title: "Camera Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setEnablingVideo(false)
    }
  }, [callManager])

  useEffect(() => {
    if (currentCall?.state === "connected") {
      const interval = setInterval(() => {
        setCallDuration(callManager.getCallDuration())
      }, 1000)
      return () => clearInterval(interval)
    }
    setCallDuration(0)
  }, [currentCall?.state, callManager])

  useEffect(() => {
    callManager.bindSignaling({
      send: (data) => {
        if (!callSubscriptionRef.current) {
          throw new Error("Call signaling is not connected.")
        }
        callSubscriptionRef.current.send(data)
      },
      waitUntilReady: () => waitForSignalingReady(() => signalingReadyRef.current),
    })

    return () => {
      callManager.bindSignaling(null)
    }
  }, [callManager])

  useEffect(() => {
    if (!currentUser?.id) return

    let callSubscription: { unsubscribe: () => void; send: (data: unknown) => void } | null = null
    let consumer: { disconnect: () => void } | null = null

    const setup = async () => {
      try {
        const ActionCableModule = await import("@rails/actioncable")
        const ActionCable = ActionCableModule.default || ActionCableModule
        const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
        if (!token) return

        const cableUrl = getActionCableUrl(token)
        consumer = ActionCable.createConsumer(cableUrl)

        signalingReadyRef.current = false
        callSubscription = consumer.subscriptions.create(
          {
            channel: "CallChannel",
            user_id: Number(currentUser.id),
          },
          {
            connected: () => {
              signalingReadyRef.current = true
            },
            disconnected: () => {
              signalingReadyRef.current = false
            },
            rejected: () => {
              signalingReadyRef.current = false
              toast({
                title: "Call Channel Error",
                description: "Failed to connect to call channel. Please refresh the page.",
                variant: "destructive",
              })
            },
            received: async (data: Record<string, unknown>) => {
              if (data.type === "call-offer") {
                const recipientId = Number(
                  (data.to as { id?: number })?.id ?? data.to_id
                )
                if (recipientId !== Number(currentUser.id)) return
                if (callManager.getCurrentCall()) return
                await handleIncomingCall(data)
                return
              }

              if (
                data.type === "call-answer" ||
                data.type === "ice-candidate" ||
                data.type === "call-end" ||
                data.type === "call-renegotiate-offer" ||
                data.type === "call-renegotiate-answer"
              ) {
                await callManager.handleSignalingMessage(data)
                return
              }

              if (data.type === "call-reject") {
                const cur = callManager.getCurrentCall()
                if (cur?.direction === "outgoing") {
                  toast({
                    title: "Call Declined",
                    description: `${cur.to.name} declined your call`,
                    variant: "default",
                  })
                  const sink = callEventSinkRef.current
                  if (sink?.onCallRejected) {
                    Promise.resolve(
                      sink.onCallRejected({
                        call: cur,
                        otherUser: cur.to,
                        rejectedByThem: true,
                      })
                    ).catch(() => {})
                  }
                }
                await callManager.handleSignalingMessage(data)
              }
            },
          }
        )

        callSubscriptionRef.current = callSubscription
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to setup call listener"
        toast({
          title: "Call Setup Error",
          description: message,
          variant: "destructive",
        })
      }
    }

    setup()
    return () => {
      signalingReadyRef.current = false
      callSubscriptionRef.current = null
      if (callSubscription) callSubscription.unsubscribe()
      if (consumer) consumer.disconnect()
    }
  }, [currentUser?.id, handleIncomingCall, callManager])

  const startCall = useCallback(
    async (
      to: { id: number; name: string; email: string },
      options?: StartCallOptions
    ) => {
      if (!currentUser) return
      const from = {
        id: Number(currentUser.id),
        name: currentUser.name ?? "",
        email: currentUser.email ?? "",
      }
      try {
        await callManager.startCall(from, { ...to, id: Number(to.id) }, options)
        setCallMuted(callManager.isMuted())
        setCallVideoEnabled(callManager.isVideoEnabled())
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to start call"
        toast({
          title: "Call Error",
          description: message,
          variant: "destructive",
        })
        throw error
      }
    },
    [currentUser, callManager]
  )

  const value: CallContextValue = {
    callManager,
    currentCall,
    localStream,
    remoteStream,
    callDuration,
    callMuted,
    callVideoEnabled,
    acceptingCall,
    enablingVideo,
    setCallEventSink,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleCallMute,
    toggleCallVideo,
    formatDuration,
  }

  return (
    <CallContext.Provider value={value}>
      {children}
      {currentCall && (
        <>
          <CallNotification
            call={currentCall}
            localStream={localStream}
            remoteStream={remoteStream}
            onAccept={acceptCall}
            onReject={rejectCall}
            onEnd={endCall}
            onMuteToggle={toggleCallMute}
            onVideoToggle={() => void toggleCallVideo()}
            isMuted={callMuted}
            isVideoEnabled={callVideoEnabled}
            hasLocalVideo={callManager.hasVideo()}
            hasRemoteVideo={(remoteStream?.getVideoTracks().length ?? 0) > 0}
            callDuration={callDuration}
            acceptingCall={acceptingCall}
            enablingVideo={enablingVideo}
          />
          {remoteStream &&
            !localStream?.getVideoTracks().some((t) => t.enabled) &&
            !remoteStream.getVideoTracks().some((t) => t.enabled) && (
            <CallAudio stream={remoteStream} />
          )}
        </>
      )}
    </CallContext.Provider>
  )
}
