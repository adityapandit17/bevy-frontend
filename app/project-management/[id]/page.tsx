"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Target,
  CheckCircle,
  Circle,
  AlertCircle,
  Plus,
  Edit,
  MoreHorizontal,
  BarChart3,
  MessageSquare,
  FileText,
  Activity,
  Zap,
  TrendingUp,
  FolderKanban,
} from "lucide-react"

export default function ProjectDetail() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  // Mock project data
  const project = {
    id: 1,
    name: "BevyHR Mobile App",
    description: "Mobile application for employee self-service with features like attendance tracking, leave management, and payroll access",
    status: "active",
    progress: 75,
    startDate: "2024-01-15",
    endDate: "2024-03-30",
    budget: "$50,000",
    spent: "$37,500",
    priority: "high",
    team: [
      { name: "John Doe", role: "Project Manager", avatar: "/placeholder-user.jpg", status: "online" },
      { name: "Jane Smith", role: "Frontend Developer", avatar: "/placeholder-user.jpg", status: "online" },
      { name: "Mike Johnson", role: "Backend Developer", avatar: "/placeholder-user.jpg", status: "away" },
      { name: "Sarah Wilson", role: "UI/UX Designer", avatar: "/placeholder-user.jpg", status: "online" },
      { name: "David Brown", role: "QA Engineer", avatar: "/placeholder-user.jpg", status: "offline" },
    ],
    milestones: [
      { id: 1, title: "Project Setup", completed: true, dueDate: "2024-01-20" },
      { id: 2, title: "UI/UX Design", completed: true, dueDate: "2024-02-15" },
      { id: 3, title: "Backend Development", completed: false, dueDate: "2024-03-01" },
      { id: 4, title: "Frontend Development", completed: false, dueDate: "2024-03-15" },
      { id: 5, title: "Testing & QA", completed: false, dueDate: "2024-03-25" },
      { id: 6, title: "Deployment", completed: false, dueDate: "2024-03-30" },
    ],
    tasks: [
      { id: 1, title: "Setup development environment", status: "completed", assignee: "John Doe", priority: "high", dueDate: "2024-01-18" },
      { id: 2, title: "Design user interface mockups", status: "completed", assignee: "Sarah Wilson", priority: "high", dueDate: "2024-02-10" },
      { id: 3, title: "Implement authentication system", status: "in-progress", assignee: "Mike Johnson", priority: "high", dueDate: "2024-02-28" },
      { id: 4, title: "Create user dashboard", status: "in-progress", assignee: "Jane Smith", priority: "medium", dueDate: "2024-03-05" },
      { id: 5, title: "Implement attendance tracking", status: "pending", assignee: "Jane Smith", priority: "medium", dueDate: "2024-03-10" },
      { id: 6, title: "Add leave management features", status: "pending", assignee: "Mike Johnson", priority: "medium", dueDate: "2024-03-12" },
      { id: 7, title: "Integrate payroll system", status: "pending", assignee: "Mike Johnson", priority: "high", dueDate: "2024-03-18" },
      { id: 8, title: "Write unit tests", status: "pending", assignee: "David Brown", priority: "low", dueDate: "2024-03-20" },
    ],
    recentActivities: [
      { id: 1, type: "task_completed", description: "John Doe completed 'Setup development environment'", time: "2 hours ago", user: "John Doe" },
      { id: 2, type: "comment_added", description: "Sarah Wilson added a comment on 'Design user interface mockups'", time: "4 hours ago", user: "Sarah Wilson" },
      { id: 3, type: "task_created", description: "New task 'Implement authentication system' created", time: "1 day ago", user: "John Doe" },
      { id: 4, type: "milestone_reached", description: "UI/UX Design milestone completed", time: "2 days ago", user: "Sarah Wilson" },
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "comment_added":
        return <MessageSquare className="w-4 h-4 text-blue-600" />
      case "task_created":
        return <Plus className="w-4 h-4 text-purple-600" />
      case "milestone_reached":
        return <Target className="w-4 h-4 text-orange-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const completedTasks = project.tasks.filter(task => task.status === "completed").length
  const totalTasks = project.tasks.length
  const completedMilestones = project.milestones.filter(milestone => milestone.completed).length
  const totalMilestones = project.milestones.length

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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit Project
          </Button>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900">{project.progress}%</p>
                <Progress value={project.progress} className="mt-2" />
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedTasks}/{totalTasks}</p>
                <p className="text-sm text-green-600 mt-1">
                  {Math.round((completedTasks / totalTasks) * 100)}% done
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Milestones</p>
                <p className="text-2xl font-bold text-gray-900">{completedMilestones}/{totalMilestones}</p>
                <p className="text-sm text-blue-600 mt-1">
                  {Math.round((completedMilestones / totalMilestones) * 100)}% complete
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-2xl font-bold text-gray-900">{project.spent}</p>
                <p className="text-sm text-orange-600 mt-1">of {project.budget}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Priority</p>
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Start Date</p>
                      <p className="text-sm text-gray-900">{project.startDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">End Date</p>
                      <p className="text-sm text-gray-900">{project.endDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Budget</p>
                      <p className="text-sm text-gray-900">{project.budget}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Spent</p>
                      <p className="text-sm text-gray-900">{project.spent}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.team.map((member, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          member.status === 'online' ? 'bg-green-500' :
                          member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-600">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Project Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {milestone.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                      <p className="text-sm text-gray-600">Due: {milestone.dueDate}</p>
                    </div>
                    <div>
                      <Badge className={milestone.completed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {milestone.completed ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Project Tasks
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      {getTaskStatusIcon(task.status)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">Assigned to: {task.assignee}</span>
                        <span className="text-sm text-gray-600">Due: {task.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.team.map((member, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          member.status === 'online' ? 'bg-green-500' :
                          member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tasks Assigned</span>
                        <span className="font-medium">
                          {project.tasks.filter(task => task.assignee === member.name).length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-medium text-green-600">
                          {project.tasks.filter(task => task.assignee === member.name && task.status === 'completed').length}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
