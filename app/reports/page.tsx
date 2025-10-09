"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "lucide-react"
import { useEffect, useState } from "react"
import { getEndpointUrl } from "@/lib/api"
import { ResourceGuard } from "@/lib/auth/auth.guards"

export default function ReportsPage() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetch(getEndpointUrl('EMPLOYEES'))
      const data = await res.json()
      setEmployees(data)
    } catch (err) {
      // handle error
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await fetch(getEndpointUrl('DEPARTMENTS'))
      const data = await res.json()
      setDepartments(data)
    } catch (err) {
      // handle error
    }
  }

  // Use employees and departments for mapping or selectors in reports as needed

  const reportCategories = [
    {
      title: "Employee Reports",
      description: "Workforce analytics and employee data",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      reports: [
        {
          name: "Employee Directory",
          description: "Complete employee list with details",
          lastGenerated: "2 hours ago",
        },
        {
          name: "Department Wise Report",
          description: "Employee distribution by department",
          lastGenerated: "1 day ago",
        },
        { name: "New Joiners Report", description: "Recent hires and onboarding status", lastGenerated: "3 days ago" },
        { name: "Employee Turnover", description: "Attrition analysis and trends", lastGenerated: "1 week ago" },
      ],
    },
    {
      title: "Attendance Reports",
      description: "Time tracking and attendance analytics",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
      reports: [
        { name: "Daily Attendance", description: "Today's attendance summary", lastGenerated: "1 hour ago" },
        { name: "Monthly Attendance", description: "Month-wise attendance patterns", lastGenerated: "2 days ago" },
        {
          name: "Late Arrivals Report",
          description: "Employees with frequent late arrivals",
          lastGenerated: "1 week ago",
        },
        { name: "Overtime Report", description: "Overtime hours and compensation", lastGenerated: "3 days ago" },
      ],
    },
    {
      title: "Payroll Reports",
      description: "Salary and compensation analytics",
      icon: IndianRupee,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      reports: [
        { name: "Monthly Payroll", description: "Complete payroll processing report", lastGenerated: "5 days ago" },
        { name: "Salary Structure", description: "Department-wise salary analysis", lastGenerated: "1 week ago" },
        { name: "Tax Deduction Report", description: "TDS, PF, and ESI deductions", lastGenerated: "1 week ago" },
        { name: "Bonus & Incentives", description: "Performance-based payments", lastGenerated: "2 weeks ago" },
      ],
    },
    {
      title: "Leave Reports",
      description: "Leave management and analytics",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      reports: [
        { name: "Leave Balance", description: "Employee leave balances by type", lastGenerated: "1 day ago" },
        { name: "Leave Trends", description: "Seasonal leave patterns", lastGenerated: "1 week ago" },
        { name: "Pending Approvals", description: "Leave requests awaiting approval", lastGenerated: "2 hours ago" },
        { name: "Leave Utilization", description: "Department-wise leave usage", lastGenerated: "3 days ago" },
      ],
    },
    {
      title: "Performance Reports",
      description: "Employee performance and KPI tracking",
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-50",
      reports: [
        { name: "Performance Reviews", description: "Quarterly performance evaluations", lastGenerated: "1 week ago" },
        { name: "Goal Tracking", description: "Employee goal achievement status", lastGenerated: "3 days ago" },
        { name: "Training Reports", description: "Employee skill development progress", lastGenerated: "1 week ago" },
        { name: "Appraisal Summary", description: "Annual appraisal cycle results", lastGenerated: "1 month ago" },
      ],
    },
    {
      title: "Recruitment Reports",
      description: "Hiring process and candidate analytics",
      icon: Activity,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      reports: [
        { name: "Hiring Pipeline", description: "Current recruitment status", lastGenerated: "1 day ago" },
        { name: "Source Analysis", description: "Candidate source effectiveness", lastGenerated: "1 week ago" },
        { name: "Time to Hire", description: "Recruitment process efficiency", lastGenerated: "2 weeks ago" },
        { name: "Interview Feedback", description: "Candidate evaluation summaries", lastGenerated: "3 days ago" },
      ],
    },
  ]

  const quickStats = [
    {
      title: "Reports Generated",
      value: "156",
      change: "This month",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Scheduled Reports",
      value: "24",
      change: "Auto-generated",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Data Points",
      value: "12.5K",
      change: "Analyzed",
      icon: BarChart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Export Downloads",
      value: "89",
      change: "This week",
      icon: Download,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <ResourceGuard resourceKeys={["reports"]}>
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate insights and track organizational metrics</p>
        </div>
        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm">
            <PieChart className="w-4 h-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Categories */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
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
            {reportCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
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
                    {category.reports.map((report, reportIndex) => (
                      <div
                        key={reportIndex}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{report.name}</p>
                          <p className="text-xs text-gray-500">{report.description}</p>
                          <p className="text-xs text-gray-400 mt-1">Last generated: {report.lastGenerated}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {reportCategories.map((category, index) => (
          <TabsContent key={index} value={category.title.toLowerCase().split(" ")[0]} className="space-y-6">
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
                  {category.reports.map((report, reportIndex) => (
                    <div
                      key={reportIndex}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">{report.name}</p>
                          <Badge variant="secondary" className="text-xs">
                            Available
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{report.description}</p>
                        <p className="text-xs text-gray-400 mt-1">Last generated: {report.lastGenerated}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          Generate
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
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
