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
import {
  WebRTCCallManager,
  CallData,
} from "@/lib/webrtc-call"
import { CallNotification } from "@/components/call/call-notification"
import { CallAudio } from "@/components/call/call-audio"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

export type CallEventType = "accepted" | "rejected" | "ended"

export interface CallEventPayload {
  call: CallData
  duration?: number
  otherUser: { id: number; name: string; email: string }
  /** True when we are the caller and the other party declined */
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
  remoteStream: MediaStream | null
  callDuration: number
  callMuted: boolean
  acceptingCall: boolean
  setCallEventSink: (sink: CallEventSink | null) => void
  startCall: (to: { id: number; name: string; email: string }) => Promise<void>
  acceptCall: () => Promise<void>
  rejectCall: () => void
  endCall: () => void
  toggleCallMute: () => void
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
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [callMuted, setCallMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [acceptingCall, setAcceptingCall] = useState(false)
  const callEventSinkRef = useRef<CallEventSink | null>(null)

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
          setRemoteStream(null)
          setCallDuration(0)
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
    async (data: any) => {
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

      const callData: CallData = {
        callId: data.callId,
        from: data.from,
        to:
          data.to || {
            id: currentUser.id,
            name: currentUser.name ?? "",
            email: currentUser.email ?? "",
          },
        state: "ringing",
        direction: "incoming",
      }

      try {
        await callManager.handleIncomingCall(callData, data.offer)
      } catch (error: any) {
        toast({
          title: "Call Error",
          description: error?.message ?? "Failed to handle incoming call",
          variant: "destructive",
        })
      }
    },
    [currentUser, callManager]
  )

  const acceptCall = useCallback(async () => {
    const call = callManager.getCurrentCall()
    if (!call || call.state !== "ringing") return
    setAcceptingCall(true)
    try {
      await callManager.acceptCall()
      const sink = callEventSinkRef.current
      if (sink?.onCallAccepted) {
        await Promise.resolve(
          sink.onCallAccepted({
            call,
            otherUser: call.from,
          })
        )
      }
    } catch (error: any) {
      toast({
        title: "Call Error",
        description: error?.message ?? "Failed to accept call. Please try again.",
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
      const otherUser =
        call.direction === "outgoing" ? call.to : call.from
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

  useEffect(() => {
    if (currentCall?.state === "connected") {
      const interval = setInterval(() => {
        setCallDuration(callManager.getCallDuration())
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCallDuration(0)
    }
  }, [currentCall?.state, callManager])

  useEffect(() => {
    if (!currentUser?.id) return

    let callSubscription: any = null
    let consumer: any = null

    const setup = async () => {
      try {
        const ActionCableModule = await import("@rails/actioncable")
        const ActionCable = ActionCableModule.default || ActionCableModule
        const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
        if (!token) return

        const protocol = API_BASE_URL.startsWith("https") ? "wss" : "ws"
        const baseUrl = API_BASE_URL.replace(/^https?/, protocol)
        const cableUrl = `${baseUrl}/cable?token=${encodeURIComponent(token)}`
        consumer = ActionCable.createConsumer(cableUrl)
        await new Promise((r) => setTimeout(r, 100))

        callSubscription = consumer.subscriptions.create(
          {
            channel: "CallChannel",
            user_id: Number(currentUser.id),
          },
          {
            connected: () => {},
            disconnected: () => {},
            rejected: () => {
              toast({
                title: "Call Channel Error",
                description:
                  "Failed to connect to call channel. Please refresh the page.",
                variant: "destructive",
              })
            },
            received: async (data: any) => {
              if (data.type === "call-offer") {
                const recipientId = data.to?.id ?? data.to_id
                if (recipientId !== currentUser.id) return
                if (callManager.getCurrentCall()) return
                await handleIncomingCall(data)
              } else if (data.type === "call-answer") {
                callManager.handleSignalingMessage(data)
              } else if (data.type === "call-reject") {
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
                callManager.endCall()
              } else if (data.type === "call-end") {
                callManager.endCall()
              } else if (data.type === "ice-candidate") {
                callManager.handleSignalingMessage(data)
              }
            },
          }
        )
      } catch (error: any) {
        toast({
          title: "Call Setup Error",
          description: error?.message ?? "Failed to setup call listener",
          variant: "destructive",
        })
      }
    }

    setup()
    return () => {
      if (callSubscription) callSubscription.unsubscribe()
      if (consumer) consumer.disconnect()
    }
  }, [currentUser?.id, handleIncomingCall, callManager])

  const startCall = useCallback(
    async (to: { id: number; name: string; email: string }) => {
      if (!currentUser) return
      const from = {
        id: currentUser.id,
        name: currentUser.name ?? "",
        email: currentUser.email ?? "",
      }
      await callManager.startCall(from, to)
    },
    [currentUser, callManager]
  )

  const value: CallContextValue = {
    callManager,
    currentCall,
    remoteStream,
    callDuration,
    callMuted,
    acceptingCall,
    setCallEventSink,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleCallMute,
    formatDuration,
  }

  return (
    <CallContext.Provider value={value}>
      {children}
      {currentCall && (
        <>
          <CallNotification
            call={currentCall}
            onAccept={acceptCall}
            onReject={rejectCall}
            onEnd={endCall}
            onMuteToggle={toggleCallMute}
            isMuted={callMuted}
            callDuration={callDuration}
          />
          {remoteStream && <CallAudio stream={remoteStream} />}
        </>
      )}
    </CallContext.Provider>
  )
}
