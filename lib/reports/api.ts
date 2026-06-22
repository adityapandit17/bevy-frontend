import { apiRequest, getApiUrl } from "@/lib/api"
import type { ReportData, ReportQuery } from "./types"

export async function fetchReport(slug: string, query: ReportQuery = {}): Promise<ReportData> {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  const qs = params.toString()
  const url = `${getApiUrl(`/reports/${slug}`)}${qs ? `?${qs}` : ""}`
  const res = await apiRequest<{ success?: boolean; data?: ReportData } & ReportData>(url, {
    suppressToast: true,
  })
  if (res && typeof res === "object" && "data" in res && res.data) {
    return res.data
  }
  return res as ReportData
}
