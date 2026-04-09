"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  TrendingUp,
  Target,
  Star,
  FileText,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Download,
  Search,
  CheckCircle,
  AlertCircle,
  Clock3,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
} from "lucide-react"

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false)

  const performanceStats = [
    {
      title: "Active Reviews",
      value: "24",
      change: "+3 this week",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "up",
    },
    {
      title: "Average Rating",
      value: "4.2",
      change: "+0.3 this quarter",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      trend: "up",
    },
    {
      title: "Goals Completed",
      value: "156",
      change: "This quarter",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "up",
    },
    {
      title: "Overdue Reviews",
      value: "3",
      change: "-2 this week",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: "down",
    },
  ]

  const recentReviews = [
    {
      id: "1",
      employeeName: "Sarah Johnson",
      employeePosition: "Senior Developer",
      employeeDepartment: "Engineering",
      reviewType: "quarterly",
      dueDate: "2024-01-20",
      status: "completed",
      reviewer: "Mike Chen",
      rating: 4.5,
    },
    {
      id: "2",
      employeeName: "David Kim",
      employeePosition: "Product Manager",
      employeeDepartment: "Product",
      reviewType: "annual",
      dueDate: "2024-01-25",
      status: "in_progress",
      reviewer: "Lisa Wang",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="w-4 h-4 text-green-600" />
      case "down":
        return <ArrowDownRight className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const handleScheduleReview = () => {
    setShowScheduleDialog(true)
  }

  const handleAddGoal = () => {
    setShowAddGoalDialog(true)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-600">Track, evaluate, and improve employee performance</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddGoalDialog} onOpenChange={setShowAddGoalDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleAddGoal}>
                <Target className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Performance Goal</DialogTitle>
                <DialogDescription>
                  Create a new performance goal for an employee.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="employee" className="text-right">
                    Employee
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="david">David Kim</SelectItem>
                      <SelectItem value="mike">Mike Chen</SelectItem>
                      <SelectItem value="lisa">Lisa Wang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="goal-title" className="text-right">
                    Goal Title
                  </label>
                  <Input
                    id="goal-title"
                    placeholder="Enter goal title"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="goal-description" className="text-right">
                    Description
                  </label>
                  <textarea
                    id="goal-description"
                    placeholder="Describe the goal in detail"
                    className="col-span-3 min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="goal-target" className="text-right">
                    Target
                  </label>
                  <Input
                    id="goal-target"
                    placeholder="e.g., 90% completion, 100 units"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="goal-category" className="text-right">
                    Category
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional Development</SelectItem>
                      <SelectItem value="personal">Personal Growth</SelectItem>
                      <SelectItem value="team">Team Collaboration</SelectItem>
                      <SelectItem value="technical">Technical Skills</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="goal-priority" className="text-right">
                    Priority
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="goal-due-date" className="text-right">
                    Due Date
                  </label>
                  <div className="col-span-3">
                    <DatePicker value={""} onChange={() => {}} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddGoalDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowAddGoalDialog(false)}>
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleScheduleReview}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule Performance Review</DialogTitle>
                <DialogDescription>
                  Schedule a new performance review for an employee.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="employee" className="text-right">
                    Employee
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="david">David Kim</SelectItem>
                      <SelectItem value="mike">Mike Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="review-type" className="text-right">
                    Review Type
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select review type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="probation">Probation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="due-date" className="text-right">
                    Due Date
                  </label>
                  <div className="col-span-3">
                    <DatePicker value={""} onChange={() => {}} />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="reviewer" className="text-right">
                    Reviewer
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mike">Mike Chen</SelectItem>
                      <SelectItem value="lisa">Lisa Wang</SelectItem>
                      <SelectItem value="john">John Smith</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowScheduleDialog(false)}>
                  Schedule Review
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceStats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    {getTrendIcon(stat.trend)}
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Overview
                </CardTitle>
                <CardDescription>Key performance indicators and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Code Quality Score</h4>
                        <p className="text-sm text-gray-600">Engineering</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">92%</span>
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-500">Target: 90%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Customer Satisfaction</h4>
                        <p className="text-sm text-gray-600">Support</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">4.6/5</span>
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-500">Target: 4.5/5</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Review Completed</p>
                      <p className="text-xs text-gray-600">Sarah Johnson's quarterly review</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Goal Updated</p>
                      <p className="text-xs text-gray-600">David Kim's mobile app goal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock3 className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Review Due</p>
                      <p className="text-xs text-gray-600">3 reviews due this week</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Performance Reviews
              </CardTitle>
              <CardDescription>All scheduled and completed performance reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Review Type</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {review.employeeName.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{review.employeeName}</p>
                              <p className="text-sm text-gray-600">{review.employeePosition}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {review.reviewType.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(review.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(review.status)}>
                            {review.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {review.rating ? (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{review.rating}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>{review.reviewer}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Review
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Export PDF
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Goals Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Goals Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Goals</span>
                    <span className="text-2xl font-bold text-gray-900">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-2xl font-bold text-green-600">18</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="text-2xl font-bold text-blue-600">4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overdue</span>
                    <span className="text-2xl font-bold text-red-600">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Active Goals
                </CardTitle>
                <CardDescription>Current goals and their progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Complete API Documentation</h4>
                      <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Document all REST APIs for the new platform</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                      <span>Due: Jan 31, 2024</span>
                      <span>Assigned by: Mike Chen</span>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Launch Mobile App</h4>
                      <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Successfully launch the new mobile application</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                      <span>Due: Feb 15, 2024</span>
                      <span>Assigned by: Lisa Wang</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Trends
                </CardTitle>
                <CardDescription>Quarterly performance trends across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Engineering</p>
                      <p className="text-sm text-gray-600">Average Rating: 4.3</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">+12%</p>
                      <p className="text-sm text-gray-600">vs last quarter</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Product</p>
                      <p className="text-sm text-gray-600">Average Rating: 4.1</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">+8%</p>
                      <p className="text-sm text-gray-600">vs last quarter</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goal Completion Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Goal Completion Rates
                </CardTitle>
                <CardDescription>Goal completion rates by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Professional Goals</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Personal Goals</span>
                    <div className="flex items-center gap-2">
                      <Progress value={72} className="w-20 h-2" />
                      <span className="text-sm font-medium">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Team Goals</span>
                    <div className="flex items-center gap-2">
                      <Progress value={91} className="w-20 h-2" />
                      <span className="text-sm font-medium">91%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Reports
              </CardTitle>
              <CardDescription>Generate and download performance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-32 flex-col gap-2">
                  <FileText className="w-8 h-8" />
                  <span>Quarterly Report</span>
                  <span className="text-sm text-gray-500">Q4 2024</span>
                </Button>
                <Button variant="outline" className="h-32 flex-col gap-2">
                  <Users className="w-8 h-8" />
                  <span>Team Performance</span>
                  <span className="text-sm text-gray-500">All Teams</span>
                </Button>
                <Button variant="outline" className="h-32 flex-col gap-2">
                  <Target className="w-8 h-8" />
                  <span>Goal Analysis</span>
                  <span className="text-sm text-gray-500">2024 Goals</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 