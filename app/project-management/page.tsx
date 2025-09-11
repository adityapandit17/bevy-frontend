"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import {
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Circle,
  MoreHorizontal,
  FolderKanban,
  Target,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
} from "lucide-react"

export default function ProjectManagement() {
  const router = useRouter()

  const projects = [
    {
      id: 1,
      name: "HRMS Mobile App",
      description: "Mobile application for employee self-service",
      status: "active",
      progress: 75,
      startDate: "2024-01-15",
      endDate: "2024-03-30",
      team: [
        { name: "John Doe", avatar: "/placeholder-user.jpg" },
        { name: "Jane Smith", avatar: "/placeholder-user.jpg" },
        { name: "Mike Johnson", avatar: "/placeholder-user.jpg" },
      ],
      priority: "high",
      budget: "$50,000",
      tasks: { completed: 15, total: 20 },
    },
    {
      id: 2,
      name: "Payroll System Upgrade",
      description: "Modernizing the existing payroll processing system",
      status: "planning",
      progress: 25,
      startDate: "2024-02-01",
      endDate: "2024-05-15",
      team: [
        { name: "Sarah Wilson", avatar: "/placeholder-user.jpg" },
        { name: "David Brown", avatar: "/placeholder-user.jpg" },
      ],
      priority: "medium",
      budget: "$75,000",
      tasks: { completed: 5, total: 20 },
    },
    {
      id: 3,
      name: "Performance Analytics Dashboard",
      description: "Real-time analytics for employee performance tracking",
      status: "completed",
      progress: 100,
      startDate: "2023-11-01",
      endDate: "2024-01-31",
      team: [
        { name: "Emily Davis", avatar: "/placeholder-user.jpg" },
        { name: "Alex Chen", avatar: "/placeholder-user.jpg" },
        { name: "Lisa Garcia", avatar: "/placeholder-user.jpg" },
      ],
      priority: "high",
      budget: "$30,000",
      tasks: { completed: 18, total: 18 },
    },
    {
      id: 4,
      name: "Document Management System",
      description: "Centralized document storage and management",
      status: "on-hold",
      progress: 40,
      startDate: "2024-01-01",
      endDate: "2024-04-30",
      team: [
        { name: "Tom Wilson", avatar: "/placeholder-user.jpg" },
        { name: "Anna Lee", avatar: "/placeholder-user.jpg" },
      ],
      priority: "low",
      budget: "$25,000",
      tasks: { completed: 8, total: 20 },
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: "task_completed",
      description: "John Doe completed 'User Authentication' task",
      project: "HRMS Mobile App",
      time: "2 hours ago",
      user: "John Doe",
    },
    {
      id: 2,
      type: "milestone_reached",
      description: "Payroll System Upgrade reached 25% completion",
      project: "Payroll System Upgrade",
      time: "4 hours ago",
      user: "Sarah Wilson",
    },
    {
      id: 3,
      type: "project_created",
      description: "New project 'Document Management System' created",
      project: "Document Management System",
      time: "1 day ago",
      user: "Tom Wilson",
    },
    {
      id: 4,
      type: "deadline_approaching",
      description: "HRMS Mobile App deadline approaching in 2 weeks",
      project: "HRMS Mobile App",
      time: "2 days ago",
      user: "System",
    },
  ]

  const upcomingDeadlines = [
    {
      id: 1,
      title: "HRMS Mobile App - Beta Release",
      project: "HRMS Mobile App",
      dueDate: "2024-03-15",
      daysLeft: 7,
      priority: "high",
    },
    {
      id: 2,
      title: "Payroll System - Requirements Review",
      project: "Payroll System Upgrade",
      dueDate: "2024-03-20",
      daysLeft: 12,
      priority: "medium",
    },
    {
      id: 3,
      title: "Document Management - Architecture Design",
      project: "Document Management System",
      dueDate: "2024-03-25",
      daysLeft: 17,
      priority: "low",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "planning":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "on-hold":
        return "bg-yellow-100 text-yellow-800"
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "milestone_reached":
        return <Target className="w-4 h-4 text-blue-600" />
      case "project_created":
        return <FolderKanban className="w-4 h-4 text-purple-600" />
      case "deadline_approaching":
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600">Manage and track all your projects in one place</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/project-management/kanban')}>
            <FolderKanban className="w-4 h-4 mr-2" />
            Kanban Board
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/project-management/sprints')}>
            <Target className="w-4 h-4 mr-2" />
            Sprints
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/project-management/timeline')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Timeline
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-green-600 mt-1">+1 this month</p>
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
                <p className="text-2xl font-bold text-gray-900">46</p>
                <p className="text-sm text-blue-600 mt-1">+12 this week</p>
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
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-purple-600 mt-1">Across all projects</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-2xl font-bold text-gray-900">$180K</p>
                <p className="text-sm text-orange-600 mt-1">of $180K total</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5" />
              Projects
            </CardTitle>
            <CardDescription>All your projects and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/project-management/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {project.startDate} - {project.endDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {project.team.length} members
                        </span>
                        <span>{project.budget}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map((member, index) => (
                          <Avatar key={index} className="w-6 h-6 border-2 border-white">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.team.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{project.team.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {project.tasks.completed}/{project.tasks.total} tasks completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest updates from your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-600 mt-1">{activity.project}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Deadlines
          </CardTitle>
          <CardDescription>Important dates and milestones to keep track of</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{deadline.title}</h4>
                  <Badge className={getPriorityColor(deadline.priority)}>
                    {deadline.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{deadline.project}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Due: {deadline.dueDate}</span>
                  <span className={`text-sm font-medium ${
                    deadline.daysLeft <= 7 ? 'text-red-600' : 
                    deadline.daysLeft <= 14 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {deadline.daysLeft} days left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
