"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, TrendingUp, Users, DollarSign, Calendar, BarChart, PieChart, FileText } from "lucide-react"

const reportCategories = [
  {
    title: "Employee Reports",
    description: "Workforce analytics and insights",
    icon: Users,
    reports: [
      { name: "Employee Demographics", description: "Age, gender, department distribution" },
      { name: "Headcount Analysis", description: "Employee count trends over time" },
      { name: "Department Distribution", description: "Staff allocation across departments" },
      { name: "Performance Metrics", description: "Employee performance ratings" },
    ],
  },
  {
    title: "Payroll Reports",
    description: "Compensation and benefits analysis",
    icon: DollarSign,
    reports: [
      { name: "Salary Analysis", description: "Compensation breakdown by role/department" },
      { name: "Benefits Utilization", description: "Employee benefits usage statistics" },
      { name: "Payroll Summary", description: "Monthly payroll processing summary" },
      { name: "Cost Center Analysis", description: "Department-wise cost breakdown" },
    ],
  },
  {
    title: "Attendance Reports",
    description: "Time tracking and leave analysis",
    icon: Calendar,
    reports: [
      { name: "Attendance Summary", description: "Daily/monthly attendance patterns" },
      { name: "Leave Utilization", description: "Leave types and usage trends" },
      { name: "Overtime Analysis", description: "Overtime hours and costs" },
      { name: "Absenteeism Trends", description: "Absence patterns and reasons" },
    ],
  },
  {
    title: "Recruitment Reports",
    description: "Hiring and talent acquisition metrics",
    icon: TrendingUp,
    reports: [
      { name: "Hiring Funnel", description: "Application to hire conversion rates" },
      { name: "Source Effectiveness", description: "Best performing recruitment channels" },
      { name: "Time to Hire", description: "Average hiring timeline analysis" },
      { name: "Candidate Experience", description: "Interview feedback and ratings" },
    ],
  },
]

const quickStats = [
  { title: "Total Reports Generated", value: "1,247", change: "+12% this month", icon: FileText },
  { title: "Active Dashboards", value: "23", change: "5 new this week", icon: BarChart },
  { title: "Scheduled Reports", value: "45", change: "Weekly & Monthly", icon: Calendar },
  { title: "Data Export Requests", value: "89", change: "+8% this month", icon: Download },
]

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate insights and business intelligence</p>
        </div>
        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="categories">Report Categories</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          {/* Report Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportCategories.map((category) => (
              <Card key={category.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <category.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">{category.title}</CardTitle>
                      <CardDescription className="text-gray-600">{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.reports.map((report) => (
                      <div
                        key={report.name}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <p className="text-sm text-gray-600">{report.description}</p>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Generate
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-6">
          {/* Interactive Dashboards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Employee Growth Trends
                </CardTitle>
                <CardDescription className="text-gray-600">Monthly headcount and hiring trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Growth Analytics</h3>
                    <p className="text-gray-600 mb-4">Interactive chart showing employee growth over time</p>
                    <Button className="bg-green-600 hover:bg-green-700">View Dashboard</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Department Distribution
                </CardTitle>
                <CardDescription className="text-gray-600">Employee count and budget by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Department Analytics</h3>
                    <p className="text-gray-600 mb-4">Pie chart showing department-wise distribution</p>
                    <Button className="bg-blue-600 hover:bg-blue-700">View Dashboard</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Payroll Analytics
                </CardTitle>
                <CardDescription className="text-gray-600">Salary trends and cost analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <DollarSign className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Payroll Insights</h3>
                    <p className="text-gray-600 mb-4">Comprehensive salary and benefits analysis</p>
                    <Button className="bg-purple-600 hover:bg-purple-700">View Dashboard</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Attendance Insights
                </CardTitle>
                <CardDescription className="text-gray-600">Attendance patterns and leave analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Attendance Analytics</h3>
                    <p className="text-gray-600 mb-4">Track attendance trends and patterns</p>
                    <Button className="bg-orange-600 hover:bg-orange-700">View Dashboard</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
