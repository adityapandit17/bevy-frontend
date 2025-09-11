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
  Plus,
  Calendar,
  Clock,
  Users,
  Target,
  CheckCircle,
  Circle,
  AlertCircle,
  ArrowLeft,
  Filter,
  Search,
  Zap,
  BarChart3,
  Activity,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
} from "lucide-react"

export default function SprintPlanning() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("current")

  const sprints = [
    {
      id: 1,
      name: "Sprint 1 - Foundation",
      status: "completed",
      startDate: "2024-01-15",
      endDate: "2024-01-29",
      duration: 14,
      goal: "Set up project foundation and basic authentication",
      progress: 100,
      teamCapacity: 40,
      usedCapacity: 40,
      stories: [
        { id: 1, title: "Project setup and configuration", points: 2, status: "completed" },
        { id: 2, title: "Database schema design", points: 5, status: "completed" },
        { id: 3, title: "User authentication system", points: 8, status: "completed" },
        { id: 4, title: "Basic UI framework setup", points: 3, status: "completed" },
      ],
      burndown: [
        { day: 1, remaining: 18 },
        { day: 2, remaining: 16 },
        { day: 3, remaining: 15 },
        { day: 4, remaining: 13 },
        { day: 5, remaining: 12 },
        { day: 6, remaining: 10 },
        { day: 7, remaining: 8 },
        { day: 8, remaining: 7 },
        { day: 9, remaining: 5 },
        { day: 10, remaining: 3 },
        { day: 11, remaining: 2 },
        { day: 12, remaining: 1 },
        { day: 13, remaining: 0 },
        { day: 14, remaining: 0 },
      ]
    },
    {
      id: 2,
      name: "Sprint 2 - Core Features",
      status: "active",
      startDate: "2024-02-01",
      endDate: "2024-02-15",
      duration: 14,
      goal: "Implement core HR features - dashboard and attendance",
      progress: 65,
      teamCapacity: 40,
      usedCapacity: 26,
      stories: [
        { id: 5, title: "User dashboard development", points: 8, status: "in-progress" },
        { id: 6, title: "Attendance tracking system", points: 5, status: "in-progress" },
        { id: 7, title: "Leave management features", points: 5, status: "pending" },
        { id: 8, title: "API integration for attendance", points: 3, status: "completed" },
        { id: 9, title: "Mobile responsive design", points: 3, status: "pending" },
      ],
      burndown: [
        { day: 1, remaining: 24 },
        { day: 2, remaining: 22 },
        { day: 3, remaining: 20 },
        { day: 4, remaining: 18 },
        { day: 5, remaining: 16 },
        { day: 6, remaining: 14 },
        { day: 7, remaining: 12 },
        { day: 8, remaining: 10 },
        { day: 9, remaining: 8 },
        { day: 10, remaining: 6 },
        { day: 11, remaining: 4 },
        { day: 12, remaining: 2 },
        { day: 13, remaining: 1 },
        { day: 14, remaining: 0 },
      ]
    },
    {
      id: 3,
      name: "Sprint 3 - Advanced Features",
      status: "planning",
      startDate: "2024-02-16",
      endDate: "2024-03-01",
      duration: 14,
      goal: "Add advanced features - payroll integration and reporting",
      progress: 0,
      teamCapacity: 40,
      usedCapacity: 0,
      stories: [
        { id: 10, title: "Payroll system integration", points: 8, status: "pending" },
        { id: 11, title: "Reporting dashboard", points: 5, status: "pending" },
        { id: 12, title: "Performance tracking", points: 5, status: "pending" },
        { id: 13, title: "Document management", points: 3, status: "pending" },
        { id: 14, title: "Notification system", points: 3, status: "pending" },
      ],
      burndown: []
    }
  ]

  const teamMembers = [
    { name: "John Doe", role: "Scrum Master", capacity: 8, avatar: "/placeholder-user.jpg" },
    { name: "Jane Smith", role: "Frontend Developer", capacity: 8, avatar: "/placeholder-user.jpg" },
    { name: "Mike Johnson", role: "Backend Developer", capacity: 8, avatar: "/placeholder-user.jpg" },
    { name: "Sarah Wilson", role: "UI/UX Designer", capacity: 8, avatar: "/placeholder-user.jpg" },
    { name: "David Brown", role: "QA Engineer", capacity: 8, avatar: "/placeholder-user.jpg" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      case "planning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStoryStatusIcon = (status: string) => {
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

  const currentSprint = sprints.find(sprint => sprint.status === "active")
  const completedSprints = sprints.filter(sprint => sprint.status === "completed")
  const plannedSprints = sprints.filter(sprint => sprint.status === "planning")

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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Sprint Planning</h1>
            <p className="text-gray-600">Manage your agile sprints and team capacity</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Sprint
          </Button>
        </div>
      </div>

      {/* Sprint Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Sprint</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentSprint ? currentSprint.name : "None"}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {currentSprint ? `${currentSprint.progress}% complete` : "No active sprint"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Completed Sprints</p>
                <p className="text-2xl font-bold text-gray-900">{completedSprints.length}</p>
                <p className="text-sm text-green-600 mt-1">Total completed</p>
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
                <p className="text-sm font-medium text-gray-600">Team Capacity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentSprint ? `${currentSprint.usedCapacity}/${currentSprint.teamCapacity}` : "0/40"}
                </p>
                <p className="text-sm text-purple-600 mt-1">Story points</p>
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
                <p className="text-sm font-medium text-gray-600">Velocity</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
                <p className="text-sm text-orange-600 mt-1">Avg points/sprint</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Sprint</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        {/* Current Sprint Tab */}
        <TabsContent value="current" className="space-y-6">
          {currentSprint ? (
            <>
              {/* Current Sprint Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      {currentSprint.name}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Sprint
                      </Button>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        End Sprint
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>{currentSprint.goal}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Sprint Progress</p>
                      <Progress value={currentSprint.progress} className="mb-2" />
                      <p className="text-sm text-gray-600">{currentSprint.progress}% complete</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Duration</p>
                      <p className="text-lg font-semibold text-gray-900">{currentSprint.duration} days</p>
                      <p className="text-sm text-gray-600">
                        {currentSprint.startDate} - {currentSprint.endDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Capacity</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {currentSprint.usedCapacity}/{currentSprint.teamCapacity} points
                      </p>
                      <p className="text-sm text-gray-600">
                        {Math.round((currentSprint.usedCapacity / currentSprint.teamCapacity) * 100)}% utilized
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sprint Stories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Sprint Stories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentSprint.stories.map((story) => (
                        <div key={story.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            {getStoryStatusIcon(story.status)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{story.title}</h4>
                            <p className="text-sm text-gray-600">{story.points} story points</p>
                          </div>
                          <Badge className={getStatusColor(story.status)}>
                            {story.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Burndown Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Burndown Chart
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-48 flex items-end justify-between gap-1">
                        {currentSprint.burndown.map((point, index) => (
                          <div key={index} className="flex flex-col items-center gap-1">
                            <div
                              className="w-4 bg-blue-600 rounded-t"
                              style={{ height: `${(point.remaining / 24) * 100}%` }}
                            />
                            <span className="text-xs text-gray-500">{point.day}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          Remaining: {currentSprint.burndown[currentSprint.burndown.length - 1]?.remaining || 0} points
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Sprint</h3>
                <p className="text-gray-600 mb-4">Start a new sprint to begin tracking progress</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Sprint
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Completed Sprints Tab */}
        <TabsContent value="completed" className="space-y-6">
          <div className="space-y-4">
            {completedSprints.map((sprint) => (
              <Card key={sprint.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      {sprint.name}
                    </div>
                    <Badge className={getStatusColor(sprint.status)}>
                      {sprint.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{sprint.goal}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Duration</p>
                      <p className="text-lg font-semibold text-gray-900">{sprint.duration} days</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stories Completed</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {sprint.stories.filter(s => s.status === "completed").length}/{sprint.stories.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Points</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {sprint.stories.reduce((sum, story) => sum + story.points, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Period</p>
                      <p className="text-sm text-gray-900">
                        {sprint.startDate} - {sprint.endDate}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Planning Tab */}
        <TabsContent value="planning" className="space-y-6">
          <div className="space-y-4">
            {plannedSprints.map((sprint) => (
              <Card key={sprint.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {sprint.name}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Stories
                      </Button>
                      <Button size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Start Sprint
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>{sprint.goal}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Planned Duration</p>
                      <p className="text-lg font-semibold text-gray-900">{sprint.duration} days</p>
                      <p className="text-sm text-gray-600">
                        {sprint.startDate} - {sprint.endDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Stories Planned</p>
                      <p className="text-lg font-semibold text-gray-900">{sprint.stories.length}</p>
                      <p className="text-sm text-gray-600">
                        {sprint.stories.reduce((sum, story) => sum + story.points, 0)} total points
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Team Capacity</p>
                      <p className="text-lg font-semibold text-gray-900">{sprint.teamCapacity} points</p>
                      <p className="text-sm text-gray-600">Available capacity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Team Capacity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Capacity
          </CardTitle>
          <CardDescription>Current team members and their capacity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="p-4 border rounded-lg text-center">
                <Avatar className="w-12 h-12 mx-auto mb-3">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-medium text-gray-900 mb-1">{member.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                <p className="text-sm font-medium text-blue-600">{member.capacity} points/sprint</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
