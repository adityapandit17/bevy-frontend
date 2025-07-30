"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Users,
  UserCheck,
  Clock,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  Calendar,
  FileText,
  Plus,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Network,
} from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const stats = [
    {
      title: "Total Employees",
      value: "248",
      change: "+12 this month",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Present Today",
      value: "231",
      change: "93.1% attendance",
      trend: "up",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "On Leave",
      value: "17",
      change: "6.9% on leave",
      trend: "down",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Monthly Payroll",
      value: "₹45.2L",
      change: "+8.2% from last month",
      trend: "up",
      icon: IndianRupee,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: "New Employee",
      description: "Priya Sharma joined as Software Developer",
      time: "2 hours ago",
      status: "success",
    },
    {
      id: 2,
      type: "Leave Request",
      description: "Rahul Kumar requested 3 days leave",
      time: "4 hours ago",
      status: "pending",
    },
    {
      id: 3,
      type: "Payroll",
      description: "October payroll processed successfully",
      time: "1 day ago",
      status: "success",
    },
    {
      id: 4,
      type: "Interview",
      description: "Interview scheduled with Anjali Patel",
      time: "2 days ago",
      status: "info",
    },
    {
      id: 5,
      type: "Performance Review",
      description: "Q3 reviews completed for Engineering team",
      time: "3 days ago",
      status: "success",
    },
  ]

  const pendingTasks = [
    {
      id: 1,
      title: "Review Leave Applications",
      count: 5,
      priority: "high",
      dueDate: "Today",
    },
    {
      id: 2,
      title: "Approve Expense Reports",
      count: 12,
      priority: "medium",
      dueDate: "Tomorrow",
    },
    {
      id: 3,
      title: "Update Employee Records",
      count: 8,
      priority: "low",
      dueDate: "This Week",
    },
    {
      id: 4,
      title: "Process Salary Increments",
      count: 3,
      priority: "high",
      dueDate: "End of Week",
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: "Team Building Event",
      date: "Nov 15, 2024",
      time: "10:00 AM",
      attendees: 45,
    },
    {
      id: 2,
      title: "Performance Review Meeting",
      date: "Nov 18, 2024",
      time: "2:00 PM",
      attendees: 12,
    },
    {
      id: 3,
      title: "New Employee Orientation",
      date: "Nov 20, 2024",
      time: "9:00 AM",
      attendees: 8,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening at your company.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <p className={`text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest updates from your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === "success"
                        ? "bg-green-500"
                        : activity.status === "pending"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Scheduled events and meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 rounded-lg border hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {event.date} at {event.time}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{event.attendees} attendees</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {task.count}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Due: {task.dueDate}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions for faster workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Users className="w-6 h-6" />
                <span className="text-sm">Add Employee</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Mark Attendance</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <IndianRupee className="w-6 h-6" />
                <span className="text-sm">Process Payroll</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <FileText className="w-6 h-6" />
                <span className="text-sm">Generate Report</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 bg-transparent"
                onClick={() => router.push('/assets')}
              >
                <Package className="w-6 h-6" />
                <span className="text-sm">Asset Tracking</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 bg-transparent"
                onClick={() => router.push('/org-chart')}
              >
                <Network className="w-6 h-6" />
                <span className="text-sm">Org Chart</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
