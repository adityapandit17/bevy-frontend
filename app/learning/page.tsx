"use client"

import { useState } from "react"
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
  BarChart3
} from "lucide-react"

export default function LearningPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Sample data for courses
  const courses = [
    {
      id: 1,
      title: "Leadership Fundamentals",
      category: "Leadership",
      instructor: "Dr. Sarah Johnson",
      duration: "8 weeks",
      difficulty: "Intermediate",
      completionRate: 78,
      enrolledStudents: 45,
      status: "active",
      type: "online",
      lastUpdated: "2024-01-15",
      certificate: true
    },
    {
      id: 2,
      title: "Data Analysis for HR",
      category: "Technical Skills",
      instructor: "Michael Chen",
      duration: "6 weeks",
      difficulty: "Advanced",
      completionRate: 65,
      enrolledStudents: 32,
      status: "active",
      type: "online",
      lastUpdated: "2024-01-10",
      certificate: true
    },
    {
      id: 3,
      title: "Employee Engagement Strategies",
      category: "HR Management",
      instructor: "Emily Rodriguez",
      duration: "4 weeks",
      difficulty: "Beginner",
      completionRate: 92,
      enrolledStudents: 67,
      status: "active",
      type: "hybrid",
      lastUpdated: "2024-01-20",
      certificate: false
    },
    {
      id: 4,
      title: "Conflict Resolution",
      category: "Soft Skills",
      instructor: "David Wilson",
      duration: "3 weeks",
      difficulty: "Beginner",
      completionRate: 88,
      enrolledStudents: 89,
      status: "upcoming",
      type: "in-person",
      lastUpdated: "2024-01-25",
      certificate: true
    }
  ]

  // Sample data for course assignments
  const courseAssignments = [
    {
      id: 1,
      courseTitle: "Leadership Fundamentals",
      employeeName: "Sarah Johnson",
      assignedDate: "2024-01-15",
      dueDate: "2024-03-15",
      progress: 75,
      status: "in-progress",
      lastActivity: "2024-01-28",
      grade: null
    },
    {
      id: 2,
      courseTitle: "Data Analysis for HR",
      employeeName: "Michael Chen",
      assignedDate: "2024-01-10",
      dueDate: "2024-02-25",
      progress: 100,
      status: "completed",
      lastActivity: "2024-01-25",
      grade: "A+"
    },
    {
      id: 3,
      courseTitle: "Employee Engagement Strategies",
      employeeName: "Emily Rodriguez",
      assignedDate: "2024-01-20",
      dueDate: "2024-02-20",
      progress: 45,
      status: "in-progress",
      lastActivity: "2024-01-27",
      grade: null
    },
    {
      id: 4,
      courseTitle: "Conflict Resolution",
      employeeName: "David Wilson",
      assignedDate: "2024-01-25",
      dueDate: "2024-02-15",
      progress: 0,
      status: "not-started",
      lastActivity: null,
      grade: null
    }
  ]

  // Sample data for training sessions
  const trainingSessions = [
    {
      id: 1,
      title: "New Employee Orientation",
      type: "In-Person",
      instructor: "HR Team",
      date: "2024-02-05",
      time: "10:00 AM - 2:00 PM",
      location: "Conference Room A",
      capacity: 25,
      enrolled: 18,
      status: "upcoming"
    },
    {
      id: 2,
      title: "Safety Training Workshop",
      type: "Hybrid",
      instructor: "Safety Officer",
      date: "2024-02-10",
      time: "9:00 AM - 12:00 PM",
      location: "Training Center + Virtual",
      capacity: 40,
      enrolled: 35,
      status: "upcoming"
    },
    {
      id: 3,
      title: "Software Training - HRIS",
      type: "Virtual",
      instructor: "IT Team",
      date: "2024-02-15",
      time: "2:00 PM - 4:00 PM",
      location: "Zoom Meeting",
      capacity: 50,
      enrolled: 42,
      status: "upcoming"
    },
    {
      id: 4,
      title: "Team Building Workshop",
      type: "In-Person",
      instructor: "External Consultant",
      date: "2024-01-30",
      time: "1:00 PM - 5:00 PM",
      location: "Outdoor Venue",
      capacity: 30,
      enrolled: 28,
      status: "completed"
    }
  ]

  // Sample data for certifications
  const certifications = [
    {
      id: 1,
      employeeName: "Sarah Johnson",
      certificationName: "PHR (Professional in Human Resources)",
      issuingOrganization: "HRCI",
      issueDate: "2023-06-15",
      expiryDate: "2026-06-15",
      status: "active",
      documentUrl: "/certificates/sarah-phr.pdf",
      verifiedBy: "HR Manager",
      verificationDate: "2023-06-20"
    },
    {
      id: 2,
      employeeName: "Michael Chen",
      certificationName: "SHRM-CP (Society for HR Management)",
      issuingOrganization: "SHRM",
      issueDate: "2023-08-20",
      expiryDate: "2026-08-20",
      status: "active",
      documentUrl: "/certificates/michael-shrm.pdf",
      verifiedBy: "HR Manager",
      verificationDate: "2023-08-25"
    },
    {
      id: 3,
      employeeName: "Emily Rodriguez",
      certificationName: "Data Analytics Certification",
      issuingOrganization: "Google",
      issueDate: "2023-12-10",
      expiryDate: "2025-12-10",
      status: "active",
      documentUrl: "/certificates/emily-google.pdf",
      verifiedBy: "HR Team",
      verificationDate: "2023-12-15"
    },
    {
      id: 4,
      employeeName: "David Wilson",
      certificationName: "Project Management Professional",
      issuingOrganization: "PMI",
      issueDate: "2022-03-15",
      expiryDate: "2025-03-15",
      status: "expiring",
      documentUrl: "/certificates/david-pmp.pdf",
      verifiedBy: "HR Manager",
      verificationDate: "2022-03-20"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
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
      case 'expiring':
        return <Badge className="bg-red-100 text-red-800">Expiring Soon</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-green-100 text-green-800">Beginner</Badge>
      case 'intermediate':
        return <Badge className="bg-orange-100 text-orange-800">Intermediate</Badge>
      case 'advanced':
        return <Badge className="bg-red-100 text-red-800">Advanced</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{difficulty}</Badge>
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
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
                <p className="text-sm font-medium text-gray-600">Enrolled Students</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
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
                <p className="text-2xl font-bold text-gray-900">78%</p>
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
                <p className="text-sm font-medium text-gray-600">Active Certifications</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                      <SelectItem value="Leadership">Leadership</SelectItem>
                      <SelectItem value="Technical Skills">Technical Skills</SelectItem>
                      <SelectItem value="HR Management">HR Management</SelectItem>
                      <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {course.instructor} • {course.duration}
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
                              Edit Course
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              Manage Enrollments
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
                      <div className="flex items-center gap-2">
                        {getStatusBadge(course.status)}
                        {getDifficultyBadge(course.difficulty)}
                        {course.certificate && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Certificate className="w-3 h-3 mr-1" />
                            Certificate
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completion Rate</span>
                          <span className="font-medium">{course.completionRate}%</span>
                        </div>
                        <Progress value={course.completionRate} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="w-4 h-4" />
                          {course.enrolledStudents} enrolled
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(course.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Play className="w-4 h-4 mr-2" />
                          Enroll
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {assignment.employeeName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-gray-900">{assignment.employeeName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{assignment.courseTitle}</TableCell>
                      <TableCell>{new Date(assignment.assignedDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={assignment.progress} className="w-20 h-2" />
                          <span className="text-sm font-medium">{assignment.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell>
                        {assignment.grade ? (
                          <Badge className="bg-green-100 text-green-800">{assignment.grade}</Badge>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
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
                              View Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Update Grade
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainingSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-gray-900">{session.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          session.type === 'In-Person' ? 'bg-blue-100 text-blue-800' :
                          session.type === 'Virtual' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }>
                          {session.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{session.instructor}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{new Date(session.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">{session.time}</p>
                        </div>
                      </TableCell>
                      <TableCell>{session.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{session.enrolled}/{session.capacity}</span>
                          <Progress value={(session.enrolled / session.capacity) * 100} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
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
                              Manage Attendees
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Certification</TableHead>
                    <TableHead>Issuing Organization</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified By</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certifications.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {cert.employeeName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-gray-900">{cert.employeeName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Certificate className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{cert.certificationName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{cert.issuingOrganization}</TableCell>
                      <TableCell>{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(cert.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(cert.status)}</TableCell>
                      <TableCell>
                        {cert.verifiedBy ? (
                          <div>
                            <p className="text-sm font-medium">{cert.verifiedBy}</p>
                            <p className="text-xs text-gray-500">
                              {cert.verificationDate && new Date(cert.verificationDate).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not verified</span>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 