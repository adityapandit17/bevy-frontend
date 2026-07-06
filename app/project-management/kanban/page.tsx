"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { apiRequest, getEndpointUrl } from "@/lib/api"
import {
  Plus,
  MoreHorizontal,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Circle,
  ArrowLeft,
  Filter,
  Search,
  FolderKanban,
  Loader2,
} from "lucide-react"

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

const COLUMN_STATUSES = ["backlog", "todo", "in_progress", "review", "done"] as const

const columnMeta: Record<string, { title: string; color: string }> = {
  backlog: { title: "Backlog", color: "bg-gray-100" },
  todo: { title: "To Do", color: "bg-blue-100" },
  in_progress: { title: "In Progress", color: "bg-yellow-100" },
  review: { title: "Review", color: "bg-purple-100" },
  done: { title: "Done", color: "bg-green-100" },
}

const formatDate = (date: string | null) => {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function KanbanBoard() {
  const router = useRouter()
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedTask, setDraggedTask] = useState<number | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      try {
        const data = await apiRequest<ProjectTask[]>(getEndpointUrl("PROJECT_TASKS"))
        setTasks(Array.isArray(data) ? data : [])
      } catch {
        setTasks([])
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const columns = useMemo(
    () =>
      COLUMN_STATUSES.map((status) => ({
        id: status,
        title: columnMeta[status].title,
        color: columnMeta[status].color,
        tasks: tasks.filter((t) => {
          const normalized = t.status === "completed" ? "done" : t.status
          return normalized === status
        }),
      })),
    [tasks]
  )

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
      case "critical":
        return <AlertCircle className="w-3 h-3 text-red-600" />
      case "medium":
        return <Circle className="w-3 h-3 text-yellow-600" />
      case "low":
        return <CheckCircle className="w-3 h-3 text-green-600" />
      default:
        return <Circle className="w-3 h-3 text-gray-400" />
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    if (!draggedTask || updating) return

    const task = tasks.find((t) => t.id === draggedTask)
    if (!task) {
      setDraggedTask(null)
      return
    }

    const currentStatus = task.status === "completed" ? "done" : task.status
    if (currentStatus === columnId) {
      setDraggedTask(null)
      return
    }

    const newStatus = columnId
    const previousTasks = tasks
    setTasks((prev) =>
      prev.map((t) => (t.id === draggedTask ? { ...t, status: newStatus } : t))
    )
    setDraggedTask(null)
    setUpdating(true)

    try {
      await apiRequest(`${getEndpointUrl("PROJECT_TASKS")}/${draggedTask}`, {
        method: "PATCH",
        body: JSON.stringify({ project_task: { status: newStatus } }),
      })
    } catch {
      setTasks(previousTasks)
    } finally {
      setUpdating(false)
    }
  }

  const getTaskCount = (columnId: string) => {
    return columns.find((col) => col.id === columnId)?.tasks.length || 0
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
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl lg:text-2xl sm:text-3xl font-bold text-gray-900">Kanban Board</h1>
            <p className="text-gray-600">
              {tasks.length > 0 ? `${tasks.length} tasks across all projects` : "No tasks yet"}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {columns.map((column) => (
          <Card key={column.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{column.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{getTaskCount(column.id)}</p>
                </div>
                <div className={`p-2 rounded-lg ${column.color}`}>
                  <FolderKanban className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <FolderKanban className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks on the board</h3>
            <p>Create tasks in a project to see them here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-5 md:overflow-visible md:gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4 min-w-[280px] w-[280px] flex-shrink-0 md:min-w-0 md:w-auto md:flex-shrink">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {getTaskCount(column.id)}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div
                className="space-y-3 min-h-[400px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {column.tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-move hover:shadow-md transition-all duration-200"
                    draggable={!updating}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(task.priority)}
                            <Badge className={getPriorityColor(task.priority)} variant="secondary">
                              {task.priority}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                          )}
                          {task.project_name && (
                            <p className="text-xs text-gray-500 mt-1">{task.project_name}</p>
                          )}
                        </div>

                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {task.assignee
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-600">{task.assignee}</span>
                          </div>
                          {task.story_points != null && (
                            <span className="text-xs text-gray-500">{task.story_points} pts</span>
                          )}
                        </div>

                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {formatDate(task.due_date)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {column.tasks.length === 0 && (
                  <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <FolderKanban className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No tasks</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common actions for managing your board</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 w-full">
              <Plus className="w-6 h-6" />
              <span className="text-sm">Add Task</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 w-full">
              <Filter className="w-6 h-6" />
              <span className="text-sm">Filter Tasks</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 w-full">
              <User className="w-6 h-6" />
              <span className="text-sm">Assign Tasks</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 w-full">
              <Clock className="w-6 h-6" />
              <span className="text-sm">Set Deadlines</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
