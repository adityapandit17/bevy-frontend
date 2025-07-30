"use client"

import { useState, useEffect } from "react"
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

interface InterviewManagementUIProps {
  onScheduleInterview?: () => void
}

// Mock interview data
const mockInterviews: Interview[] = [
  {
    id: "1",
    candidate_id: "1",
    candidate_name: "Arjun Mehta",
    candidate_email: "arjun.mehta@email.com",
    interview_type: "phone",
    scheduled_date: "2025-07-24",
    scheduled_time: "04:30",
    interviewer: "Sarah Johnson",
    status: "completed",
    notes: "Good technical discussion, candidate showed strong problem-solving skills",
    feedback: "Positive - Proceed to technical round",
    rating: 4,
    is_today: false,
    is_overdue: false,
    is_upcoming: false,
    formatted_time: "04:30 AM",
    formatted_date: "July 24, 2025",
    status_color: "green",
    scheduled_datetime: "2025-07-24T04:30:00.000+00:00"
  },
  {
    id: "2",
    candidate_id: "1",
    candidate_name: "Arjun Mehta",
    candidate_email: "arjun.mehta@email.com",
    interview_type: "video",
    scheduled_date: "2025-07-31",
    scheduled_time: "08:30",
    interviewer: "Mike Chen",
    status: "scheduled",
    notes: "Technical coding interview",
    feedback: null,
    rating: null,
    is_today: false,
    is_overdue: false,
    is_upcoming: true,
    formatted_time: "08:30 AM",
    formatted_date: "July 31, 2025",
    status_color: "blue",
    scheduled_datetime: "2025-07-31T08:30:00.000+00:00"
  },
  {
    id: "3",
    candidate_id: "3",
    candidate_name: "Rohit Gupta",
    candidate_email: "rohit.gupta@email.com",
    interview_type: "video",
    scheduled_date: "2025-07-27",
    scheduled_time: "05:30",
    interviewer: "Lisa Wang",
    status: "completed",
    notes: "Portfolio review and design discussion",
    feedback: "Excellent design skills, good cultural fit",
    rating: 5,
    is_today: false,
    is_overdue: false,
    is_upcoming: false,
    formatted_time: "05:30 AM",
    formatted_date: "July 27, 2025",
    status_color: "green",
    scheduled_datetime: "2025-07-27T05:30:00.000+00:00"
  },
  {
    id: "4",
    candidate_id: "4",
    candidate_name: "Test Candidate",
    candidate_email: "test@example.com",
    interview_type: "video",
    scheduled_date: "2025-08-05",
    scheduled_time: "14:30",
    interviewer: "John Doe",
    status: "scheduled",
    notes: "Technical interview for Software Engineer position",
    feedback: null,
    rating: null,
    is_today: false,
    is_overdue: false,
    is_upcoming: true,
    formatted_time: "02:30 PM",
    formatted_date: "August 05, 2025",
    status_color: "blue",
    scheduled_datetime: "2025-08-05T14:30:00.000+00:00"
  }
]

// Mock stats
const mockStats = {
  total_interviews: 4,
  scheduled_interviews: 2,
  completed_interviews: 2,
  interviews_today: 0,
  interviews_this_week: 1,
  overdue_interviews: 0,
  type_breakdown: { phone: 1, video: 3 },
  status_breakdown: { completed: 2, scheduled: 2 }
}

export function InterviewManagementUI({ onScheduleInterview }: InterviewManagementUIProps) {
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(mockStats)
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

  const handleStatusChange = async (interviewId: string, newStatus: string, notes?: string) => {
    setLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      setInterviews(prev => prev.map(interview => 
        interview.id === interviewId 
          ? { ...interview, status: newStatus as any, notes: notes || interview.notes }
          : interview
      ))
      
      toast({
        title: "Status Updated",
        description: `Interview status updated to ${newStatus}`
      })
      setLoading(false)
    }, 500)
  }

  const handleDeleteInterview = async (interviewId: string) => {
    if (!confirm("Are you sure you want to delete this interview?")) return

    setLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      setInterviews(prev => prev.filter(interview => interview.id !== interviewId))
      
      toast({
        title: "Interview Deleted",
        description: "Interview has been deleted successfully"
      })
      setLoading(false)
    }, 500)
  }

  const handleSubmitFeedback = async () => {
    if (!selectedInterview) return

    setLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      setInterviews(prev => prev.map(interview => 
        interview.id === selectedInterview.id 
          ? { 
              ...interview, 
              status: "completed" as any,
              feedback: feedbackData.feedback,
              rating: parseInt(feedbackData.rating)
            }
          : interview
      ))
      
      toast({
        title: "Feedback Submitted",
        description: "Interview feedback has been submitted successfully"
      })
      setShowFeedbackDialog(false)
      setFeedbackData({ feedback: "", rating: "" })
      setLoading(false)
    }, 500)
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_interviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled_interviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.interviews_today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue_interviews}</div>
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
        <TabsList>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview Calendar</CardTitle>
              <CardDescription>
                View interviews in a calendar format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Calendar view implementation would go here
                <br />
                <small>This would integrate with a calendar library like FullCalendar or similar</small>
              </div>
            </CardContent>
          </Card>
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