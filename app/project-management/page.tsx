"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { apiRequest, getEndpointUrl } from "@/lib/api"
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  MoreHorizontal,
  FolderKanban,
  Target,
  BarChart3,
  Activity,
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

interface ProjectStats {
  total: number
  active: number
  planning: number
  completed: number
  total_tasks: number
  completed_tasks: number
}

const formatCurrency = (value: number | null | undefined) => {
  if (value == null) return "—"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDate = (date: string | null) => {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const daysUntil = (date: string) => {
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function ProjectManagement() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [projectsData, statsData] = await Promise.all([
          apiRequest<Project[]>(getEndpointUrl("PROJECTS")),
          apiRequest<ProjectStats>(getEndpointUrl("PROJECTS_STATS")),
        ])
        setProjects(Array.isArray(projectsData) ? projectsData : [])
        setStats(statsData)
      } catch {
        setProjects([])
        setStats(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const budgetTotals = useMemo(() => {
    const spent = projects.reduce((sum, p) => sum + (p.spent ?? 0), 0)
    const budget = projects.reduce((sum, p) => sum + (p.budget ?? 0), 0)
    return { spent, budget }
  }, [projects])

  const upcomingDeadlines = useMemo(() => {
    return projects
      .filter((p) => p.end_date && daysUntil(p.end_date) >= 0)
      .sort((a, b) => new Date(a.end_date!).getTime() - new Date(b.end_date!).getTime())
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        title: `${p.name} — Target End`,
        project: p.name,
        dueDate: p.end_date!,
        daysLeft: daysUntil(p.end_date!),
        priority: p.priority,
      }))
  }, [projects])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "planning":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "on_hold":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
      case "critical":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-2xl sm:text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600">Manage and track all your projects in one place</p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => router.push("/project-management/kanban")}>
            <FolderKanban className="w-4 h-4 mr-2" />
            Kanban Board
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => router.push("/project-management/sprints")}>
            <Target className="w-4 h-4 mr-2" />
            Sprints
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => router.push("/project-management/timeline")}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Timeline
          </Button>
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.active ?? 0}</p>
                <p className="text-sm text-green-600 mt-1">{stats?.total ?? 0} total</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <FolderKanban className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.completed_tasks ?? 0}</p>
                <p className="text-sm text-blue-600 mt-1">of {stats?.total_tasks ?? 0} total</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_tasks ?? 0}</p>
                <p className="text-sm text-purple-600 mt-1">Across all projects</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(budgetTotals.spent)}</p>
                <p className="text-sm text-orange-600 mt-1">of {formatCurrency(budgetTotals.budget)} total</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5" />
              Projects
            </CardTitle>
            <CardDescription>All your projects and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FolderKanban className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No projects yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/project-management/${project.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                          <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
                          <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(project.start_date)} - {formatDate(project.end_date)}
                          </span>
                          <span>{formatCurrency(project.budget)}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    <div className="text-sm text-gray-600 text-right">
                      {project.tasks_completed}/{project.tasks_total} tasks completed
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Project Summary
            </CardTitle>
            <CardDescription>Status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Planning", count: stats?.planning ?? 0, color: "text-blue-600" },
                { label: "Active", count: stats?.active ?? 0, color: "text-green-600" },
                { label: "Completed", count: stats?.completed ?? 0, color: "text-gray-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Deadlines
          </CardTitle>
          <CardDescription>Project end dates to keep track of</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingDeadlines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No upcoming deadlines</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/project-management/${deadline.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{deadline.title}</h4>
                    <Badge className={getPriorityColor(deadline.priority)}>{deadline.priority}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{deadline.project}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Due: {formatDate(deadline.dueDate)}</span>
                    <span
                      className={`text-sm font-medium ${
                        deadline.daysLeft <= 7
                          ? "text-red-600"
                          : deadline.daysLeft <= 14
                            ? "text-orange-600"
                            : "text-green-600"
                      }`}
                    >
                      {deadline.daysLeft} days left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
