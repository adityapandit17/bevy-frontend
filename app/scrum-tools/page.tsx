"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiRequest, getEndpointUrl } from "@/lib/api"
import {
  Target,
  Shirt,
  Users,
  CheckCircle,
  Circle,
  RotateCcw,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Zap,
  BarChart3,
  Calendar,
  MessageSquare,
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

interface TeamMember {
  name: string
  hasVoted: boolean
  vote: number | null
}

const pokerCards = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "?", "∞"]

const tshirtSizes = [
  { size: "XS", description: "Very small task", color: "bg-gray-100 text-gray-800", points: "1-2" },
  { size: "S", description: "Small task", color: "bg-green-100 text-green-800", points: "3-5" },
  { size: "M", description: "Medium task", color: "bg-blue-100 text-blue-800", points: "6-8" },
  { size: "L", description: "Large task", color: "bg-yellow-100 text-yellow-800", points: "9-13" },
  { size: "XL", description: "Extra large task", color: "bg-orange-100 text-orange-800", points: "14-21" },
  { size: "XXL", description: "Very large task", color: "bg-red-100 text-red-800", points: "22+" },
]

const storyPointsToSize = (points: number | null): string => {
  if (points == null) return "—"
  if (points <= 2) return "XS"
  if (points <= 5) return "S"
  if (points <= 8) return "M"
  if (points <= 13) return "L"
  if (points <= 21) return "XL"
  return "XXL"
}

export default function ScrumTools() {
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<number | string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [activeSession, setActiveSession] = useState("poker")
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      try {
        const data = await apiRequest<ProjectTask[]>(getEndpointUrl("PROJECT_TASKS"))
        const taskList = Array.isArray(data) ? data : []
        setTasks(taskList)

        const assignees = [...new Set(taskList.map((t) => t.assignee).filter(Boolean))]
        setTeamMembers(
          assignees.slice(0, 6).map((name, i) => ({
            name,
            hasVoted: i % 2 === 0,
            vote: i % 2 === 0 ? [3, 5, 8, 13][i % 4] : null,
          }))
        )
      } catch {
        setTasks([])
        setTeamMembers([])
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const inProgressTask = useMemo(
    () => tasks.find((t) => t.status === "in_progress") ?? tasks[0] ?? null,
    [tasks]
  )

  const userStories = useMemo(
    () =>
      tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "No description provided",
        size: storyPointsToSize(task.story_points),
        storyPoints: task.story_points,
        status: task.status,
        projectName: task.project_name,
      })),
    [tasks]
  )

  const currentStory = inProgressTask
    ? {
        title: inProgressTask.title,
        description: inProgressTask.description || "No description provided",
        acceptanceCriteria: inProgressTask.tags?.length
          ? inProgressTask.tags.map((tag) => `Includes: ${tag}`)
          : [
              `Status: ${inProgressTask.status.replace(/_/g, " ")}`,
              `Priority: ${inProgressTask.priority}`,
              inProgressTask.sprint_name ? `Sprint: ${inProgressTask.sprint_name}` : "Not assigned to a sprint",
            ],
      }
    : null

  const tshirtCurrentStory = userStories[currentStoryIndex] ?? null

  const handleCardSelect = (card: number | string) => {
    setSelectedCard(card)
  }

  const handleReveal = () => {
    setRevealed(!revealed)
  }

  const handleReset = () => {
    setSelectedCard(null)
    setRevealed(false)
  }

  const getVoteDistribution = () => {
    const votes = teamMembers.filter((member) => member.hasVoted).map((member) => member.vote)
    const distribution: Record<string, number> = {}

    votes.forEach((vote) => {
      if (vote !== null) {
        distribution[vote.toString()] = (distribution[vote.toString()] || 0) + 1
      }
    })

    return distribution
  }

  const getConsensus = () => {
    const distribution = getVoteDistribution()
    const values = Object.values(distribution)
    if (values.length === 0) return "No consensus"
    const maxVotes = Math.max(...values)
    const consensus = Object.keys(distribution).find((key) => distribution[key] === maxVotes)
    return consensus || "No consensus"
  }

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
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Scrum Tools</h1>
          <p className="text-gray-600">Planning poker and t-shirt sizing for agile estimation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Session
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      <Tabs value={activeSession} onValueChange={setActiveSession} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="poker" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Planning Poker
          </TabsTrigger>
          <TabsTrigger value="tshirt" className="flex items-center gap-2">
            <Shirt className="w-4 h-4" />
            T-shirt Sizing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="poker" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Current Story
                </CardTitle>
                <CardDescription>Story being estimated</CardDescription>
              </CardHeader>
              <CardContent>
                {!currentStory ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>No tasks available. Create project tasks to start estimating.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentStory.title}</h3>
                      <p className="text-gray-600 mb-4">{currentStory.description}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Details:</h4>
                      <ul className="space-y-1">
                        {currentStory.acceptanceCriteria.map((criteria, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Status
                </CardTitle>
                <CardDescription>Voting progress</CardDescription>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <p className="text-center py-4 text-gray-500 text-sm">No team members from tasks</p>
                ) : (
                  <div className="space-y-3">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <div className="flex items-center gap-2">
                            {member.hasVoted ? (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-600">
                                  {revealed ? `Voted: ${member.vote}` : "Voted"}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Circle className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">Waiting...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {revealed && teamMembers.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Consensus</span>
                    </div>
                    <p className="text-lg font-bold text-green-900">{getConsensus()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Planning Poker Cards
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleReveal} className="flex items-center gap-2">
                    {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {revealed ? "Hide" : "Reveal"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset} className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>Select your estimate for the current story</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-13 gap-3">
                {pokerCards.map((card, index) => (
                  <Button
                    key={index}
                    variant={selectedCard === card ? "default" : "outline"}
                    className={`h-16 text-lg font-bold ${
                      selectedCard === card ? "bg-green-600 hover:bg-green-700" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleCardSelect(card)}
                    disabled={!currentStory}
                  >
                    {card}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {revealed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Vote Distribution
                </CardTitle>
                <CardDescription>How the team voted</CardDescription>
              </CardHeader>
              <CardContent>
                {teamMembers.filter((m) => m.hasVoted).length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No votes yet</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(getVoteDistribution()).map(([vote, count]) => (
                      <div key={vote} className="flex items-center gap-3">
                        <div className="w-12 text-center">
                          <span className="font-bold text-lg">{vote}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                              <div
                                className="bg-green-600 h-4 rounded-full transition-all duration-300"
                                style={{
                                  width: `${(count / teamMembers.filter((m) => m.hasVoted).length) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600 w-8">{count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tshirt" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="w-5 h-5" />
                  Size Guide
                </CardTitle>
                <CardDescription>Estimation guidelines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tshirtSizes.map((size, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <Badge className={`${size.color} font-bold`}>{size.size}</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{size.description}</p>
                        <p className="text-xs text-gray-500">{size.points} story points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  User Stories
                </CardTitle>
                <CardDescription>Stories from project tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {userStories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>No user stories available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userStories.map((story) => (
                      <div key={story.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{story.title}</h3>
                            <p className="text-sm text-gray-600 mb-1">{story.description}</p>
                            {story.projectName && (
                              <p className="text-xs text-gray-500">{story.projectName}</p>
                            )}
                          </div>
                          <Badge
                            className={`${tshirtSizes.find((s) => s.size === story.size)?.color ?? "bg-gray-100 text-gray-800"} font-bold`}
                          >
                            {story.size}
                          </Badge>
                        </div>
                        {story.storyPoints != null && (
                          <p className="text-sm text-gray-600">{story.storyPoints} story points assigned</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="w-5 h-5" />
                T-shirt Sizing Session
              </CardTitle>
              <CardDescription>Interactive sizing for current story</CardDescription>
            </CardHeader>
            <CardContent>
              {!tshirtCurrentStory ? (
                <div className="text-center py-8 text-gray-500">
                  <Shirt className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>No stories to size</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Current Story: {tshirtCurrentStory.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{tshirtCurrentStory.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {tshirtSizes.map((size, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className={`h-20 flex-col gap-1 ${
                          selectedCard === size.size
                            ? "bg-green-100 border-green-500 text-green-800"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedCard(size.size)}
                      >
                        <span className="font-bold text-lg">{size.size}</span>
                        <span className="text-xs text-center">{size.points}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {selectedCard ? `Selected: ${selectedCard}` : "Select a size for this story"}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStoryIndex((i) => Math.max(0, i - 1))}
                        disabled={currentStoryIndex === 0}
                      >
                        <Minus className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          setCurrentStoryIndex((i) => Math.min(userStories.length - 1, i + 1))
                        }
                        disabled={currentStoryIndex >= userStories.length - 1}
                      >
                        Next
                        <Plus className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
