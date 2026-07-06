"use client"

import React, { useState, useEffect, useMemo } from "react"
import { apiRequest, getEndpointUrl } from "@/lib/api"
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
  Loader2,
} from "lucide-react"

interface PerformanceStats {
  active_reviews: number
  average_rating: number
  goals_completed: number
  overdue_reviews: number
  total_reviews: number
}

interface PerformanceReview {
  id: number
  employee_id: number
  employee_name: string
  employee_department: string | null
  period: string
  rating: number | null
  reviewer: string
  review_date: string
  rating_description?: string
  formatted_review_date?: string
}

interface PerformanceGoal {
  id: number
  employee_id: number
  employee_name: string
  employee_department: string | null
  title: string
  description: string
  target: string
  progress: number
  status: string
  status_label?: string
  due_date: string
  formatted_due_date?: string
  completion_status?: string
}

interface Employee {
  id: number
  first_name: string
  last_name: string
  name?: string
  designation?: string
}

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false)
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [goals, setGoals] = useState<PerformanceGoal[]>([])
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  useEffect(() => {
    if (showScheduleDialog || showAddGoalDialog) {
      fetchEmployees()
    }
  }, [showScheduleDialog, showAddGoalDialog])

  const fetchPerformanceData = async () => {
    setLoading(true)
    try {
      const [statsData, reviewsData, goalsData] = await Promise.all([
        apiRequest<PerformanceStats>(getEndpointUrl("PERFORMANCE_REVIEWS_STATS"), { suppressToast: true }),
        apiRequest<PerformanceReview[]>(getEndpointUrl("PERFORMANCE_REVIEWS"), { suppressToast: true }),
        apiRequest<PerformanceGoal[]>(getEndpointUrl("PERFORMANCE_GOALS"), { suppressToast: true }),
      ])
      setStats(statsData)
      setReviews(Array.isArray(reviewsData) ? reviewsData : [])
      setGoals(Array.isArray(goalsData) ? goalsData : [])
    } catch (error) {
      console.error("Error fetching performance data:", error)
      setStats(null)
      setReviews([])
      setGoals([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    setLoadingEmployees(true)
    try {
      const response = await apiRequest<any>(`${getEndpointUrl("EMPLOYEES")}?per_page=1000`, { suppressToast: true })
      const list = Array.isArray(response) ? response : response?.data ?? response?.employees ?? []
      setEmployees(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error("Error fetching employees:", error)
      setEmployees([])
    } finally {
      setLoadingEmployees(false)
    }
  }

  const performanceStats = useMemo(() => [
    {
      title: "Active Reviews",
      value: stats ? String(stats.active_reviews) : "—",
      change: stats ? `${stats.total_reviews} total` : "Loading...",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "neutral" as const,
    },
    {
      title: "Average Rating",
      value: stats ? String(stats.average_rating) : "—",
      change: "Across all reviews",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      trend: "up" as const,
    },
    {
      title: "Goals Completed",
      value: stats ? String(stats.goals_completed) : "—",
      change: "All time",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "up" as const,
    },
    {
      title: "Overdue Reviews",
      value: stats ? String(stats.overdue_reviews) : "—",
      change: "Needs attention",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: stats && stats.overdue_reviews > 0 ? ("down" as const) : ("neutral" as const),
    },
  ], [stats])

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const term = searchTerm.toLowerCase()
      const matchesSearch =
        !term ||
        review.employee_name?.toLowerCase().includes(term) ||
        review.reviewer?.toLowerCase().includes(term) ||
        review.period?.toLowerCase().includes(term) ||
        review.employee_department?.toLowerCase().includes(term)

      const reviewStatus = review.rating != null ? "completed" : "pending"
      const matchesStatus = filterStatus === "all" || reviewStatus === filterStatus

      return matchesSearch && matchesStatus
    })
  }, [reviews, searchTerm, filterStatus])

  const activeGoals = useMemo(
    () => goals.filter((g) => ["in_progress", "not_started", "overdue"].includes(g.status)),
    [goals]
  )

  const goalsOverview = useMemo(() => ({
    total: goals.length,
    completed: goals.filter((g) => g.status === "completed").length,
    inProgress: goals.filter((g) => g.status === "in_progress").length,
    overdue: goals.filter((g) => g.status === "overdue").length,
  }), [goals])

  const departmentRatings = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>()
    reviews.forEach((review) => {
      if (review.rating == null) return
      const dept = review.employee_department || "Unassigned"
      const entry = map.get(dept) || { total: 0, count: 0 }
      entry.total += Number(review.rating)
      entry.count += 1
      map.set(dept, entry)
    })
    return Array.from(map.entries())
      .map(([department, { total, count }]) => ({
        department,
        averageRating: (total / count).toFixed(1),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [reviews])

  const goalStatusRates = useMemo(() => {
    if (goals.length === 0) return []
    const statuses = ["completed", "in_progress", "not_started", "overdue"] as const
    return statuses.map((status) => {
      const count = goals.filter((g) => g.status === status).length
      return {
        label: status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        rate: Math.round((count / goals.length) * 100),
      }
    })
  }, [goals])

  const recentActivity = useMemo(() => {
    const items: { type: string; title: string; subtitle: string; color: string; icon: typeof CheckCircle }[] = []
    reviews.slice(0, 2).forEach((review) => {
      items.push({
        type: "review",
        title: "Review Completed",
        subtitle: `${review.employee_name}'s ${review.period} review`,
        color: "bg-green-50",
        icon: CheckCircle,
      })
    })
    goals.slice(0, 2).forEach((goal) => {
      items.push({
        type: "goal",
        title: goal.status === "completed" ? "Goal Completed" : "Goal Updated",
        subtitle: `${goal.employee_name}: ${goal.title}`,
        color: goal.status === "overdue" ? "bg-yellow-50" : "bg-blue-50",
        icon: goal.status === "overdue" ? Clock3 : Target,
      })
    })
    if (stats && stats.overdue_reviews > 0) {
      items.push({
        type: "overdue",
        title: "Reviews Overdue",
        subtitle: `${stats.overdue_reviews} review${stats.overdue_reviews > 1 ? "s" : ""} need attention`,
        color: "bg-yellow-50",
        icon: Clock3,
      })
    }
    return items.slice(0, 5)
  }, [reviews, goals, stats])

  const getEmployeeName = (employee: Employee) =>
    employee.name || `${employee.first_name} ${employee.last_name}`.trim()

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
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-2xl sm:text-3xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-600">Track, evaluate, and improve employee performance</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={showAddGoalDialog} onOpenChange={setShowAddGoalDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleAddGoal} className="w-full sm:w-auto">
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
                      {loadingEmployees ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : employees.length === 0 ? (
                        <SelectItem value="none" disabled>No employees found</SelectItem>
                      ) : (
                        employees.map((employee) => (
                          <SelectItem key={employee.id} value={String(employee.id)}>
                            {getEmployeeName(employee)}
                          </SelectItem>
                        ))
                      )}
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
              <Button size="sm" onClick={handleScheduleReview} className="w-full sm:w-auto">
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
                      {loadingEmployees ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : employees.length === 0 ? (
                        <SelectItem value="none" disabled>No employees found</SelectItem>
                      ) : (
                        employees.map((employee) => (
                          <SelectItem key={employee.id} value={String(employee.id)}>
                            {getEmployeeName(employee)}
                          </SelectItem>
                        ))
                      )}
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
                      {loadingEmployees ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : employees.length === 0 ? (
                        <SelectItem value="none" disabled>No employees found</SelectItem>
                      ) : (
                        employees.map((employee) => (
                          <SelectItem key={employee.id} value={String(employee.id)}>
                            {getEmployeeName(employee)}
                          </SelectItem>
                        ))
                      )}
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {loading && !stats ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          performanceStats.map((stat) => (
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
          ))
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="hrms-tabs-scroll">
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
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : departmentRatings.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No review data available yet.</p>
                ) : (
                  <div className="space-y-4">
                    {departmentRatings.map((dept) => (
                      <div key={dept.department} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{dept.department}</h4>
                            <p className="text-sm text-gray-600">{dept.count} review{dept.count !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">{dept.averageRating}/5</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          </div>
                          <p className="text-sm text-gray-500">Avg. rating</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No recent activity.</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((item, index) => (
                      <div key={index} className={`flex items-center gap-3 p-3 ${item.color} rounded-lg`}>
                        <item.icon className="w-5 h-5 text-gray-700" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-600">{item.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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
                  <SelectTrigger className="w-full sm:w-40">
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
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : filteredReviews.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-12">No performance reviews found.</p>
              ) : (
                <>
                <div className="hidden md:block overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Review Type</TableHead>
                        <TableHead>Review Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Reviewer</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>
                                  {review.employee_name?.split(" ").map((n) => n[0]).join("") || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{review.employee_name}</p>
                                <p className="text-sm text-gray-600">{review.employee_department || "—"}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {review.period?.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {review.formatted_review_date ||
                              (review.review_date ? new Date(review.review_date).toLocaleDateString() : "—")}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(review.rating != null ? "completed" : "pending")}>
                              {review.rating != null ? "completed" : "pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {review.rating != null ? (
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

                <div className="md:hidden space-y-3">
                  {filteredReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 space-y-3 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback>
                              {review.employee_name?.split(" ").map((n) => n[0]).join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{review.employee_name}</p>
                            <p className="text-sm text-gray-600 truncate">{review.employee_department || "—"}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(review.rating != null ? "completed" : "pending")}>
                          {review.rating != null ? "completed" : "pending"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Type</span>
                          <p className="font-medium capitalize">{review.period?.replace("_", " ")}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Date</span>
                          <p className="font-medium">
                            {review.formatted_review_date ||
                              (review.review_date ? new Date(review.review_date).toLocaleDateString() : "—")}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Rating</span>
                          <p className="font-medium">
                            {review.rating != null ? (
                              <span className="inline-flex items-center gap-1">
                                {review.rating}
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              </span>
                            ) : "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Reviewer</span>
                          <p className="font-medium truncate">{review.reviewer}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            <MoreHorizontal className="w-4 h-4 mr-2" />
                            Actions
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
                    </div>
                  ))}
                </div>
                </>
              )}
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
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Goals</span>
                      <span className="text-2xl font-bold text-gray-900">{goalsOverview.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="text-2xl font-bold text-green-600">{goalsOverview.completed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="text-2xl font-bold text-blue-600">{goalsOverview.inProgress}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Overdue</span>
                      <span className="text-2xl font-bold text-red-600">{goalsOverview.overdue}</span>
                    </div>
                  </div>
                )}
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
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : activeGoals.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No active goals.</p>
                ) : (
                  <div className="space-y-4">
                    {activeGoals.map((goal) => (
                      <div key={goal.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{goal.title}</h4>
                          <Badge className={getStatusColor(goal.status)}>
                            {goal.status_label || goal.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                          <span>
                            Due: {goal.formatted_due_date ||
                              (goal.due_date ? new Date(goal.due_date).toLocaleDateString() : "—")}
                          </span>
                          <span>{goal.employee_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : departmentRatings.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No performance trends available.</p>
                ) : (
                  <div className="space-y-4">
                    {departmentRatings.map((dept, index) => (
                      <div
                        key={dept.department}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index % 2 === 0 ? "bg-blue-50" : "bg-green-50"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-gray-900">{dept.department}</p>
                          <p className="text-sm text-gray-600">Average Rating: {dept.averageRating}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{dept.count}</p>
                          <p className="text-sm text-gray-600">reviews</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : goalStatusRates.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No goal data available.</p>
                ) : (
                  <div className="space-y-4">
                    {goalStatusRates.map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={item.rate} className="w-20 h-2" />
                          <span className="text-sm font-medium">{item.rate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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