"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { HuddleWebRTC, HuddleParticipant } from "@/lib/huddle"
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, X, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoCallFullscreenProps {
  huddleWebRTC: HuddleWebRTC | null
  participants: HuddleParticipant[]
  currentUserId: number
  currentUserName: string
  onClose: () => void
  onToggleMute: () => void
  onToggleVideo: () => void
  isMuted: boolean
  isVideoEnabled: boolean
}

export function VideoCallFullscreen({
  huddleWebRTC,
  participants,
  currentUserId,
  currentUserName,
  onClose,
  onToggleMute,
  onToggleVideo,
  isMuted,
  isVideoEnabled,
}: VideoCallFullscreenProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())
  const [isScreenSharing, setIsScreenSharing] = useState(() => {
    return huddleWebRTC?.isScreenSharing() || false
  })
  const [isMinimized, setIsMinimized] = useState(false)

  // Attach local video stream
  useEffect(() => {
    if (huddleWebRTC && localVideoRef.current) {
      const localStream = huddleWebRTC.getLocalStream()
      if (localStream) {
        localVideoRef.current.srcObject = localStream
      }
    }
  }, [huddleWebRTC])

  // Attach remote video streams
  useEffect(() => {
    if (!huddleWebRTC) return

    participants
      .filter((p) => p.id !== currentUserId)
      .forEach((participant) => {
        const remoteStream = huddleWebRTC.getRemoteStream(participant.id)
        const videoElement = remoteVideoRefs.current.get(participant.id)
        if (videoElement && remoteStream) {
          videoElement.srcObject = remoteStream
        }
      })
  }, [huddleWebRTC, participants, currentUserId])

  const handleScreenShare = async () => {
    if (!huddleWebRTC) return

    try {
      const currentlySharing = huddleWebRTC.isScreenSharing()
      if (currentlySharing) {
        await huddleWebRTC.stopScreenShare()
        setIsScreenSharing(false)
      } else {
        await huddleWebRTC.startScreenShare()
        setIsScreenSharing(true)
      }
    } catch (error: any) {
      console.error("Screen share error:", error)
    }
  }

  // Update screen sharing state when huddleWebRTC changes
  useEffect(() => {
    if (huddleWebRTC) {
      setIsScreenSharing(huddleWebRTC.isScreenSharing())
    }
  }, [huddleWebRTC])

  const remoteParticipants = participants.filter((p) => p.id !== currentUserId)

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black flex flex-col",
        isMinimized && "w-96 h-64 bottom-4 right-4 top-auto left-auto rounded-lg shadow-2xl"
      )}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-semibold">Video Call</h2>
          <span className="text-white/70 text-sm">
            {participants.length} {participants.length === 1 ? "participant" : "participants"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 grid gap-2 p-2" style={{
        gridTemplateColumns: remoteParticipants.length === 0 
          ? "1fr" 
          : remoteParticipants.length === 1 
          ? "1fr 1fr" 
          : remoteParticipants.length === 2
          ? "1fr 1fr"
          : "repeat(2, 1fr)",
        gridTemplateRows: remoteParticipants.length <= 2 
          ? "1fr" 
          : "repeat(2, 1fr)"
      }}>
        {/* Local Video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {currentUserName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-3 py-1 rounded flex items-center gap-2">
            <span>{currentUserName} (You)</span>
            {isScreenSharing && (
              <Monitor className="h-3 w-3" />
            )}
          </div>
        </div>

        {/* Remote Videos */}
        {remoteParticipants.map((participant) => {
          const remoteStream = huddleWebRTC?.getRemoteStream(participant.id)
          return (
            <div key={participant.id} className="relative bg-gray-900 rounded-lg overflow-hidden">
              {remoteStream ? (
                <video
                  ref={(el) => {
                    if (el) {
                      remoteVideoRefs.current.set(participant.id, el)
                      el.srcObject = remoteStream
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl">
                      {participant.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-3 py-1 rounded">
                {participant.name}
              </div>
            </div>
          )
        })}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full h-14 w-14"
            onClick={onToggleMute}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          <Button
            variant={!isVideoEnabled ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full h-14 w-14"
            onClick={onToggleVideo}
          >
            {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="lg"
            className="rounded-full h-14 w-14"
            onClick={handleScreenShare}
          >
            {isScreenSharing ? (
              <MonitorOff className="h-6 w-6" />
            ) : (
              <Monitor className="h-6 w-6" />
            )}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            className="rounded-full h-14 w-14"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
