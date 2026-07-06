"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { apiRequest, getEndpointUrl } from "@/lib/api"
import {
  Plus,
  Calendar,
  Clock,
  Users,
  Target,
  CheckCircle,
  Circle,
  ArrowLeft,
  Filter,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Loader2,
} from "lucide-react"

interface SprintSummary {
  name: string
  total_tasks: number
  completed_tasks: number
  story_points: number
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

interface SprintView {
  name: string
  total_tasks: number
  completed_tasks: number
  story_points: number
  progress: number
  status: "active" | "completed" | "planning"
  stories: ProjectTask[]
}

const formatStatus = (status: string) => status.replace(/_/g, " ")

export default function SprintPlanning() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("current")
  const [loading, setLoading] = useState(true)
  const [sprints, setSprints] = useState<SprintView[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [sprintSummaries, tasks] = await Promise.all([
          apiRequest<SprintSummary[]>(getEndpointUrl("PROJECT_TASKS_SPRINTS")),
          apiRequest<ProjectTask[]>(getEndpointUrl("PROJECT_TASKS")),
        ])

        const taskList = Array.isArray(tasks) ? tasks : []
        const summaries = Array.isArray(sprintSummaries) ? sprintSummaries : []

        const sprintViews: SprintView[] = summaries.map((s) => {
          const stories = taskList.filter((t) => t.sprint_name === s.name)
          const progress = s.total_tasks > 0 ? Math.round((s.completed_tasks / s.total_tasks) * 100) : 0
          let status: SprintView["status"] = "planning"
          if (s.completed_tasks === s.total_tasks && s.total_tasks > 0) {
            status = "completed"
          } else if (s.completed_tasks > 0 || stories.some((t) => t.status === "in_progress")) {
            status = "active"
          }

          return { ...s, progress, status, stories }
        })

        setSprints(sprintViews)
      } catch {
        setSprints([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const currentSprints = useMemo(() => sprints.filter((s) => s.status === "active"), [sprints])
  const completedSprints = useMemo(() => sprints.filter((s) => s.status === "completed"), [sprints])
  const plannedSprints = useMemo(() => sprints.filter((s) => s.status === "planning"), [sprints])
  const currentSprint = currentSprints[0] ?? null

  const velocity = useMemo(() => {
    if (completedSprints.length === 0) return 0
    const totalPoints = completedSprints.reduce((sum, s) => sum + s.story_points, 0)
    return Math.round(totalPoints / completedSprints.length)
  }, [completedSprints])

  const teamMembers = useMemo(() => {
    const members = new Map<string, number>()
    for (const sprint of sprints) {
      for (const story of sprint.stories) {
        const name = story.assignee || "Unassigned"
        members.set(name, (members.get(name) ?? 0) + (story.story_points ?? 0))
      }
    }
    return Array.from(members.entries()).map(([name, points]) => ({ name, points }))
  }, [sprints])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "done":
        return "bg-green-100 text-green-800"
      case "active":
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "planning":
      case "pending":
      case "backlog":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStoryStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "done":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />
      default:
        return <Circle className="w-4 h-4 text-gray-400" />
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
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl lg:text-2xl sm:text-3xl font-bold text-gray-900">Sprint Planning</h1>
            <p className="text-gray-600">Manage your agile sprints and team capacity</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Sprint
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Sprint</p>
                <p className="text-2xl font-bold text-gray-900 truncate">
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
                <p className="text-sm font-medium text-gray-600">Story Points</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentSprint ? currentSprint.story_points : 0}
                </p>
                <p className="text-sm text-purple-600 mt-1">In active sprint</p>
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
                <p className="text-2xl font-bold text-gray-900">{velocity}</p>
                <p className="text-sm text-orange-600 mt-1">Avg points/sprint</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {sprints.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No sprints yet</h3>
            <p>Assign sprint names to tasks to see sprint planning data</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hrms-tabs-scroll">
            <TabsTrigger value="current">Current Sprint</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {currentSprint ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        {currentSprint.name}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause Sprint
                        </Button>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          End Sprint
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {currentSprint.completed_tasks}/{currentSprint.total_tasks} tasks completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Sprint Progress</p>
                        <Progress value={currentSprint.progress} className="mb-2" />
                        <p className="text-sm text-gray-600">{currentSprint.progress}% complete</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Tasks</p>
                        <p className="text-lg font-semibold text-gray-900">{currentSprint.total_tasks}</p>
                        <p className="text-sm text-gray-600">Total stories</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Story Points</p>
                        <p className="text-lg font-semibold text-gray-900">{currentSprint.story_points}</p>
                        <p className="text-sm text-gray-600">Total points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Sprint Stories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentSprint.stories.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">No stories in this sprint</p>
                    ) : (
                      <div className="space-y-3">
                        {currentSprint.stories.map((story) => (
                          <div key={story.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="flex-shrink-0">{getStoryStatusIcon(story.status)}</div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{story.title}</h4>
                              <p className="text-sm text-gray-600">
                                {story.story_points ?? 0} story points · {story.assignee}
                              </p>
                            </div>
                            <Badge className={getStatusColor(story.status)}>{formatStatus(story.status)}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
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

          <TabsContent value="completed" className="space-y-6">
            {completedSprints.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>No completed sprints yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedSprints.map((sprint) => (
                  <Card key={sprint.name}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          {sprint.name}
                        </div>
                        <Badge className={getStatusColor("completed")}>completed</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Stories Completed</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {sprint.completed_tasks}/{sprint.total_tasks}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Points</p>
                          <p className="text-lg font-semibold text-gray-900">{sprint.story_points}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Progress</p>
                          <p className="text-lg font-semibold text-gray-900">{sprint.progress}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="planning" className="space-y-6">
            {plannedSprints.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>No sprints in planning</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {plannedSprints.map((sprint) => (
                  <Card key={sprint.name}>
                    <CardHeader>
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          {sprint.name}
                        </div>
                        <Button size="sm" className="w-full sm:w-auto">
                          <Play className="w-4 h-4 mr-2" />
                          Start Sprint
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Stories Planned</p>
                          <p className="text-lg font-semibold text-gray-900">{sprint.total_tasks}</p>
                          <p className="text-sm text-gray-600">{sprint.story_points} total points</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Stories</p>
                          <div className="space-y-2">
                            {sprint.stories.slice(0, 3).map((story) => (
                              <p key={story.id} className="text-sm text-gray-700 truncate">
                                {story.title}
                              </p>
                            ))}
                            {sprint.stories.length > 3 && (
                              <p className="text-xs text-gray-500">+{sprint.stories.length - 3} more</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Capacity
          </CardTitle>
          <CardDescription>Story points by assignee across sprints</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No team data available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {teamMembers.map((member) => (
                <div key={member.name} className="p-4 border rounded-lg text-center">
                  <h4 className="font-medium text-gray-900 mb-1">{member.name}</h4>
                  <p className="text-sm font-medium text-blue-600">{member.points} points</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
