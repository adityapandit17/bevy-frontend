"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { apiRequest, getEndpointUrl } from "@/lib/api"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Target,
  CheckCircle,
  Circle,
  Download,
  Share,
  BarChart3,
  Activity,
  ZoomIn,
  ZoomOut,
  Loader2,
} from "lucide-react"

interface Project {
  id: number
  name: string
  description: string | null
  status: string
  progress: number
  priority: string
  start_date: string | null
  end_date: string | null
  budget: number | null
  spent: number | null
  tasks_completed: number
  tasks_total: number
}

interface ProjectTask {
  id: number
  project_id: number
  project_name: string | null
  title: string
  description: string | null
  status: string
  priority: string
  assignee: string
  due_date: string | null
  story_points: number | null
  sprint_name: string | null
  tags: string[]
}

const PROJECT_COLORS = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"]

const taskProgress = (status: string) => {
  switch (status) {
    case "completed":
    case "done":
      return 100
    case "in_progress":
    case "review":
      return 50
    default:
      return 0
  }
}

const formatDate = (date: string | null) => {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const formatStatus = (status: string) => status.replace(/_/g, " ")

export default function ProjectTimeline() {
  const router = useRouter()
  const [selectedProject, setSelectedProject] = useState("all")
  const [viewMode, setViewMode] = useState("month")
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [projectsData, tasksData] = await Promise.all([
          apiRequest<Project[]>(getEndpointUrl("PROJECTS")),
          apiRequest<ProjectTask[]>(getEndpointUrl("PROJECT_TASKS")),
        ])
        setProjects(Array.isArray(projectsData) ? projectsData : [])
        setTasks(Array.isArray(tasksData) ? tasksData : [])
      } catch {
        setProjects([])
        setTasks([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const projectsWithTasks = useMemo(() => {
    return projects.map((project, index) => ({
      ...project,
      color: PROJECT_COLORS[index % PROJECT_COLORS.length],
      tasks: tasks
        .filter((t) => t.project_id === project.id)
        .map((t) => ({
          ...t,
          progress: taskProgress(t.status),
        })),
    }))
  }, [projects, tasks])

  const filteredProjects =
    selectedProject === "all"
      ? projectsWithTasks
      : projectsWithTasks.filter((p) => p.id.toString() === selectedProject)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "done":
        return "bg-green-100 text-green-800"
      case "in_progress":
      case "review":
        return "bg-blue-100 text-blue-800"
      case "pending":
      case "backlog":
      case "todo":
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
      case "done":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in_progress":
      case "review":
        return <Clock className="w-4 h-4 text-blue-600" />
      default:
        return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  const totalTaskCount = tasks.length
  const completedTaskCount = tasks.filter((t) => t.status === "completed" || t.status === "done").length

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
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

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects to display</h3>
            <p>Create a project to see the timeline</p>
          </CardContent>
        </Card>
      ) : (
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
                        {formatDate(project.start_date)} - {formatDate(project.end_date)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(project.status)}>{formatStatus(project.status)}</Badge>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Project Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${project.color}`} style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                {project.tasks.length === 0 ? (
                  <p className="text-center py-6 text-gray-500 text-sm">No tasks for this project</p>
                ) : (
                  <div className="space-y-3">
                    {project.tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-shrink-0">{getTaskStatusIcon(task.status)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                            <Badge className={getStatusColor(task.status)} variant="secondary">
                              {formatStatus(task.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                            {task.due_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Due: {formatDate(task.due_date)}
                              </span>
                            )}
                            {task.sprint_name && (
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {task.sprint_name}
                              </span>
                            )}
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
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                  {projects.filter((p) => p.status === "active").length}
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
                <p className="text-2xl font-bold text-gray-900">{totalTaskCount}</p>
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
                <p className="text-2xl font-bold text-gray-900">{completedTaskCount}</p>
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
