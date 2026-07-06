"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Eraser } from "lucide-react"

interface SignaturePadProps {
  onChange?: (isEmpty: boolean) => void
  className?: string
}

export interface SignaturePadHandle {
  clear: () => void
  isEmpty: () => boolean
  toDataURL: () => string | null
}

export function SignaturePad({ onChange, className }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const hasStroke = useRef(false)
  const [empty, setEmpty] = useState(true)

  const getContext = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext("2d")
  }, [])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.scale(ratio, ratio)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = 2
    ctx.strokeStyle = "#111827"
  }, [])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [resizeCanvas])

  const updateEmptyState = useCallback(
    (nextEmpty: boolean) => {
      hasStroke.current = !nextEmpty
      setEmpty(nextEmpty)
      onChange?.(nextEmpty)
    },
    [onChange]
  )

  const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getContext()
    if (!ctx) return

    isDrawing.current = true
    canvasRef.current?.setPointerCapture(e.pointerId)
    const { x, y } = getCoords(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return
    const ctx = getContext()
    if (!ctx) return

    const { x, y } = getCoords(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    if (empty) updateEmptyState(false)
  }

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return
    isDrawing.current = false
    canvasRef.current?.releasePointerCapture(e.pointerId)
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = getContext()
    if (!canvas || !ctx) return

    const ratio = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio)
    updateEmptyState(true)
  }

  return (
    <div className={className}>
      <div className="relative rounded-lg border-2 border-dashed border-gray-300 bg-white">
        <canvas
          ref={canvasRef}
          className="h-40 w-full touch-none cursor-crosshair"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
        />
        {empty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            Sign here with mouse or touch
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          <Eraser className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  )
}

export function useSignaturePadRef() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hasStroke = useRef(false)

  return {
    canvasRef,
    clear: () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const ratio = window.devicePixelRatio || 1
      ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio)
      hasStroke.current = false
    },
    isEmpty: () => !hasStroke.current,
    toDataURL: (): string | null => {
      const canvas = canvasRef.current
      if (!canvas || !hasStroke.current) return null
      return canvas.toDataURL("image/png")
    },
  }
}
