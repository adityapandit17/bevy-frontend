"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

type MultilinePunchline = {
  kind: "multiline"
  lines: [string, string, string]
  highlightLine: number
}

type TextPunchline = {
  kind: "text"
  text: string
}

type Punchline = MultilinePunchline | TextPunchline

const HIGHLIGHT_WORDS = new Set(["one", "hire", "manage", "workforce", "enterprise", "complete", "company"])

const PUNCHLINES: Punchline[] = [
  {
    kind: "multiline",
    lines: ["The Complete", "HR Management", "Solution"],
    highlightLine: 1,
  },
  {
    kind: "text",
    text: "Not just HR management — a complete enterprise company OS.",
  },
  {
    kind: "text",
    text: "Hire smarter. Pay faster. Manage better.",
  },
  {
    kind: "text",
    text: "One platform for your entire workforce.",
  },
]

const TYPE_SPEED_MS = 55
const DELETE_SPEED_MS = 30
const PAUSE_MS = 2800

function getFlatText(punchline: Punchline): string {
  if (punchline.kind === "multiline") {
    return punchline.lines.join(" ")
  }
  return punchline.text
}

function getTypedMultiline(punchline: MultilinePunchline, charCount: number) {
  const segments = punchline.lines
  let remaining = charCount

  return segments.map((line, index) => {
    if (remaining <= 0) return ""
    const slice = line.slice(0, Math.min(remaining, line.length))
    remaining -= slice.length
    if (index < segments.length - 1 && remaining > 0) {
      remaining -= 1
    }
    return slice
  }) as [string, string, string]
}

function renderHighlightedText(text: string) {
  return text.split(/(\s+|[^\s]+)/).map((part, index) => {
    if (!part) return null

    const word = part.replace(/[.,!?;:—–-]/g, "").toLowerCase()
    const isHighlighted = /\w/.test(part) && HIGHLIGHT_WORDS.has(word)

    return (
      <span key={`${part}-${index}`} className={isHighlighted ? "text-green-600" : undefined}>
        {part}
      </span>
    )
  })
}

interface TypewriterHeadlineProps {
  className?: string
}

export function TypewriterHeadline({ className }: TypewriterHeadlineProps) {
  const [punchlineIndex, setPunchlineIndex] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const punchline = PUNCHLINES[punchlineIndex]
  const flatText = useMemo(() => getFlatText(punchline), [punchline])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && charCount < flatText.length) {
      timeout = setTimeout(() => setCharCount((count) => count + 1), TYPE_SPEED_MS)
    } else if (!isDeleting && charCount === flatText.length) {
      timeout = setTimeout(() => setIsDeleting(true), PAUSE_MS)
    } else if (isDeleting && charCount > 0) {
      timeout = setTimeout(() => setCharCount((count) => count - 1), DELETE_SPEED_MS)
    } else if (isDeleting && charCount === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setPunchlineIndex((index) => (index + 1) % PUNCHLINES.length)
      }, 400)
    }

    return () => clearTimeout(timeout)
  }, [charCount, flatText.length, isDeleting])

  useEffect(() => {
    setCharCount(0)
    setIsDeleting(false)
  }, [punchlineIndex])

  if (punchline.kind === "multiline") {
    const [line1, line2, line3] = getTypedMultiline(punchline, charCount)

    return (
      <h1 className={cn("text-4xl md:text-6xl font-bold text-gray-900 min-h-[9rem] md:min-h-[12rem]", className)}>
        <span className="block">{renderHighlightedText(line1)}</span>
        <span className="block text-green-600">{line2}</span>
        <span className="block">{line3}</span>
        <span className="inline-block w-[3px] h-[0.9em] ml-1 bg-green-600 animate-pulse align-middle" aria-hidden />
      </h1>
    )
  }

  const typed = punchline.text.slice(0, charCount)

  return (
    <h1 className={cn("text-4xl md:text-6xl font-bold text-gray-900 min-h-[9rem] md:min-h-[12rem]", className)}>
      <span>{renderHighlightedText(typed)}</span>
      <span className="inline-block w-[3px] h-[0.9em] ml-1 bg-green-600 animate-pulse align-middle" aria-hidden />
    </h1>
  )
}
