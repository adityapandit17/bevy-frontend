"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Video, VideoOff, Mic, MicOff, X, Maximize2, Minimize2 } from "lucide-react"
import { CallData } from "@/lib/webrtc-call"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface VideoCallViewProps {
  call: CallData
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isMuted: boolean
  isVideoEnabled: boolean
  onClose: () => void
  onToggleMute: () => void
  onToggleVideo: () => void
  callDuration: number
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function VideoCallView({
  call,
  localStream,
  remoteStream,
  isMuted,
  isVideoEnabled,
  onClose,
  onToggleMute,
  onToggleVideo,
  callDuration,
}: VideoCallViewProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const otherUser = call.direction === 'outgoing' ? call.to : call.from

  // Attach local video stream
  useEffect(() => {
    const videoEl = localVideoRef.current
    if (!videoEl) return
    
    if (localStream && isVideoEnabled) {
      const videoTracks = localStream.getVideoTracks()
      console.log('📹 Attaching local video stream:', {
        hasStream: !!localStream,
        videoTracks: videoTracks.length,
        tracks: videoTracks.map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState }))
      })
      
      if (videoTracks.length > 0) {
        // Set srcObject - autoPlay attribute will handle playing
        videoEl.srcObject = localStream
      } else {
        videoEl.srcObject = null
      }
    } else {
      videoEl.srcObject = null
    }
    
    return () => {
      // Cleanup handled by React
    }
  }, [localStream, isVideoEnabled])

  // Attach remote video stream
  useEffect(() => {
    const videoEl = remoteVideoRef.current
    if (!videoEl) return
    
    if (remoteStream) {
      const videoTracks = remoteStream.getVideoTracks()
      const audioTracks = remoteStream.getAudioTracks()
      console.log('📹 Attaching remote video stream:', {
        hasStream: !!remoteStream,
        videoTracks: videoTracks.length,
        audioTracks: audioTracks.length,
        tracks: remoteStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState }))
      })
      
      // Set srcObject - autoPlay attribute will handle playing
      videoEl.srcObject = remoteStream
    } else {
      videoEl.srcObject = null
    }
    
    return () => {
      // Cleanup handled by React
    }
  }, [remoteStream])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const videoContent = (
    <div className={cn(
      "bg-black flex flex-col relative",
      isFullscreen ? "fixed inset-0 z-50" : "w-full h-full"
    )}>
      {/* Remote Video (Main View) */}
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
            onLoadedMetadata={() => {
              console.log('✅ Remote video metadata loaded')
              // autoPlay should handle this, but ensure play if paused
              if (remoteVideoRef.current && remoteVideoRef.current.paused) {
                const playPromise = remoteVideoRef.current.play()
                if (playPromise !== undefined) {
                  playPromise.catch((error) => {
                    // Ignore "interrupted" errors (AbortError) - they're expected when srcObject changes
                    if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                      console.error('Failed to play remote video on metadata load:', error)
                    }
                  })
                }
              }
            }}
          onError={(e) => {
            console.error('❌ Remote video error:', e)
          }}
          style={{ display: remoteStream && remoteStream.getVideoTracks().length > 0 ? 'block' : 'none' }}
        />
        {(!remoteStream || remoteStream.getVideoTracks().length === 0) && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <Avatar className="h-32 w-32 mx-auto mb-4">
                <AvatarFallback className="text-4xl">
                  {otherUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-white text-sm">
                {remoteStream ? 'Waiting for video...' : 'Connecting...'}
              </p>
            </div>
          </div>
        )}
        
        {/* User Info Overlay */}
        <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg">
          <p className="font-semibold">{otherUser.name}</p>
          <p className="text-sm text-gray-300">{formatDuration(callDuration)}</p>
        </div>
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white/20">
        {localStream && isVideoEnabled ? (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            onLoadedMetadata={() => {
              console.log('✅ Local video metadata loaded')
              if (localVideoRef.current && localVideoRef.current.paused) {
                const playPromise = localVideoRef.current.play()
                if (playPromise !== undefined) {
                  playPromise.catch((error) => {
                    // Ignore "interrupted" errors as they're expected when srcObject changes
                    if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                      console.error('Failed to play local video on metadata load:', error)
                    }
                  })
                }
              }
            }}
            onError={(e) => {
              console.error('❌ Local video error:', e)
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback>
                {call.from.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
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
            variant="secondary"
            size="lg"
            className="rounded-full h-14 w-14"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
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

  if (isFullscreen) {
    return videoContent
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 border-none bg-black [&>button]:hidden">
        {videoContent}
      </DialogContent>
    </Dialog>
  )
}
