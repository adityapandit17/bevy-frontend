"use client"

import { useEffect, useRef } from "react"
import { attachMediaStream } from "@/lib/safe-media-play"

interface CallAudioProps {
  stream: MediaStream | null
}

export function CallAudio({ stream }: CallAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const el = audioRef.current
    void attachMediaStream(el, stream)

    return () => {
      if (el) {
        el.pause()
        el.srcObject = null
      }
    }
  }, [stream])

  return <audio ref={audioRef} playsInline />
}
