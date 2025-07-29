"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  UserPlus,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Cake,
} from "lucide-react"
import { useEffect, useState } from "react"

export function DashboardPage() {
  const [stats, setStats] = useState([])
  const [recentApplicants, setRecentApplicants] = useState([])
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([])
  const [payrollAlerts, setPayrollAlerts] = useState([])
  const [attendanceStatus, setAttendanceStatus] = useState({ present: 0, absent: 0, onLeave: 0, workFromHome: 0, total: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Example endpoints, adjust as needed
      const statsRes = await fetch("http://localhost:3000/dashboard_stats")
      const statsData = await statsRes.json()
      setStats(statsData)

      const applicantsRes = await fetch("http://localhost:3000/job_openings")
      const applicantsData = await applicantsRes.json()
      setRecentApplicants(applicantsData)

      const birthdaysRes = await fetch("http://localhost:3000/employees")
      const birthdaysData = await birthdaysRes.json()
      setUpcomingBirthdays(birthdaysData)

      const attendanceRes = await fetch("http://localhost:3000/attendance_records")
      const attendanceData = await attendanceRes.json()
      // Calculate attendanceStatus from attendanceData
      setAttendanceStatus({ present: 0, absent: 0, onLeave: 0, workFromHome: 0, total: 0 })

      const payrollAlertsRes = await fetch("http://localhost:3000/payrolls")
      const payrollAlertsData = await payrollAlertsRes.json()
      setPayrollAlerts(payrollAlertsData)
    } catch (err) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your HR overview for today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applicants */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-900">Recent Job Applicants</CardTitle>
                  <CardDescription className="text-gray-600">Latest 5 applications</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={applicant.avatar || "/placeholder.svg"}
                        alt={applicant.name}
                        className="w-10 h-10 rounded-full bg-gray-200"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{applicant.name}</h3>
                        <p className="text-sm text-gray-600">{applicant.position}</p>
                        <p className="text-xs text-gray-500">
                          {applicant.department} • {applicant.appliedDate}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        applicant.status === "Offer Extended"
                          ? "border-green-200 text-green-700 bg-green-50"
                          : applicant.status === "Interview Scheduled"
                            ? "border-blue-200 text-blue-700 bg-blue-50"
                            : "border-yellow-200 text-yellow-700 bg-yellow-50"
                      }
                    >
                      {applicant.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Attendance Status */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Today's Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Present</span>
                  <span className="font-semibold text-green-600">{attendanceStatus.present}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Work from Home</span>
                  <span className="font-semibold text-blue-600">{attendanceStatus.workFromHome}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">On Leave</span>
                  <span className="font-semibold text-yellow-600">{attendanceStatus.onLeave}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Absent</span>
                  <span className="font-semibold text-red-600">{attendanceStatus.absent}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Attendance Rate</span>
                    <span className="font-bold text-gray-900">
                      {Math.round(
                        ((attendanceStatus.present + attendanceStatus.workFromHome) / attendanceStatus.total) * 100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={((attendanceStatus.present + attendanceStatus.workFromHome) / attendanceStatus.total) * 100}
                    className="mt-2 h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Birthdays */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Cake className="w-5 h-5 text-pink-600" />
                Upcoming Birthdays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingBirthdays.map((birthday, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{birthday.name}</p>
                      <p className="text-sm text-gray-600">{birthday.department}</p>
                    </div>
                    <Badge variant="outline" className="border-pink-200 text-pink-700 bg-pink-50">
                      {birthday.date}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payroll Alerts */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Payroll Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${alert.status === "urgent" ? "bg-red-500" : "bg-blue-500"}`}
                    ></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {alert.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
