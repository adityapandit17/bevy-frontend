import type { ReportColumn, ReportData } from "./types"

function escapeCsvCell(value: unknown): string {
  const str = value == null ? "" : String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function reportToCsv(report: ReportData): string {
  const header = report.columns.map((c) => escapeCsvCell(c.label)).join(",")
  const body = report.rows.map((row) =>
    report.columns.map((col: ReportColumn) => escapeCsvCell(row[col.key])).join(",")
  )
  return [header, ...body].join("\n")
}

export function downloadReportCsv(report: ReportData): void {
  const csv = reportToCsv(report)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${report.type}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
