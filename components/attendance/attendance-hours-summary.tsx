"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, TrendingDown, TrendingUp, Target } from "lucide-react"

export interface AttendanceComplianceSummary {
  weekly_working_hours: number
  daily_target_hours: number
  total_hours_worked: number
  required_hours_to_date: number
  required_hours_month: number
  average_daily_hours: number
  hours_behind_schedule: number
  compliance_percent: number
  present_days: number
  absent_days: number
  not_marked_days: number
  leave_days: number
}

interface AttendanceHoursSummaryProps {
  compliance: AttendanceComplianceSummary | null
  loading?: boolean
}

export function AttendanceHoursSummary({ compliance, loading }: AttendanceHoursSummaryProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-gray-500">Loading hours summary…</CardContent>
      </Card>
    )
  }

  if (!compliance) return null

  const behind = compliance.hours_behind_schedule > 0
  const ahead = compliance.total_hours_worked > compliance.required_hours_to_date

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Monthly hours
        </CardTitle>
        <CardDescription>
          Based on {compliance.weekly_working_hours}h/week target ({compliance.daily_target_hours}h per workday)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Total worked</p>
            <p className="text-xl font-bold">{compliance.total_hours_worked}h</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg / day (present)</p>
            <p className="text-xl font-bold">{compliance.average_daily_hours}h</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Required (to date)</p>
            <p className="text-xl font-bold flex items-center gap-1">
              <Target className="w-4 h-4 text-gray-400" />
              {compliance.required_hours_to_date}h
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{behind ? "Behind schedule" : "Ahead / on track"}</p>
            <p className={`text-xl font-bold flex items-center gap-1 ${behind ? "text-red-600" : "text-green-600"}`}>
              {behind ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              {behind ? `${compliance.hours_behind_schedule}h` : `${(compliance.total_hours_worked - compliance.required_hours_to_date).toFixed(1)}h`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Schedule compliance</span>
            <span className="font-medium">{compliance.compliance_percent}%</span>
          </div>
          <Progress value={Math.min(compliance.compliance_percent, 100)} className="h-2" />
          <p className="text-xs text-gray-500">
            Month target: {compliance.required_hours_month}h · Present {compliance.present_days} · Absent {compliance.absent_days} · Not marked {compliance.not_marked_days} · Leave {compliance.leave_days}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
