export interface ReportColumn {
  key: string
  label: string
  align?: "left" | "right"
}

export interface ReportSummaryItem {
  label: string
  value: string | number
}

export interface ReportData {
  type: string
  title: string
  description: string
  generated_at: string
  period: {
    start_date: string
    end_date: string
    label: string
  }
  summary: ReportSummaryItem[]
  columns: ReportColumn[]
  rows: Record<string, unknown>[]
}

export interface ReportQuery {
  period?: string
  start_date?: string
  end_date?: string
  month?: string
  year?: string
  date?: string
}
