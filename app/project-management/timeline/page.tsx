"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Target,
  CheckCircle,
  Circle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  BarChart3,
  Activity,
  ZoomIn,
  ZoomOut,
  Download,
  Share,
} from "lucide-react"

export default function ProjectTimeline() {
  const router = useRouter()
  const [selectedProject, setSelectedProject] = useState("all")
  const [viewMode, setViewMode] = useState("month")

  const projects = [
    {
      id: 1,
      name: "BevyHR Mobile App",
      status: "active",
      startDate: "2024-01-15",
      endDate: "2024-03-30",
      progress: 75,
      color: "bg-blue-500",
      tasks: [
        {
          id: 1,
          name: "Project Setup",
          startDate: "2024-01-15",
          endDate: "2024-01-20",
          progress: 100,
          assignee: "John Doe",
          status: "completed",
          dependencies: []
        },
        {
          id: 2,
          name: "UI/UX Design",
          startDate: "2024-01-18",
          endDate: "2024-02-15",
          progress: 100,
          assignee: "Sarah Wilson",
          status: "completed",
          dependencies: [1]
        },
        {
          id: 3,
          name: "Backend Development",
          startDate: "2024-02-01",
          endDate: "2024-03-01",
          progress: 60,
          assignee: "Mike Johnson",
          status: "in-progress",
          dependencies: [1]
        },
        {
          id: 4,
          name: "Frontend Development",
          startDate: "2024-02-15",
          endDate: "2024-03-15",
          progress: 40,
          assignee: "Jane Smith",
          status: "in-progress",
          dependencies: [2]
        },
        {
          id: 5,
          name: "Testing & QA",
          startDate: "2024-03-01",
          endDate: "2024-03-25",
          progress: 0,
          assignee: "David Brown",
          status: "pending",
          dependencies: [3, 4]
        },
        {
          id: 6,
          name: "Deployment",
          startDate: "2024-03-25",
          endDate: "2024-03-30",
          progress: 0,
          assignee: "John Doe",
          status: "pending",
          dependencies: [5]
        }
      ]
    },
    {
      id: 2,
      name: "Payroll System Upgrade",
      status: "planning",
      startDate: "2024-02-01",
      endDate: "2024-05-15",
      progress: 25,
      color: "bg-green-500",
      tasks: [
        {
          id: 7,
          name: "Requirements Analysis",
          startDate: "2024-02-01",
          endDate: "2024-02-15",
          progress: 100,
          assignee: "Sarah Wilson",
          status: "completed",
          dependencies: []
        },
        {
          id: 8,
          name: "System Architecture",
          startDate: "2024-02-10",
          endDate: "2024-02-28",
          progress: 50,
          assignee: "Mike Johnson",
          status: "in-progress",
          dependencies: [7]
        },
        {
          id: 9,
          name: "Database Migration",
          startDate: "2024-03-01",
          endDate: "2024-03-31",
          progress: 0,
          assignee: "Mike Johnson",
          status: "pending",
          dependencies: [8]
        },
        {
          id: 10,
          name: "UI Development",
          startDate: "2024-03-15",
          endDate: "2024-04-30",
          progress: 0,
          assignee: "Jane Smith",
          status: "pending",
          dependencies: [8]
        },
        {
          id: 11,
          name: "Integration Testing",
          startDate: "2024-04-15",
          endDate: "2024-05-10",
          progress: 0,
          assignee: "David Brown",
          status: "pending",
          dependencies: [9, 10]
        },
        {
          id: 12,
          name: "Production Deployment",
          startDate: "2024-05-10",
          endDate: "2024-05-15",
          progress: 0,
          assignee: "John Doe",
          status: "pending",
          dependencies: [11]
        }
      ]
    },
    {
      id: 3,
      name: "Performance Analytics Dashboard",
      status: "completed",
      startDate: "2023-11-01",
      endDate: "2024-01-31",
      progress: 100,
      color: "bg-purple-500",
      tasks: [
        {
          id: 13,
          name: "Data Collection Setup",
          startDate: "2023-11-01",
          endDate: "2023-11-15",
          progress: 100,
          assignee: "Emily Davis",
          status: "completed",
          dependencies: []
        },
        {
          id: 14,
          name: "Analytics Engine",
          startDate: "2023-11-10",
          endDate: "2023-12-15",
          progress: 100,
          assignee: "Alex Chen",
          status: "completed",
          dependencies: [13]
        },
        {
          id: 15,
          name: "Dashboard UI",
          startDate: "2023-12-01",
          endDate: "2024-01-15",
          progress: 100,
          assignee: "Lisa Garcia",
          status: "completed",
          dependencies: [14]
        },
        {
          id: 16,
          name: "Testing & Optimization",
          startDate: "2024-01-15",
          endDate: "2024-01-31",
          progress: 100,
          assignee: "David Brown",
          status: "completed",
          dependencies: [15]
        }
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "planning":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "pending":
        return <Circle className="w-4 h-4 text-gray-400" />
      default:
        return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredProjects = selectedProject === "all" 
    ? projects 
    : projects.filter(project => project.id.toString() === selectedProject)

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Project Timeline</h1>
            <p className="text-gray-600">Gantt chart view of all projects and tasks</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id.toString()}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">View</label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="quarter">Quarter</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline View */}
      <div className="space-y-6">
        {filteredProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${project.color}`} />
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <span className="text-sm text-gray-600">{project.progress}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Project Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Project Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${project.color}`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Tasks Timeline */}
              <div className="space-y-3">
                {project.tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      {getTaskStatusIcon(task.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{task.name}</h4>
                        <Badge className={getStatusColor(task.status)} variant="secondary">
                          {task.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.startDate)} - {formatDate(task.endDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {calculateDuration(task.startDate, task.endDate)} days
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {task.assignee}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-32">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${project.color}`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === "active").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.reduce((sum, project) => sum + project.tasks.length, 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.reduce((sum, project) => 
                    sum + project.tasks.filter(task => task.status === "completed").length, 0
                  )}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
