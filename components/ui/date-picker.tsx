"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type DatePickerValue = string // "YYYY-MM-DD"

function toDate(value?: DatePickerValue | null): Date | undefined {
  if (!value) return undefined
  // value is YYYY-MM-DD
  const [y, m, d] = value.split("-").map((n) => Number(n))
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

function toValue(date?: Date | null): DatePickerValue {
  if (!date) return ""
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function DatePicker({
  value,
  onChange,
  min,
  disabled,
  placeholder = "Pick a date",
  className,
  fromYear,
  toYear,
}: {
  value: DatePickerValue
  onChange: (next: DatePickerValue) => void
  min?: Date
  disabled?: boolean
  placeholder?: string
  className?: string
  /** First year in the year dropdown (default: 1950, or min year when min is set). */
  fromYear?: number
  /** Last year in the year dropdown (default: current year + 30). */
  toYear?: number
}) {
  const selected = toDate(value)
  const today = React.useMemo(() => new Date(), [])
  const minDay = min ? new Date(min.getFullYear(), min.getMonth(), min.getDate()) : undefined

  // Control which month the calendar is showing (enables year jumps)
  const [month, setMonth] = React.useState<Date>(() => {
    const base = selected || today
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  React.useEffect(() => {
    if (!selected) return
    setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1))
  }, [value]) // intentionally key off the external string value

  const years = React.useMemo(() => {
    const currentYear = today.getFullYear()
    const startYear = fromYear ?? (minDay ? minDay.getFullYear() : 1950)
    const endYear = toYear ?? (minDay ? currentYear + 30 : currentYear + 30)
    const start = Math.min(startYear, endYear)
    const end = Math.max(startYear, endYear)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [today, fromYear, toYear, minDay])

  const months = React.useMemo(
    () => [
      { value: 0, label: "Jan" },
      { value: 1, label: "Feb" },
      { value: 2, label: "Mar" },
      { value: 3, label: "Apr" },
      { value: 4, label: "May" },
      { value: 5, label: "Jun" },
      { value: 6, label: "Jul" },
      { value: 7, label: "Aug" },
      { value: 8, label: "Sep" },
      { value: 9, label: "Oct" },
      { value: 10, label: "Nov" },
      { value: 11, label: "Dec" },
    ],
    []
  )

  const monthValue = String(month.getMonth())
  const yearValue = String(month.getFullYear())

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
          {selected ? format(selected, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 touch-pan-y [-webkit-overflow-scrolling:touch]" align="start">
        <div className="flex items-center gap-2 p-3 border-b bg-white">
          <Select
            value={monthValue}
            onValueChange={(v) => setMonth(new Date(month.getFullYear(), Number(v), 1))}
          >
            <SelectTrigger className="h-9 w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yearValue} onValueChange={(v) => setMonth(new Date(Number(v), month.getMonth(), 1))}>
            <SelectTrigger className="h-9 w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => onChange(toValue(d))}
          month={month}
          onMonthChange={setMonth}
          disabled={(d) => (minDay ? d < minDay : false)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

