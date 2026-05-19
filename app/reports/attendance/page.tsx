"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth } from "date-fns"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts"
import { apiRequest, getEndpointUrl } from "@/lib/api"
import { ResourceGuard } from "@/lib/auth/auth.guards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertTriangle, Users, Clock } from "lucide-react"

interface ComplianceRow {
  employee_id: number
  employee_name: string
  department_name?: string
  total_hours_worked: number
  required_hours_to_date: number
  hours_behind_schedule: number
  compliance_percent: number
  average_daily_hours: number
  not_marked_days: number
  absent_days: number
}

interface ComplianceReport {
  start_date: string
  end_date: string
  weekly_working_hours: number
  employees: ComplianceRow[]
  summary: {
    total_employees: number
    behind_schedule_count: number
    average_compliance_percent: number
  }
}

export default function AttendanceComplianceReportPage() {
  const [report, setReport] = useState<ComplianceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"))

  const fetchReport = async () => {
    setLoading(true)
    try {
      const [y, m] = month.split("-").map(Number)
      const start = format(startOfMonth(new Date(y, m - 1)), "yyyy-MM-dd")
      const end = format(endOfMonth(new Date(y, m - 1)), "yyyy-MM-dd")
      const url = `${getEndpointUrl("ATTENDANCE_COMPLIANCE_REPORT")}?start_date=${start}&end_date=${end}`
      const data = await apiRequest<ComplianceReport>(url, { suppressToast: true })
      setReport(data)
    } catch {
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [month])

  const chartData = useMemo(() => {
    if (!report?.employees) return []
    return report.employees
      .filter((e) => e.hours_behind_schedule > 0)
      .slice(0, 12)
      .map((e) => ({
        name: e.employee_name.split(" ")[0],
        behind: e.hours_behind_schedule,
        worked: e.total_hours_worked,
        required: e.required_hours_to_date,
      }))
  }, [report])

  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      options.push({
        value: format(d, "yyyy-MM"),
        label: format(d, "MMMM yyyy"),
      })
    }
    return options
  }, [])

  return (
    <ResourceGuard
      resourceKeys={["reports", "leave_management", "attendance_records"]}
      pageName="Attendance compliance report"
    >
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
              <Link href="/reports">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to reports
              </Link>
            </Button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Attendance & hours compliance</h1>
            <p className="text-gray-600">
              Employees behind weekly hour targets ({report?.weekly_working_hours ?? 40}h/week)
            </p>
          </div>
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
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">Loading report…</CardContent>
          </Card>
        ) : !report ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">Unable to load compliance data.</CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <Users className="w-10 h-10 text-blue-600 bg-blue-50 p-2 rounded-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Employees tracked</p>
                    <p className="text-2xl font-bold">{report.summary.total_employees}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <AlertTriangle className="w-10 h-10 text-red-600 bg-red-50 p-2 rounded-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Behind schedule</p>
                    <p className="text-2xl font-bold text-red-600">{report.summary.behind_schedule_count}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <Clock className="w-10 h-10 text-green-600 bg-green-50 p-2 rounded-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Avg compliance</p>
                    <p className="text-2xl font-bold">{report.summary.average_compliance_percent}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Hours behind schedule</CardTitle>
                  <CardDescription>Top employees below required hours (month to date)</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" unit="h" />
                      <YAxis type="category" dataKey="name" width={80} />
                      <Tooltip />
                      <Bar dataKey="behind" name="Hours behind" radius={[0, 4, 4, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill="#ef4444" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All employees</CardTitle>
                <CardDescription>Worked vs required hours and compliance progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Worked</TableHead>
                        <TableHead className="text-right">Required</TableHead>
                        <TableHead className="text-right">Behind</TableHead>
                        <TableHead className="text-right">Avg/day</TableHead>
                        <TableHead>Compliance</TableHead>
                        <TableHead>Issues</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.employees.map((row) => (
                        <TableRow key={row.employee_id}>
                          <TableCell className="font-medium">{row.employee_name}</TableCell>
                          <TableCell>{row.department_name || "—"}</TableCell>
                          <TableCell className="text-right">{row.total_hours_worked}h</TableCell>
                          <TableCell className="text-right">{row.required_hours_to_date}h</TableCell>
                          <TableCell className="text-right">
                            {row.hours_behind_schedule > 0 ? (
                              <span className="text-red-600 font-medium">{row.hours_behind_schedule}h</span>
                            ) : (
                              <span className="text-green-600">On track</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{row.average_daily_hours}h</TableCell>
                          <TableCell className="min-w-[140px]">
                            <div className="flex items-center gap-2">
                              <Progress value={Math.min(row.compliance_percent, 100)} className="h-2 flex-1" />
                              <span className="text-xs w-10">{row.compliance_percent}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {row.not_marked_days > 0 && (
                              <Badge variant="outline" className="text-red-600 mr-1">
                                {row.not_marked_days} unmarked
                              </Badge>
                            )}
                            {row.absent_days > 0 && (
                              <Badge variant="outline" className="text-orange-600">
                                {row.absent_days} absent
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ResourceGuard>
  )
}
