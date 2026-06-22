"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react"
import { fetchReport } from "@/lib/reports/api"
import { downloadReportCsv } from "@/lib/reports/csv"
import type { ReportData, ReportQuery } from "@/lib/reports/types"
import type { ReportDefinition } from "@/lib/reports/config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ResourceGuard } from "@/lib/auth/auth.guards"
import { toast } from "@/hooks/use-toast"

const PERIOD_OPTIONS = [
  { value: "month", label: "This month" },
  { value: "week", label: "This week" },
  { value: "quarter", label: "This quarter" },
  { value: "year", label: "This year" },
]

interface ReportViewerProps {
  definition: ReportDefinition
}

export function ReportViewer({ definition }: ReportViewerProps) {
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"))

  const query: ReportQuery = useMemo(() => {
    if (definition.slug === "monthly-payroll" || definition.slug === "tax-deductions") {
      const [y, m] = month.split("-").map(Number)
      const d = new Date(y, m - 1, 1)
      return { month: format(d, "MMMM yyyy") }
    }
    if (definition.slug === "leave-balance") {
      return { year: month.split("-")[0] }
    }
    if (definition.slug === "daily-attendance") {
      return { date: format(new Date(), "yyyy-MM-dd") }
    }
    return { period }
  }, [definition.slug, period, month])

  const loadReport = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchReport(definition.slug, query)
      setReport(data)
    } catch {
      setReport(null)
      toast({
        title: "Report unavailable",
        description: "Could not load report data. Check permissions or try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [definition.slug, query])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const handleDownload = () => {
    if (!report) return
    downloadReportCsv(report)
  }

  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      options.push({ value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy") })
    }
    return options
  }, [])

  const showMonthPicker =
    definition.slug === "monthly-payroll" ||
    definition.slug === "tax-deductions" ||
    definition.slug === "leave-balance"

  return (
    <ResourceGuard resourceKeys={["reports"]} pageName={definition.name}>
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
              <Link href="/reports">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to reports
              </Link>
            </Button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{definition.name}</h1>
            <p className="text-gray-600">{definition.description}</p>
            {report?.period?.label && (
              <p className="text-sm text-gray-500 mt-1">Period: {report.period.label}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {showMonthPicker ? (
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : definition.slug !== "daily-attendance" && definition.slug !== "hiring-pipeline" ? (
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={!report || loading}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-16 flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating report…
            </CardContent>
          </Card>
        ) : !report ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">No data available for this report.</CardContent>
          </Card>
        ) : (
          <>
            {report.summary?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {report.summary.map((item) => (
                  <Card key={item.label}>
                    <CardContent className="p-5">
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="text-2xl font-bold mt-1">{item.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Report data
                </CardTitle>
                <CardDescription>
                  Generated {format(new Date(report.generated_at), "MMM d, yyyy h:mm a")} · {report.rows.length} rows
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.rows.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No records for the selected period.</p>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {report.columns.map((col) => (
                            <TableHead
                              key={col.key}
                              className={col.align === "right" ? "text-right" : undefined}
                            >
                              {col.label}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.rows.map((row, idx) => (
                          <TableRow key={idx}>
                            {report.columns.map((col) => (
                              <TableCell
                                key={col.key}
                                className={col.align === "right" ? "text-right" : undefined}
                              >
                                {row[col.key] == null || row[col.key] === "" ? "—" : String(row[col.key])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ResourceGuard>
  )
}
