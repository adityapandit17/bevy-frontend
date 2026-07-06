"use client"

import { useState } from "react"
import { InterviewFormUI } from "@/components/forms/interview-form-ui"
import { InterviewManagementUI } from "@/components/interview-management-ui"
import { DemoRouteGuard } from "@/components/demo-route-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, Users, CheckCircle, AlertCircle } from "lucide-react"

export default function InterviewDemoPage() {
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  const demoCandidates = [
    {
      id: "1",
      name: "Arjun Mehta",
      email: "arjun.mehta@email.com",
      position: "Senior Software Engineer",
      status: "Interview Scheduled"
    },
    {
      id: "2", 
      name: "Kavya Nair",
      email: "kavya.nair@email.com",
      position: "Product Manager",
      status: "Under Review"
    },
    {
      id: "3",
      name: "Rohit Gupta", 
      email: "rohit.gupta@email.com",
      position: "UI/UX Designer",
      status: "Shortlisted"
    }
  ]

  const handleScheduleInterview = (candidate = null) => {
    setSelectedCandidate(candidate)
    setShowScheduleForm(true)
  }

  const handleInterviewSuccess = () => {
    setShowScheduleForm(false)
    setSelectedCandidate(null)
    console.log("Interview scheduled successfully!")
  }

  return (
    <DemoRouteGuard>
    <div className="space-y-6 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Interview System Demo</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          This is a UI-only demonstration of the interview scheduling and management system. 
          All data is mock data and no backend integration is required.
        </p>
      </div>

      {/* Demo Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">2</div>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">3</div>
            <p className="text-xs text-muted-foreground">In pipeline</p>
          </CardContent>
        </Card>
      </div>

      {/* Demo Tabs */}
      <Tabs defaultValue="management" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="management">Interview Management</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Full Interview Management System</CardTitle>
              <CardDescription>
                Complete interview management with mock data. Try the actions in the table below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InterviewManagementUI onScheduleInterview={() => setShowScheduleForm(true)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demo Candidates</CardTitle>
              <CardDescription>
                Click on any candidate to schedule an interview for them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {demoCandidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{candidate.name}</h3>
                      <p className="text-sm text-gray-600">{candidate.email}</p>
                      <p className="text-sm text-gray-500">{candidate.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{candidate.status}</Badge>
                      <Button 
                        size="sm" 
                        onClick={() => handleScheduleInterview(candidate)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Schedule Interview
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Scheduling Demo</CardTitle>
              <CardDescription>
                Test the interview scheduling form with different scenarios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">General Interview Scheduling</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Schedule an interview without pre-selecting a candidate. You can enter candidate details manually.
                  </p>
                  <Button onClick={() => handleScheduleInterview()}>
                    Schedule General Interview
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Candidate-Specific Scheduling</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Schedule an interview for a specific candidate. The form will be pre-filled with candidate information.
                  </p>
                  <div className="flex gap-2">
                    {demoCandidates.slice(0, 2).map((candidate) => (
                      <Button 
                        key={candidate.id} 
                        variant="outline" 
                        onClick={() => handleScheduleInterview(candidate)}
                      >
                        Schedule for {candidate.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium mb-2">Features to Test</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Interview type selection (Phone, Video, On-site)</li>
                    <li>• Date and time picker with validation</li>
                    <li>• Interviewer selection from mock employee list</li>
                    <li>• Notes and instructions field</li>
                    <li>• Real-time interview preview</li>
                    <li>• Form validation and error handling</li>
                    <li>• Success notifications</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Interview Form */}
      <InterviewFormUI
        open={showScheduleForm}
        onOpenChange={setShowScheduleForm}
        candidate={selectedCandidate ? {
          id: selectedCandidate.id,
          name: selectedCandidate.name,
          email: selectedCandidate.email,
          position: selectedCandidate.position
        } : undefined}
        onSuccess={handleInterviewSuccess}
      />
    </div>
    </DemoRouteGuard>
  )
} 