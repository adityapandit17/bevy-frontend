"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react"
import { CallData } from "@/lib/webrtc-call"
import { cn } from "@/lib/utils"

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

interface CallNotificationProps {
  call: CallData
  onAccept: () => void
  onReject: () => void
  onEnd: () => void
  onMuteToggle: () => void
  isMuted: boolean
  callDuration?: number
}

export function CallNotification({
  call,
  onAccept,
  onReject,
  onEnd,
  onMuteToggle,
  isMuted,
  callDuration = 0,
}: CallNotificationProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const displayDuration = call.state === 'connected' ? callDuration : 0

  // Play ringtone for incoming calls
  useEffect(() => {
    if (call.state === 'ringing' && call.direction === 'incoming') {
      // Use Web Audio API to generate a ringtone
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      let intervalId: NodeJS.Timeout | null = null

      const playRing = () => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      }

      // Play ring immediately
      playRing()
      
      // Then play every 2 seconds
      intervalId = setInterval(playRing, 2000)
      setIsPlaying(true)

      return () => {
        if (intervalId) {
          clearInterval(intervalId)
        }
        audioContext.close()
        setIsPlaying(false)
      }
    } else {
      setIsPlaying(false)
    }
  }, [call.state, call.direction])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [])

  const caller = call.direction === 'incoming' ? call.from : call.to
  const isIncoming = call.direction === 'incoming'
  const isConnected = call.state === 'connected'
  const isRinging = call.state === 'ringing'
  const isCalling = call.state === 'calling' // Outgoing call state

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        "animate-in fade-in duration-200"
      )}
    >
      {/* Hidden audio element for ringtone */}
      <audio ref={audioRef} preload="auto">
        <source src="/ringtone.mp3" type="audio/mpeg" />
      </audio>

      <div className="bg-card rounded-lg shadow-xl p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
        {/* Caller Info */}
        <div className="text-center mb-6">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarFallback className="text-2xl">
              {caller.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold mb-1">{caller.name}</h3>
          <p className="text-sm text-muted-foreground">{caller.email}</p>
          <div className="mt-4">
            {(isRinging || isCalling) && (
              <p className="text-sm text-muted-foreground animate-pulse">
                {isIncoming ? 'Incoming call...' : 'Calling...'}
              </p>
            )}
            {isConnected && (
              <div className="space-y-1">
                <p className="text-sm text-green-500">Connected</p>
                <p className="text-lg font-mono font-semibold text-green-600">
                  {formatDuration(displayDuration)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Incoming call - show accept/reject */}
          {isIncoming && isRinging && (
            <>
              <Button
                variant="destructive"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onReject()
                }}
                title="Reject"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
                onClick={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('✅ Accept button clicked in CallNotification')
                  await onAccept()
                }}
                title="Accept"
              >
                <Phone className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Outgoing call - show cancel button */}
          {!isIncoming && (isCalling || isRinging) && (
            <Button
              variant="destructive"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={onEnd}
              title="Cancel Call"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          )}
          
          {/* Connected call - show mute and hang up */}
          {isConnected && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={onMuteToggle}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <MicOff className="h-5 w-5 text-destructive" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={onEnd}
                title="End Call"
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
