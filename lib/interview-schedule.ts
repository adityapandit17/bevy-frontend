/** Local calendar date as YYYY-MM-DD */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

/** Minutes from midnight for "HH:MM" */
export function timeToMinutes(time: string): number | null {
  const [hh, mm] = (time || "").split(":").map(Number)
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null
  return hh * 60 + mm
}

export function parseScheduledDateTime(scheduledDate: string, scheduledTime: string): Date | null {
  const [y, m, d] = scheduledDate.split("-").map(Number)
  const minutes = timeToMinutes(scheduledTime)
  if (!y || !m || !d || minutes === null) return null
  const hh = Math.floor(minutes / 60)
  const mm = minutes % 60
  return new Date(y, m - 1, d, hh, mm, 0, 0)
}

export function isScheduleInPast(
  scheduledDate: string,
  scheduledTime: string,
  now: Date = new Date()
): boolean {
  const scheduled = parseScheduledDateTime(scheduledDate, scheduledTime)
  if (!scheduled) return false
  return scheduled.getTime() < now.getTime()
}

/** Earliest selectable time today (5-minute steps), or undefined if date is not today */
export function minScheduleTimeForDate(
  scheduledDate: string,
  now: Date = new Date(),
  stepMinutes = 5
): string | undefined {
  if (!scheduledDate || scheduledDate !== localDateKey(now)) return undefined

  let h = now.getHours()
  let m = now.getMinutes()
  const step = Math.max(1, stepMinutes)
  m = Math.ceil(m / step) * step
  if (m >= 60) {
    h += 1
    m = 0
  }
  if (h >= 24) return "23:55"
  return `${pad2(h)}:${pad2(m)}`
}

export const SCHEDULE_IN_PAST_MESSAGE =
  "Interview cannot be scheduled in the past. Choose a future date and time."
