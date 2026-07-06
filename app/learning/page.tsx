"use client"

import { useState, useEffect, useMemo } from "react"
import { apiRequest, getEndpointUrl } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  Calendar,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Play,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Edit,
  Trash2,
  Upload,
  Star,
  Target,
  TrendingUp,
  FileText,
  Video,
  Book,
  Award as Certificate,
  UserCheck,
  CalendarDays,
  BarChart3,
  Loader2,
} from "lucide-react"

interface TrainingStats {
  total: number
  completed: number
  in_progress: number
  upcoming: number
  total_hours: number
}

interface EmployeeTraining {
  id: number
  employee_id: number
  employee_name: string
  employee_department: string | null
  name: string
  training_type: string
  training_type_label?: string
  provider: string
  start_date: string
  end_date: string
  formatted_start_date?: string
  formatted_end_date?: string
  status: string
  status_label?: string
  progress: number
  certificate: string | null
  hours: number
  cost?: number
  cost_formatted?: string
  skills?: string
  skills_list?: string[]
  completion_status?: string
}

export default function LearningPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [trainings, setTrainings] = useState<EmployeeTraining[]>([])
  const [currentTrainings, setCurrentTrainings] = useState<EmployeeTraining[]>([])
  const [upcomingTrainings, setUpcomingTrainings] = useState<EmployeeTraining[]>([])
  const [stats, setStats] = useState<TrainingStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTrainingData()
  }, [])

  const fetchTrainingData = async () => {
    setLoading(true)
    try {
      const [statsData, allTrainings, current, upcoming] = await Promise.all([
        apiRequest<TrainingStats>(getEndpointUrl("EMPLOYEE_TRAININGS_STATS"), { suppressToast: true }),
        apiRequest<EmployeeTraining[]>(getEndpointUrl("EMPLOYEE_TRAININGS"), { suppressToast: true }),
        apiRequest<EmployeeTraining[]>(getEndpointUrl("EMPLOYEE_TRAININGS_CURRENT"), { suppressToast: true }),
        apiRequest<EmployeeTraining[]>(getEndpointUrl("EMPLOYEE_TRAININGS_UPCOMING"), { suppressToast: true }),
      ])
      setStats(statsData)
      setTrainings(Array.isArray(allTrainings) ? allTrainings : [])
      setCurrentTrainings(Array.isArray(current) ? current : [])
      setUpcomingTrainings(Array.isArray(upcoming) ? upcoming : [])
    } catch (error) {
      console.error("Error fetching training data:", error)
      setStats(null)
      setTrainings([])
      setCurrentTrainings([])
      setUpcomingTrainings([])
    } finally {
      setLoading(false)
    }
  }

  const avgCompletionRate = useMemo(() => {
    if (trainings.length === 0) return 0
    const total = trainings.reduce((sum, t) => sum + (t.progress || 0), 0)
    return Math.round(total / trainings.length)
  }, [trainings])

  const certificationCount = useMemo(
    () => trainings.filter((t) => t.status === "completed" && t.certificate).length,
    [trainings]
  )

  const inProgressAssignments = useMemo(
    () => trainings.filter((t) => t.status === "in_progress"),
    [trainings]
  )

  const sessionTrainings = useMemo(
    () => [...currentTrainings, ...upcomingTrainings],
    [currentTrainings, upcomingTrainings]
  )

  const certifications = useMemo(
    () => trainings.filter((t) => t.status === "completed" && t.certificate),
    [trainings]
  )

  const trainingCategories = useMemo(() => {
    const types = new Set(trainings.map((t) => t.training_type_label || t.training_type))
    return Array.from(types).filter(Boolean)
  }, [trainings])

  const filteredCourses = useMemo(() => {
    return trainings.filter((training) => {
      const term = searchTerm.toLowerCase()
      const matchesSearch =
        !term ||
        training.name?.toLowerCase().includes(term) ||
        training.provider?.toLowerCase().includes(term) ||
        training.employee_name?.toLowerCase().includes(term)

      const category = training.training_type_label || training.training_type
      const matchesCategory = categoryFilter === "all" || category === categoryFilter
      const matchesStatus = statusFilter === "all" || training.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [trainings, searchTerm, categoryFilter, statusFilter])

  const getDurationLabel = (training: EmployeeTraining) => {
    if (!training.start_date || !training.end_date) return "—"
    const start = new Date(training.start_date)
    const end = new Date(training.end_date)
    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return days === 1 ? "1 day" : `${days} days`
  }

  const getSessionStatus = (training: EmployeeTraining) => {
    if (currentTrainings.some((t) => t.id === training.id)) return "active"
    if (upcomingTrainings.some((t) => t.id === training.id)) return "upcoming"
    return training.status
  }

  const getStatusBadge = (status: string) => {
    const normalized = status.replace("_", "-")
    switch (normalized) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'in-progress':
        return <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>
      case 'not-started':
        return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 'expiring':
        return <Badge className="bg-red-100 text-red-800">Expiring Soon</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status.replace("_", " ")}</Badge>
    }
  }

  const getDifficultyBadge = (trainingType: string) => {
    switch (trainingType?.toLowerCase()) {
      case 'technical':
      case 'certification':
        return <Badge className="bg-red-100 text-red-800">Advanced</Badge>
      case 'leadership':
      case 'compliance':
        return <Badge className="bg-orange-100 text-orange-800">Intermediate</Badge>
      default:
        return <Badge className="bg-green-100 text-green-800">Beginner</Badge>
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Learning & Development</h1>
          <p className="text-gray-600">Manage courses, training sessions, and certifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Certificate
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading && !stats ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Trainings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total ?? 0}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.in_progress ?? 0}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{avgCompletionRate}%</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Certifications</p>
                    <p className="text-2xl font-bold text-gray-900">{certificationCount}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="sessions">Training Sessions</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        {/* Courses */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Available Courses
                  </CardTitle>
                  <CardDescription>
                    Browse and manage learning courses
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {trainingCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : filteredCourses.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-12">No trainings found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((training) => (
                    <Card key={training.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{training.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {training.provider} • {getDurationLabel(training)}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Training
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="mr-2 h-4 w-4" />
                                View Employee
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(training.status)}
                          {getDifficultyBadge(training.training_type)}
                          {training.certificate && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Certificate className="w-3 h-3 mr-1" />
                              Certificate
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{training.progress}%</span>
                          </div>
                          <Progress value={training.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users className="w-4 h-4" />
                            {training.employee_name}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {training.formatted_start_date ||
                              (training.start_date ? new Date(training.start_date).toLocaleDateString() : "—")}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <Play className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course Assignments */}
        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Course Assignments
                  </CardTitle>
                  <CardDescription>
                    Track course assignments and completion progress
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Course
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : inProgressAssignments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-12">No in-progress assignments.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inProgressAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {assignment.employee_name?.split(" ").map((n) => n[0]).join("") || "?"}
                            </div>
                            <span className="font-medium text-gray-900">{assignment.employee_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{assignment.name}</TableCell>
                        <TableCell>
                          {assignment.formatted_start_date ||
                            (assignment.start_date ? new Date(assignment.start_date).toLocaleDateString() : "—")}
                        </TableCell>
                        <TableCell>
                          {assignment.formatted_end_date ||
                            (assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : "—")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={assignment.progress} className="w-20 h-2" />
                            <span className="text-sm font-medium">{assignment.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{assignment.hours ?? 0}h</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Update Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Clock className="mr-2 h-4 w-4" />
                                Extend Deadline
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Assignment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Sessions */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    Training Sessions
                  </CardTitle>
                  <CardDescription>
                    Schedule and manage internal training sessions
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Calendar
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Session
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : sessionTrainings.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-12">No current or upcoming sessions.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionTrainings.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-900">{session.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">
                            {session.training_type_label || session.training_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{session.provider}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {session.formatted_start_date ||
                                (session.start_date ? new Date(session.start_date).toLocaleDateString() : "—")}
                            </p>
                            <p className="text-sm text-gray-500">
                              to {session.formatted_end_date ||
                                (session.end_date ? new Date(session.end_date).toLocaleDateString() : "—")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{session.employee_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={session.progress} className="w-16 h-2" />
                            <span className="text-sm">{session.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(getSessionStatus(session))}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="mr-2 h-4 w-4" />
                                View Employee
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Session
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel Session
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications */}
        <TabsContent value="certifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certifications
                  </CardTitle>
                  <CardDescription>
                    Track employee certifications and professional development
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Certificate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : certifications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-12">No certifications found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Certification</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Training Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certifications.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {cert.employee_name?.split(" ").map((n) => n[0]).join("") || "?"}
                            </div>
                            <span className="font-medium text-gray-900">{cert.employee_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Certificate className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">{cert.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{cert.provider}</TableCell>
                        <TableCell>
                          {cert.formatted_end_date ||
                            (cert.end_date ? new Date(cert.end_date).toLocaleDateString() : "—")}
                        </TableCell>
                        <TableCell>{cert.training_type_label || cert.training_type}</TableCell>
                        <TableCell>{getStatusBadge(cert.status)}</TableCell>
                        <TableCell>
                          {cert.certificate ? (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <span className="text-sm text-gray-500">Not available</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Certificate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Verify
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 