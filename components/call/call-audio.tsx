"use client"

import { useEffect, useRef } from "react"
import { MediaStream } from "mediastream"

interface CallAudioProps {
  stream: MediaStream | null
  autoPlay?: boolean
}

export function CallAudio({ stream, autoPlay = true }: CallAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream
      if (autoPlay) {
        audioRef.current.play().catch(console.error)
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.srcObject = null
      }
    }
  }, [stream, autoPlay])

  return <audio ref={audioRef} autoPlay={autoPlay} />
}
