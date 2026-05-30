export const INTERVIEW_DURATION_PRESETS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
] as const

export type InterviewDurationPreset = (typeof INTERVIEW_DURATION_PRESETS)[number]["value"] | "custom"

export function durationPresetFromMinutes(minutes?: number | null): InterviewDurationPreset {
  const m = minutes ?? 60
  if (m === 15) return "15"
  if (m === 30) return "30"
  if (m === 60) return "60"
  return "custom"
}

export function durationMinutesFromForm(preset: string, customMinutes: string): number {
  if (preset === "custom") {
    const parsed = parseInt(customMinutes, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 60
  }
  return parseInt(preset, 10) || 60
}
