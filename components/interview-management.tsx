"use client"

import { useState, useEffect } from "react"
import { getApiUrl, getEndpointUrl, apiRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar,
  Clock,
  User,
  Video,
  Phone,
  MapPin,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Edit,
  Trash2,
  Plus,
  Filter,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar"

interface Interview {
  id: string
  candidate_id: string
  candidate_name: string
  candidate_email: string
  interview_type: "phone" | "video" | "onsite"
  scheduled_date: string
  scheduled_time: string
  interviewer: string
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  notes?: string
  feedback?: string
  rating?: number
  is_today: boolean
  is_overdue: boolean
  is_upcoming: boolean
  formatted_time: string
  formatted_date: string
  status_color: string
  scheduled_datetime: string
}

interface InterviewManagementProps {
  onScheduleInterview?: () => void
}

export function InterviewManagement({ onScheduleInterview }: InterviewManagementProps) {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({})
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [feedbackData, setFeedbackData] = useState({
    feedback: "",
    rating: ""
  })
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    interviewer: ""
  })

  useEffect(() => {
    fetchInterviews()
    fetchStats()
  }, [])

  const fetchInterviews = async () => {
    try {
      const data = await apiRequest<Interview[]>(getEndpointUrl('INTERVIEWS'))
      setInterviews(data)
    } catch (error) {
      console.error("Error fetching interviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiRequest<any>(getEndpointUrl('INTERVIEWS_STATS'))
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleStatusChange = async (interviewId: string, newStatus: string, notes?: string) => {
    try {
      await apiRequest(getApiUrl(`interviews/${interviewId}/${newStatus}`), {
        method: "PATCH",
        body: JSON.stringify({ notes }),
      })

      toast({
        title: "Status Updated",
        description: `Interview status updated to ${newStatus}`
      })
      fetchInterviews()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update interview status",
        variant: "destructive"
      })
    }
  }

  const handleDeleteInterview = async (interviewId: string) => {
    if (!confirm("Are you sure you want to delete this interview?")) return

    try {
      await apiRequest(getApiUrl(`interviews/${interviewId}`), {
        method: "DELETE",
      })

      toast({
        title: "Interview Deleted",
        description: "Interview has been deleted successfully"
      })
      fetchInterviews()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete interview",
        variant: "destructive"
      })
    }
  }

  const handleSubmitFeedback = async () => {
    if (!selectedInterview) return

    try {
      await apiRequest(getApiUrl(`interviews/${selectedInterview.id}/complete`), {
        method: "PATCH",
        body: JSON.stringify({
          feedback: feedbackData.feedback,
          rating: parseInt(feedbackData.rating)
        }),
      })

      toast({
        title: "Feedback Submitted",
        description: "Interview feedback has been submitted successfully"
      })
      setShowFeedbackDialog(false)
      setFeedbackData({ feedback: "", rating: "" })
      fetchInterviews()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      })
    }
  }

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case "phone":
        return <Phone className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "onsite":
        return <MapPin className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no_show":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredInterviews = interviews.filter(interview => {
    if (filters.status && interview.status !== filters.status) return false
    if (filters.type && interview.interview_type !== filters.type) return false
    if (filters.interviewer && !interview.interviewer.includes(filters.interviewer)) return false
    return true
  })

  const todayInterviews = interviews.filter(interview => interview.is_today)
  const upcomingInterviews = interviews.filter(interview => interview.is_upcoming)
  const overdueInterviews = interviews.filter(interview => interview.is_overdue)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading interviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_interviews || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled_interviews || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.interviews_today || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue_interviews || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onScheduleInterview} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Interview
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Interviews
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Interviews */}
      {todayInterviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Interviews ({todayInterviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getInterviewTypeIcon(interview.interview_type)}
                    <div>
                      <p className="font-medium">{interview.candidate_name}</p>
                      <p className="text-sm text-gray-600">{interview.interviewer} • {interview.formatted_time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(interview.status)}>
                      {interview.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedInterview(interview)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {interview.status === "scheduled" && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(interview.id, "completed")}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(interview.id, "no_show")}>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Mark No Show
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(interview.id, "cancelled")}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteInterview(interview.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interview Management Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="hrms-tabs-scroll">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Interviews</CardTitle>
              <CardDescription>
                Manage and track all scheduled interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Interviewer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInterviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{interview.candidate_name}</p>
                          <p className="text-sm text-gray-600">{interview.candidate_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getInterviewTypeIcon(interview.interview_type)}
                          <span className="capitalize">{interview.interview_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{interview.formatted_date}</p>
                          <p className="text-sm text-gray-600">{interview.formatted_time}</p>
                        </div>
                      </TableCell>
                      <TableCell>{interview.interviewer}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(interview.status)}>
                          {interview.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {interview.rating ? (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < interview.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSelectedInterview(interview)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {interview.status === "scheduled" && (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedInterview(interview)
                                  setShowFeedbackDialog(true)
                                }}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete & Rate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(interview.id, "no_show")}>
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  Mark No Show
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(interview.id, "cancelled")}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteInterview(interview.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredInterviews.map((interview) => (
                  <div key={interview.id} className="border rounded-lg p-4 space-y-3 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{interview.candidate_name}</p>
                        <p className="text-sm text-gray-500 truncate">{interview.candidate_email}</p>
                      </div>
                      <Badge className={getStatusColor(interview.status)}>{interview.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Type</span>
                        <p className="font-medium capitalize">{interview.interview_type}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Interviewer</span>
                        <p className="font-medium truncate">{interview.interviewer}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Date & Time</span>
                        <p className="font-medium">{interview.formatted_date} at {interview.formatted_time}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedInterview(interview)}>
                      View / Edit
                    </Button>
                  </div>
                ))}
                {filteredInterviews.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No interviews found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <EnhancedCalendar 
            interviews={interviews}
            onInterviewClick={(interview) => {
              // Handle interview click if needed
              console.log('Interview clicked:', interview)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Interview</DialogTitle>
            <DialogDescription>
              Provide feedback and rating for {selectedInterview?.candidate_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Select value={feedbackData.rating} onValueChange={(value) => setFeedbackData(prev => ({ ...prev, rating: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Fair</SelectItem>
                  <SelectItem value="3">3 - Good</SelectItem>
                  <SelectItem value="4">4 - Very Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Provide detailed feedback about the candidate..."
                value={feedbackData.feedback}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, feedback: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback}>
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 