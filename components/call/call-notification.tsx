"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Loader2 } from "lucide-react"
import { CallData } from "@/lib/webrtc-call"
import { attachMediaStream } from "@/lib/safe-media-play"
import { cn } from "@/lib/utils"

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

interface CallNotificationProps {
  call: CallData
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  onAccept: () => void | Promise<void>
  onReject: () => void
  onEnd: () => void
  onMuteToggle: () => void
  onVideoToggle: () => void
  isMuted: boolean
  isVideoEnabled: boolean
  callDuration?: number
  acceptingCall?: boolean
}

export function CallNotification({
  call,
  localStream,
  remoteStream,
  onAccept,
  onReject,
  onEnd,
  onMuteToggle,
  onVideoToggle,
  isMuted,
  isVideoEnabled,
  callDuration = 0,
  acceptingCall = false,
}: CallNotificationProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const displayDuration = call.state === "connected" ? callDuration : 0
  const isVideoCall = call.mediaType === "video"

  useEffect(() => {
    const el = localVideoRef.current
    void attachMediaStream(el, localStream)
    return () => {
      if (el) {
        el.pause()
        el.srcObject = null
      }
    }
  }, [localStream])

  useEffect(() => {
    const el = remoteVideoRef.current
    void attachMediaStream(el, remoteStream)
    return () => {
      if (el) {
        el.pause()
        el.srcObject = null
      }
    }
  }, [remoteStream])

  useEffect(() => {
    if (call.state === "ringing" && call.direction === "incoming") {
      const audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)()
      let intervalId: ReturnType<typeof setInterval> | null = null

      const playRing = () => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 800
        oscillator.type = "sine"
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      }

      playRing()
      intervalId = setInterval(playRing, 2000)

      return () => {
        if (intervalId) clearInterval(intervalId)
        audioContext.close()
      }
    }
  }, [call.state, call.direction])

  const caller = call.direction === "incoming" ? call.from : call.to
  const isIncoming = call.direction === "incoming"
  const isConnected = call.state === "connected"
  const isRinging = call.state === "ringing"
  const isCalling = call.state === "calling"
  const showVideoStage = isVideoCall && (isConnected || localStream)

  return (
    <div
      data-testid="call-notification"
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm",
        "animate-in fade-in duration-200"
      )}
    >
      <div
        className={cn(
          "bg-card rounded-lg shadow-xl p-6 sm:p-8 w-full mx-4 animate-in zoom-in-95 duration-200",
          isVideoCall && isConnected ? "max-w-4xl" : "max-w-lg"
        )}
      >
        {showVideoStage && (
          <div className="relative mb-6">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              {isConnected ? (
                <video
                  ref={remoteVideoRef}
                  playsInline
                  autoPlay
                  className="h-full w-full object-cover"
                  data-testid="call-remote-video"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/70 text-sm">
                  {isCalling ? "Starting camera…" : "Waiting to connect…"}
                </div>
              )}
              {localStream && (
                <div className="absolute bottom-3 right-3 w-32 sm:w-40 aspect-video rounded-lg overflow-hidden border-2 border-white/20 shadow-lg bg-black">
                  <video
                    ref={localVideoRef}
                    playsInline
                    muted
                    autoPlay
                    className="h-full w-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                    data-testid="call-local-video"
                  />
                </div>
              )}
              {isConnected && (
                <span className="absolute top-3 left-3 text-xs bg-black/60 text-white px-2 py-1 rounded">
                  {caller.name}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          {!showVideoStage ? (
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarFallback className="text-2xl">
                {caller.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : null}
          <h3 className="text-xl font-semibold mb-1">{caller.name}</h3>
          <p className="text-sm text-muted-foreground">{caller.email}</p>
          <div className="mt-4">
            {(isRinging || isCalling) && (
              <p className="text-sm text-muted-foreground animate-pulse" data-testid="call-status-ringing">
                {isIncoming
                  ? isVideoCall
                    ? "Incoming video call..."
                    : "Incoming call..."
                  : isVideoCall
                    ? "Calling (video)..."
                    : "Calling..."}
              </p>
            )}
            {isConnected && (
              <div className="space-y-1">
                <p className="text-sm text-green-500" data-testid="call-status-connected">
                  {isVideoCall ? "Video connected" : "Connected"}
                </p>
                <p className="text-lg font-mono font-semibold text-green-600" data-testid="call-duration">
                  {formatDuration(displayDuration)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          {isIncoming && isRinging && (
            <>
              <Button
                variant="destructive"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={onReject}
                title="Reject"
                data-testid="call-reject-btn"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
                disabled={acceptingCall}
                onClick={() => void onAccept()}
                title="Accept"
                data-testid="call-accept-btn"
              >
                {acceptingCall ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Phone className="h-6 w-6" />
                )}
              </Button>
            </>
          )}

          {!isIncoming && (isCalling || isRinging) && (
            <Button
              variant="destructive"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={onEnd}
              title="Cancel Call"
              data-testid="call-cancel-btn"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          )}

          {isConnected && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={onMuteToggle}
                title={isMuted ? "Unmute" : "Mute"}
                data-testid="call-mute-btn"
              >
                {isMuted ? (
                  <MicOff className="h-5 w-5 text-destructive" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
              {isVideoCall && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={onVideoToggle}
                  title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                  data-testid="call-video-toggle-btn"
                >
                  {isVideoEnabled ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5 text-destructive" />
                  )}
                </Button>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={onEnd}
                title="End Call"
                data-testid="call-end-btn"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
