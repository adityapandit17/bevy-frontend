"use client"

import { useMemo, useState, type ComponentType } from "react"
import Link from "next/link"
import {
  Download,
  FileText,
  Users,
  Clock,
  IndianRupee,
  Calendar,
  TrendingUp,
  Activity,
  Loader2,
  Database,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResourceGuard } from "@/lib/auth/auth.guards"
import { REPORT_CATEGORIES, reportsByCategory } from "@/lib/reports/config"
import { fetchReport } from "@/lib/reports/api"
import { downloadReportCsv } from "@/lib/reports/csv"
import { toast } from "@/hooks/use-toast"

const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Users,
  Clock,
  IndianRupee,
  Calendar,
  TrendingUp,
  Activity,
}

export default function DataExportsPage() {
  const [period, setPeriod] = useState("month")
  const [downloadingSlug, setDownloadingSlug] = useState<string | null>(null)

  const categoriesWithReports = useMemo(
    () =>
      REPORT_CATEGORIES.map((cat) => ({
        ...cat,
        icon: CATEGORY_ICONS[cat.icon] || FileText,
        reports: reportsByCategory(cat.key),
      })),
    []
  )

  const handleDownload = async (slug: string) => {
    setDownloadingSlug(slug)
    try {
      const data = await fetchReport(slug, { period })
      downloadReportCsv(data)
      toast({ title: "Export ready", description: "Your CSV download has started." })
    } catch {
      toast({
        title: "Export failed",
        description: "Could not generate the export file.",
        variant: "destructive",
      })
    } finally {
      setDownloadingSlug(null)
    }
  }

  return (
    <ResourceGuard resource="reports" action="index">
      <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-8 h-8 text-primary" />
              Data Exports
            </h1>
            <p className="text-gray-600 mt-1">
              Download company data as CSV. Exports are scoped to your organization.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Period</span>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="quarter">This quarter</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 text-sm text-gray-700">
            Need charts and summaries? Visit{" "}
            <Link href="/reports" className="text-primary font-medium hover:underline">
              Reports
            </Link>{" "}
            for interactive analytics. This page is for raw data exports your admin team can share or import elsewhere.
          </CardContent>
        </Card>

        <div className="space-y-6">
          {categoriesWithReports.map((category) => (
            <Card key={category.key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <category.icon className={`w-5 h-5 ${category.color}`} />
                  {category.title}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {category.reports.map((report) => (
                    <div
                      key={report.slug}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{report.name}</p>
                        <p className="text-sm text-gray-500">{report.description}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!report.customPage && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={downloadingSlug === report.slug}
                            onClick={() => handleDownload(report.slug)}
                          >
                            {downloadingSlug === report.slug ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-2" />
                            )}
                            Export CSV
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/reports/${report.slug}`}>
                            <FileText className="w-4 h-4 mr-2" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ResourceGuard>
  )
}
