"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import {
  Target,
  Shirt,
  Users,
  Clock,
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
} from "lucide-react"

export default function ScrumTools() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [activeSession, setActiveSession] = useState("poker")

  // Poker Planning Data
  const pokerCards = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "?", "∞"]
  const teamMembers = [
    { name: "John Doe", avatar: "/placeholder-user.jpg", hasVoted: true, vote: 8 },
    { name: "Jane Smith", avatar: "/placeholder-user.jpg", hasVoted: true, vote: 5 },
    { name: "Mike Johnson", avatar: "/placeholder-user.jpg", hasVoted: false, vote: null },
    { name: "Sarah Wilson", avatar: "/placeholder-user.jpg", hasVoted: true, vote: 13 },
    { name: "David Brown", avatar: "/placeholder-user.jpg", hasVoted: false, vote: null },
  ]

  const currentStory = {
    title: "Implement user authentication system",
    description: "Create a secure login system with JWT tokens, password hashing, and session management",
    acceptanceCriteria: [
      "User can register with email and password",
      "User can login with valid credentials",
      "JWT tokens are generated and validated",
      "Password is hashed using bcrypt",
      "Session timeout after 24 hours"
    ]
  }

  // T-shirt Sizing Data
  const tshirtSizes = [
    { size: "XS", description: "Very small task", color: "bg-gray-100 text-gray-800", points: "1-2" },
    { size: "S", description: "Small task", color: "bg-green-100 text-green-800", points: "3-5" },
    { size: "M", description: "Medium task", color: "bg-blue-100 text-blue-800", points: "6-8" },
    { size: "L", description: "Large task", color: "bg-yellow-100 text-yellow-800", points: "9-13" },
    { size: "XL", description: "Extra large task", color: "bg-orange-100 text-orange-800", points: "14-21" },
    { size: "XXL", description: "Very large task", color: "bg-red-100 text-red-800", points: "22+" },
  ]

  const userStories = [
    {
      id: 1,
      title: "User Registration",
      description: "Allow new users to create an account",
      size: "M",
      votes: { XS: 0, S: 1, M: 3, L: 1, XL: 0, XXL: 0 },
      finalSize: "M"
    },
    {
      id: 2,
      title: "Password Reset",
      description: "Enable users to reset forgotten passwords",
      size: "S",
      votes: { XS: 0, S: 4, M: 1, L: 0, XL: 0, XXL: 0 },
      finalSize: "S"
    },
    {
      id: 3,
      title: "Two-Factor Authentication",
      description: "Implement 2FA for enhanced security",
      size: "L",
      votes: { XS: 0, S: 0, M: 1, L: 2, XL: 2, XXL: 0 },
      finalSize: "XL"
    },
    {
      id: 4,
      title: "Social Login Integration",
      description: "Allow login with Google and Facebook",
      size: "M",
      votes: { XS: 0, S: 1, M: 2, L: 2, XL: 0, XXL: 0 },
      finalSize: "L"
    }
  ]

  const handleCardSelect = (card: number | string) => {
    setSelectedCard(card as number)
  }

  const handleReveal = () => {
    setRevealed(!revealed)
  }

  const handleReset = () => {
    setSelectedCard(null)
    setRevealed(false)
  }

  const getVoteDistribution = () => {
    const votes = teamMembers.filter(member => member.hasVoted).map(member => member.vote)
    const distribution: { [key: string]: number } = {}
    
    votes.forEach(vote => {
      if (vote !== null) {
        distribution[vote.toString()] = (distribution[vote.toString()] || 0) + 1
      }
    })
    
    return distribution
  }

  const getConsensus = () => {
    const distribution = getVoteDistribution()
    const maxVotes = Math.max(...Object.values(distribution))
    const consensus = Object.keys(distribution).find(key => distribution[key] === maxVotes)
    
    return consensus || "No consensus"
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
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

        {/* Planning Poker Tab */}
        <TabsContent value="poker" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Story */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Current Story
                </CardTitle>
                <CardDescription>Story being estimated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentStory.title}</h3>
                    <p className="text-gray-600 mb-4">{currentStory.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Acceptance Criteria:</h4>
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
              </CardContent>
            </Card>

            {/* Team Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Status
                </CardTitle>
                <CardDescription>Voting progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
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
                
                {revealed && (
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

          {/* Poker Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Planning Poker Cards
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReveal}
                    className="flex items-center gap-2"
                  >
                    {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {revealed ? "Hide" : "Reveal"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
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
                      selectedCard === card 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleCardSelect(card)}
                  >
                    {card}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vote Distribution */}
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
                              style={{ width: `${(count / teamMembers.filter(m => m.hasVoted).length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 w-8">
                            {count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* T-shirt Sizing Tab */}
        <TabsContent value="tshirt" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Size Guide */}
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
                      <Badge className={`${size.color} font-bold`}>
                        {size.size}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{size.description}</p>
                        <p className="text-xs text-gray-500">{size.points} story points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Stories */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  User Stories
                </CardTitle>
                <CardDescription>Stories to be sized</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userStories.map((story) => (
                    <div key={story.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{story.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{story.description}</p>
                        </div>
                        <Badge className={`${tshirtSizes.find(s => s.size === story.finalSize)?.color} font-bold`}>
                          {story.finalSize}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Vote Distribution:</p>
                        <div className="grid grid-cols-6 gap-2">
                          {Object.entries(story.votes).map(([size, count]) => (
                            <div key={size} className="text-center">
                              <div className={`p-2 rounded-lg ${
                                count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                              }`}>
                                <div className="font-bold text-sm">{size}</div>
                                <div className="text-xs">{count}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* T-shirt Sizing Session */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="w-5 h-5" />
                T-shirt Sizing Session
              </CardTitle>
              <CardDescription>Interactive sizing for current story</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Current Story: User Profile Management</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Allow users to view and edit their profile information including personal details, 
                    contact information, and preferences.
                  </p>
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
                      onClick={() => setSelectedCard(size.size as any)}
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
                    <Button variant="outline" size="sm">
                      <Minus className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button size="sm">
                      Next
                      <Plus className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
