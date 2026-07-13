"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type MultilinePunchline = {
  kind: "multiline"
  lines: [string, string, string]
}

type TextPunchline = {
  kind: "text"
  text: string
}

type Punchline = MultilinePunchline | TextPunchline

const HIGHLIGHT_WORDS = new Set(["one", "hire", "manage", "workforce", "enterprise", "complete", "HR", "management",  "company"])

const PUNCHLINES: Punchline[] = [
  // {
  //   kind: "multiline",
  //   lines: ["The Complete", "HR Management", "Solution"],
  // },
  {
    kind: "text",
    text: "The Complete HR Management Solution"
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

const ENTER_MS = 500
const HOLD_MS = 2800
const EXIT_MS = 400

type Phase = "enter" | "hold" | "exit"

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

interface RotatingHeadlineProps {
  className?: string
}

export function RotatingHeadline({ className }: RotatingHeadlineProps) {
  const [punchlineIndex, setPunchlineIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("enter")

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    if (phase === "enter") {
      timeout = setTimeout(() => setPhase("hold"), ENTER_MS)
    } else if (phase === "hold") {
      timeout = setTimeout(() => setPhase("exit"), HOLD_MS)
    } else {
      timeout = setTimeout(() => {
        setPunchlineIndex((index) => (index + 1) % PUNCHLINES.length)
        setPhase("enter")
      }, EXIT_MS)
    }

    return () => clearTimeout(timeout)
  }, [phase])

  const punchline = PUNCHLINES[punchlineIndex]

  const motionClass =
    phase === "enter"
      ? "animate-headline-drop-in"
      : phase === "exit"
        ? "animate-headline-fade-out"
        : "opacity-100 translate-y-0"

  return (
    <h1
      className={cn(
        "text-4xl md:text-6xl font-bold text-gray-900 min-h-[9rem] md:min-h-[12rem]",
        className
      )}
    >
      <span key={punchlineIndex} className={cn("inline-block w-full", motionClass)}>
        {punchline.kind === "multiline" ? (
          <>
            <span className="block">{renderHighlightedText(punchline.lines[0])}</span>
            <span className="block text-green-600">{punchline.lines[1]}</span>
            <span className="block">{punchline.lines[2]}</span>
          </>
        ) : (
          renderHighlightedText(punchline.text)
        )}
      </span>
    </h1>
  )
}
