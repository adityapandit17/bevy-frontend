"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type TimePickerValue = string // "HH:MM"

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function parseValue(value: TimePickerValue) {
  const [hh, mm] = (value || "").split(":")
  const h = Number(hh)
  const m = Number(mm)
  if (Number.isFinite(h) && Number.isFinite(m)) return { h, m }
  return { h: 9, m: 0 }
}

function to12h(h24: number) {
  const ampm = h24 >= 12 ? "PM" : "AM"
  let h = h24 % 12
  if (h === 0) h = 12
  return { h12: h, ampm }
}

function to24h(h12: number, ampm: "AM" | "PM") {
  if (ampm === "AM") return h12 === 12 ? 0 : h12
  return h12 === 12 ? 12 : h12 + 12
}

function formatDisplay(value: TimePickerValue) {
  if (!value) return ""
  const { h, m } = parseValue(value)
  const { h12, ampm } = to12h(h)
  return `${h12}:${pad2(m)} ${ampm}`
}

export function TimePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a time",
  stepMinutes = 5,
  className,
}: {
  value: TimePickerValue
  onChange: (next: TimePickerValue) => void
  disabled?: boolean
  placeholder?: string
  stepMinutes?: number
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const { h, m } = parseValue(value)
  const initial12 = to12h(h)
  const [hour, setHour] = React.useState<number>(initial12.h12)
  const [minute, setMinute] = React.useState<number>(m)
  const [ampm, setAmpm] = React.useState<"AM" | "PM">(initial12.ampm as any)

  React.useEffect(() => {
    const parsed = parseValue(value)
    const t12 = to12h(parsed.h)
    setHour(t12.h12)
    setMinute(parsed.m)
    setAmpm(t12.ampm as any)
  }, [value])

  const minutesList = React.useMemo(() => {
    const step = Math.max(1, Math.min(30, stepMinutes))
    const out: number[] = []
    for (let i = 0; i < 60; i += step) out.push(i)
    return out
  }, [stepMinutes])

  const apply = () => {
    const h24 = to24h(hour, ampm)
    onChange(`${pad2(h24)}:${pad2(minute)}`)
    setOpen(false)
  }

  const clear = () => {
    onChange("")
    setOpen(false)
  }

  // Some pointer/scroll environments (trackpads, nested popovers) can block default wheel scrolling.
  // Force wheel scrolling on the list container so users can scroll naturally without dragging the scrollbar.
  const forceWheelScroll: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget
    if (!el) return
    // If content is scrollable, consume wheel and move scrollTop.
    if (el.scrollHeight > el.clientHeight) {
      e.preventDefault()
      e.stopPropagation()
      el.scrollTop += e.deltaY
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 text-gray-500" />
          {value ? formatDisplay(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600">Hour</div>
            <div
              className="max-h-44 overflow-y-auto touch-pan-y overscroll-contain rounded-md border bg-white [-webkit-overflow-scrolling:touch]"
              onWheel={forceWheelScroll}
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const v = i + 1
                const active = v === hour
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setHour(v)}
                    className={cn(
                      "w-full px-3 py-2 text-sm text-left hover:bg-gray-50",
                      active && "bg-green-50 text-green-800 font-medium"
                    )}
                  >
                    {v}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600">Minute</div>
            <div
              className="max-h-44 overflow-y-auto touch-pan-y overscroll-contain rounded-md border bg-white [-webkit-overflow-scrolling:touch]"
              onWheel={forceWheelScroll}
            >
              {minutesList.map((v) => {
                const active = v === minute
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMinute(v)}
                    className={cn(
                      "w-full px-3 py-2 text-sm text-left hover:bg-gray-50",
                      active && "bg-green-50 text-green-800 font-medium"
                    )}
                  >
                    {pad2(v)}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600">AM/PM</div>
            <div className="rounded-md border bg-white overflow-hidden">
              {(["AM", "PM"] as const).map((v) => {
                const active = v === ampm
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmpm(v)}
                    className={cn(
                      "w-full px-3 py-2 text-sm text-left hover:bg-gray-50",
                      active && "bg-green-50 text-green-800 font-medium"
                    )}
                  >
                    {v}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" size="sm" onClick={clear}>
            Clear
          </Button>
          <Button type="button" size="sm" onClick={apply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

