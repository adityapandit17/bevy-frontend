"use client"

import { useMemo, useState, type ComponentType } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Download,
  FileText,
  TrendingUp,
  Users,
  IndianRupee,
  Calendar,
  Clock,
  PieChart,
  Activity,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResourceGuard } from "@/lib/auth/auth.guards"
import { REPORT_CATEGORIES, REPORTS, reportsByCategory, type ReportCategory } from "@/lib/reports/config"
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

export default function ReportsPage() {
  const router = useRouter()
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

  const handleDownload = async (slug: string, customPage?: string) => {
    if (customPage === "hours-compliance") {
      router.push(`/reports/${slug}`)
      return
    }
    setDownloadingSlug(slug)
    try {
      const data = await fetchReport(slug, { period })
      downloadReportCsv(data)
      toast({ title: "Download started", description: "Report exported as CSV." })
    } catch {
      toast({
        title: "Download failed",
        description: "Could not generate the report.",
        variant: "destructive",
      })
    } finally {
      setDownloadingSlug(null)
    }
  }

  const reportRowActions = (slug: string, customPage?: string) => (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" asChild title="View report">
        <Link href={`/reports/${slug}`}>
          <FileText className="w-4 h-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        title="Download CSV"
        disabled={downloadingSlug === slug}
        onClick={() => handleDownload(slug, customPage)}
      >
        {downloadingSlug === slug ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </Button>
    </div>
  )

  const tabValueForCategory = (key: ReportCategory) => {
    const map: Record<ReportCategory, string> = {
      employee: "employee",
      attendance: "attendance",
      payroll: "payroll",
      leave: "leave",
      performance: "performance",
      recruitment: "recruitment",
    }
    return map[key]
  }

  return (
    <ResourceGuard resourceKeys={["reports"]} pageName="Reports">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-2xl sm:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Generate insights and track organizational metrics</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available reports</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{REPORTS.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{REPORT_CATEGORIES.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <BarChart className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data sources</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">Live</p>
                <p className="text-sm text-gray-500 mt-1">From HRMS database</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Export format</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">CSV</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <Download className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="hrms-tabs-scroll">
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="employee">Employee</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="leave">Leave</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {categoriesWithReports.map((category) => (
                <Card key={category.key} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.bgColor}`}>
                        <category.icon className={`w-5 h-5 ${category.color}`} />
                      </div>
                      {category.title}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.reports.map((report) => (
                        <div
                          key={report.slug}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium text-gray-900 text-sm">{report.name}</p>
                            <p className="text-xs text-gray-500">{report.description}</p>
                          </div>
                          {reportRowActions(report.slug, report.customPage)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {categoriesWithReports.map((category) => (
            <TabsContent key={category.key} value={tabValueForCategory(category.key)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.bgColor}`}>
                      <category.icon className={`w-5 h-5 ${category.color}`} />
                    </div>
                    {category.title}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {category.reports.map((report) => (
                      <div
                        key={report.slug}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-medium text-gray-900">{report.name}</p>
                          <p className="text-sm text-gray-600">{report.description}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/reports/${report.slug}`}>
                              <FileText className="w-4 h-4 mr-2" />
                              View
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={downloadingSlug === report.slug}
                            onClick={() => handleDownload(report.slug, report.customPage)}
                          >
                            {downloadingSlug === report.slug ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ResourceGuard>
  )
}
