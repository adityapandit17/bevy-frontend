"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Plus, Clock, CheckCircle, XCircle, CalendarIcon, MapPin } from "lucide-react"
import { LeaveRequestForm } from "@/components/forms/leave-request-form"

const leaveRequests = [
  {
    id: 1,
    employee: "Rajesh Kumar",
    employeeId: "EMP001",
    type: "Annual Leave",
    startDate: "2024-02-15",
    endDate: "2024-02-20",
    days: 6,
    status: "Pending",
    reason: "Family vacation to Goa",
    appliedDate: "2024-01-20",
    manager: "Priya Sharma",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    employee: "Anita Desai",
    employeeId: "EMP002",
    type: "Sick Leave",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    days: 3,
    status: "Approved",
    reason: "Medical treatment",
    appliedDate: "2024-02-08",
    manager: "Vikram Singh",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    employee: "Suresh Patel",
    employeeId: "EMP003",
    type: "Personal Leave",
    startDate: "2024-02-25",
    endDate: "2024-02-25",
    days: 1,
    status: "Rejected",
    reason: "Personal work",
    appliedDate: "2024-02-20",
    manager: "Kavya Nair",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const attendanceStats = [
  {
    title: "Present Today",
    value: "1,156",
    total: "1,247",
    percentage: "92.7%",
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
  {
    title: "Work from Home",
    value: "46",
    total: "1,247",
    percentage: "3.7%",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: MapPin,
  },
  {
    title: "On Leave",
    value: "32",
    total: "1,247",
    percentage: "2.6%",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    icon: CalendarIcon,
  },
  {
    title: "Absent",
    value: "13",
    total: "1,247",
    percentage: "1.0%",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
]

const holidays = [
  { date: "2024-01-26", name: "Republic Day", type: "National Holiday" },
  { date: "2024-03-08", name: "Holi", type: "Festival" },
  { date: "2024-03-29", name: "Good Friday", type: "Religious Holiday" },
  { date: "2024-04-14", name: "Baisakhi", type: "Festival" },
  { date: "2024-08-15", name: "Independence Day", type: "National Holiday" },
]

const leaveTypes = [
  { name: "Annual Leave", allocated: 21, used: 8, remaining: 13, color: "bg-blue-500" },
  { name: "Sick Leave", allocated: 12, used: 3, remaining: 9, color: "bg-red-500" },
  { name: "Personal Leave", allocated: 5, used: 2, remaining: 3, color: "bg-purple-500" },
  { name: "Maternity Leave", allocated: 180, used: 0, remaining: 180, color: "bg-pink-500" },
]

export function AttendanceLeavePage() {
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState("attendance")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance & Leave</h1>
          <p className="text-gray-600 mt-1">Track attendance and manage leave requests</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Request Leave
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave-requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="leave-balance">Leave Balance</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          {/* Attendance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {attendanceStats.map((stat) => (
              <Card key={stat.title} className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className={`text-xs ${stat.color} mt-1`}>{stat.percentage} of total employees</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Attendance Calendar and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Today's Attendance Summary</CardTitle>
                <CardDescription className="text-gray-600">Real-time attendance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">On Time</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">1,089</p>
                      <p className="text-sm text-gray-600">Arrived before 9:30 AM</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-gray-900">Late Arrivals</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">67</p>
                      <p className="text-sm text-gray-600">Arrived after 9:30 AM</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Punch In/Out System</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Employees can mark attendance using biometric devices or mobile app
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700">View Detailed Report</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Attendance Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border-0"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leave-requests" className="space-y-6">
          <div className="grid gap-6">
            {leaveRequests.map((request) => (
              <Card key={request.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={request.avatar || "/placeholder.svg"}
                        alt={request.employee}
                        className="w-12 h-12 rounded-full bg-gray-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{request.employee}</h3>
                          <Badge variant="outline" className="text-xs">
                            {request.employeeId}
                          </Badge>
                          <Badge
                            className={
                              request.status === "Approved"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : request.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <p className="text-gray-500">Leave Type</p>
                            <p className="font-medium text-gray-900">{request.type}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Duration</p>
                            <p className="font-medium text-gray-900">
                              {request.startDate} to {request.endDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Days</p>
                            <p className="font-medium text-gray-900">{request.days} days</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Applied On</p>
                            <p className="font-medium text-gray-900">{request.appliedDate}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-gray-500 text-sm">Reason</p>
                            <p className="text-gray-900">{request.reason}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-sm">Reporting Manager</p>
                            <p className="text-gray-900">{request.manager}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {request.status === "Pending" && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leave-balance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leaveTypes.map((leave) => (
              <Card key={leave.name} className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${leave.color}`}></div>
                    {leave.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{leave.allocated}</p>
                        <p className="text-sm text-gray-600">Allocated</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{leave.used}</p>
                        <p className="text-sm text-gray-600">Used</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{leave.remaining}</p>
                        <p className="text-sm text-gray-600">Remaining</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${leave.color}`}
                        style={{ width: `${(leave.used / leave.allocated) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      {Math.round((leave.used / leave.allocated) * 100)}% utilized
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="holidays" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Holiday Calendar 2024</CardTitle>
              <CardDescription className="text-gray-600">Company holidays and observances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {holidays.map((holiday, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{holiday.name}</h3>
                        <p className="text-sm text-gray-600">{holiday.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {new Date(holiday.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{new Date(holiday.date).getFullYear()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showForm && <LeaveRequestForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
