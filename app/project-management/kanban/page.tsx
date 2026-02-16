"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
} from "lucide-react"

export default function KanbanBoard() {
  const router = useRouter()
  const [draggedTask, setDraggedTask] = useState<number | null>(null)

  // Frontend-only tasks data; can be swapped with real API later
  const tasks = [
    {
      id: 1,
      title: "Research mobile app frameworks",
      description: "Evaluate React Native vs Flutter for the mobile app",
      priority: "medium",
      status: "backlog",
      assignee: { name: "John Doe", avatar: "/placeholder-user.jpg" },
      dueDate: "2024-03-20",
      storyPoints: 5,
      tags: ["research", "mobile"],
    },
    {
      id: 2,
      title: "Setup CI/CD pipeline",
      description: "Configure automated testing and deployment",
      priority: "high",
      status: "backlog",
      assignee: { name: "Mike Johnson", avatar: "/placeholder-user.jpg" },
      dueDate: "2024-03-25",
      storyPoints: 8,
      tags: ["devops", "automation"],
    },
    {
      id: 3,
      title: "Design user authentication flow",
      description: "Create wireframes and user journey for login/signup",
      priority: "high",
      status: "todo",
      assignee: { name: "Sarah Wilson", avatar: "/placeholder-user.jpg" },
      dueDate: "2024-03-15",
      storyPoints: 3,
      tags: ["design", "auth"],
    },
    {
      id: 4,
      title: "Implement push notifications",
      description: "Add push notification system for important updates",
      priority: "medium",
      status: "todo",
      assignee: { name: "Jane Smith", avatar: "/placeholder-user.jpg" },
      dueDate: "2024-03-22",
      storyPoints: 5,
      tags: ["mobile", "notifications"],
    },
    {
      id: 5,
      title: "Develop user dashboard",
      description: "Create the main dashboard with attendance and leave widgets",
      priority: "high",
      status: "in-progress",
      assignee: { name: "Jane Smith", avatar: "/placeholder-user.jpg" },
      dueDate: "2024-03-10",
      storyPoints: 8,
      tags: ["frontend", "dashboard"],
    },
    {
      id: 6,
      title: "API integration for attendance",
      description: "Connect frontend with attendance tracking API",
      priority: "high",
      status: "in-progress",
      assignee: { name: "Mike Johnson", avatar: "/placeholder-user.jpg" },
      dueDate: "2024-03-12",
      storyPoints: 5,
      tags: ["backend", "api"],
    },
    {
      id: 7,
      title: "Code review for authentication module",
      description: "Review the JWT implementation and security measures",
      priority: "high",
      status: "review",
      assignee: { name: "David Brown", avatar: "/placeholder-user.jpg" },
      dueDate: "2024-03-08",
      storyPoints: 3,
      tags: ["review", "security"],
    },
    {
      id: 8,
      title: "Project setup and configuration",
      description: "Initialize project structure and development environment",
      priority: "high",
      status: "done",
      assignee: { name: "John Doe", avatar: "/placeholder-user.jpg" },
      dueDate: "2024-02-28",
      storyPoints: 2,
      tags: ["setup", "configuration"],
    },
    {
      id: 9,
      title: "Database schema design",
      description: "Design and implement the database structure",
      priority: "high",
      status: "done",
      assignee: { name: "Mike Johnson", avatar: "/placeholder-user.jpg" },
      dueDate: "2024-03-05",
      storyPoints: 5,
      tags: ["database", "schema"],
    },
  ] as const

  const columnMeta = {
    backlog: { title: "Backlog", color: "bg-gray-100" },
    todo: { title: "To Do", color: "bg-blue-100" },
    "in-progress": { title: "In Progress", color: "bg-yellow-100" },
    review: { title: "Review", color: "bg-purple-100" },
    done: { title: "Done", color: "bg-green-100" },
  } as const

  const statusOrder = ["backlog", "todo", "in-progress", "review", "done"] as const

  const columns = statusOrder.map((status) => ({
    id: status,
    title: columnMeta[status].title,
    color: columnMeta[status].color,
    tasks: tasks.filter((t) => t.status === status),
  }))

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
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

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    if (draggedTask) {
      // Here you would typically update the task's status/column
      console.log(`Moving task ${draggedTask} to column ${columnId}`)
      setDraggedTask(null)
    }
  }

  const getTaskCount = (columnId: string) => {
    return columns.find(col => col.id === columnId)?.tasks.length || 0
  }

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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Kanban Board</h1>
            <p className="text-gray-600">BevyHR Mobile App - Task Management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Board Stats */}
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

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            {/* Column Header */}
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

            {/* Column Tasks */}
            <div
              className="space-y-3 min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {column.tasks.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-move hover:shadow-md transition-all duration-200"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Task Header */}
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

                      {/* Task Title and Description */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                      </div>

                      {/* Task Tags */}
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Task Footer */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                            <AvatarFallback className="text-xs">
                              {task.assignee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600">{task.assignee.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{task.storyPoints} pts</span>
                        </div>
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Empty State */}
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common actions for managing your board</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Plus className="w-6 h-6" />
              <span className="text-sm">Add Task</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Filter className="w-6 h-6" />
              <span className="text-sm">Filter Tasks</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <User className="w-6 h-6" />
              <span className="text-sm">Assign Tasks</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Clock className="w-6 h-6" />
              <span className="text-sm">Set Deadlines</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
