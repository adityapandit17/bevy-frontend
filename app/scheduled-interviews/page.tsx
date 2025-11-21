"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, RefreshCw, Eye, Calendar, Phone, Video, MapPin, Clock, MoreHorizontal, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiRequest, getApiUrl, getEndpointUrl } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { useAuthContext } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface Interview {
  id: number
  candidate_id: number
  candidate_name: string
  candidate_email?: string
  interview_type: string
  scheduled_date: string
  scheduled_time: string
  interviewer: string
  status: string
  notes?: string
  feedback?: string
  rating?: number
  is_today?: boolean
  is_overdue?: boolean
  is_upcoming?: boolean
  formatted_time?: string
  formatted_date?: string
  status_color?: string
  scheduled_datetime?: string
}

export default function ScheduledInterviewsPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [employeeName, setEmployeeName] = useState<string | null>(null)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showNoShowDialog, setShowNoShowDialog] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [completeInterviewData, setCompleteInterviewData] = useState({
    feedback: "",
    rating: ""
  })
  const [cancelNotes, setCancelNotes] = useState("")
  const [noShowNotes, setNoShowNotes] = useState("")

  useEffect(() => {
    fetchInterviews()
  }, [user])

  useEffect(() => {
    // Filter interviews based on search term
    if (searchTerm.trim() === "") {
      setFilteredInterviews(interviews)
    } else {
      const filtered = interviews.filter((interview) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          interview.candidate_name?.toLowerCase().includes(searchLower) ||
          interview.candidate_email?.toLowerCase().includes(searchLower) ||
          interview.interview_type?.toLowerCase().includes(searchLower) ||
          interview.notes?.toLowerCase().includes(searchLower)
        )
      })
      setFilteredInterviews(filtered)
    }
  }, [searchTerm, interviews])

  const fetchInterviews = async () => {
    if (!user?.employee_id) return
    
    setLoading(true)
    try {
      // Get employee name to filter interviews (cache it)
      let name = employeeName
      if (!name) {
        const employeeResponse = await apiRequest<any>(getApiUrl(`employees/${user.employee_id}`))
        name = employeeResponse.name || `${employeeResponse.first_name} ${employeeResponse.last_name}`
        setEmployeeName(name)
      }
      
      // Fetch interviews assigned to this employee
      const params = new URLSearchParams()
      params.append('interviewer', name)
      params.append('status', 'scheduled')
      params.append('upcoming', 'true')
      const url = `${getEndpointUrl('INTERVIEWS')}?${params.toString()}`
      
      const res = await apiRequest<Interview[]>(url)
      const interviewsList = Array.isArray(res) ? res : []
      setInterviews(interviewsList)
      setFilteredInterviews(interviewsList)
    } catch (error) {
      console.error('Error fetching interviews:', error)
      toast({
        title: "Error",
        description: "Failed to fetch scheduled interviews. Please try again.",
        variant: "destructive",
      })
      setInterviews([])
      setFilteredInterviews([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string | undefined) => {
    const statusLower = status?.toLowerCase() || ""
    switch (statusLower) {
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

  const getInterviewTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "phone":
        return <Phone className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "onsite":
        return <MapPin className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getInterviewTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case "phone":
        return "Phone"
      case "video":
        return "Video"
      case "onsite":
        return "On-site"
      default:
        return type || "N/A"
    }
  }

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(date)
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
      
      // Format time if available
      if (time) {
        try {
          // Try to parse time string (could be "HH:MM:SS" or "HH:MM")
          const timeParts = time.split(':')
          const hours = parseInt(timeParts[0])
          const minutes = parseInt(timeParts[1] || '0')
          const timeStr = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          })
          return `${formattedDate} at ${timeStr}`
        } catch {
          return formattedDate
        }
      }
      return formattedDate
    } catch {
      return date || "N/A"
    }
  }

  const handleChangeInterviewStatus = async (interview: Interview, newStatus: string, additionalData?: { feedback?: string; rating?: number; notes?: string }) => {
    setIsChangingStatus(true)
    try {
      let url = ""
      let body: any = {}

      switch (newStatus) {
        case "completed":
          url = getApiUrl(`interviews/${interview.id}/complete`)
          body = {
            feedback: additionalData?.feedback || "",
            rating: additionalData?.rating ? parseInt(String(additionalData.rating)) : null
          }
          break
        case "cancelled":
          url = getApiUrl(`interviews/${interview.id}/cancel`)
          body = {
            notes: additionalData?.notes || ""
          }
          break
        case "no_show":
          url = getApiUrl(`interviews/${interview.id}/no_show`)
          body = {
            notes: additionalData?.notes || ""
          }
          break
        default:
          throw new Error("Invalid status")
      }

      await apiRequest<any>(url, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })

      // Refresh interviews
      await fetchInterviews()

      toast({
        title: "Status Updated",
        description: `Interview status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      })
      
      // Close dialogs
      setShowCompleteDialog(false)
      setShowCancelDialog(false)
      setShowNoShowDialog(false)
      setCompleteInterviewData({ feedback: "", rating: "" })
      setCancelNotes("")
      setNoShowNotes("")
      setSelectedInterview(null)
    } catch (error: any) {
      console.error('Error changing interview status:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update interview status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleOpenCompleteDialog = (interview: Interview) => {
    setSelectedInterview(interview)
    setCompleteInterviewData({
      feedback: interview.feedback || "",
      rating: interview.rating ? String(interview.rating) : ""
    })
    setShowCompleteDialog(true)
  }

  const handleOpenCancelDialog = (interview: Interview) => {
    setSelectedInterview(interview)
    setCancelNotes(interview.notes || "")
    setShowCancelDialog(true)
  }

  const handleOpenNoShowDialog = (interview: Interview) => {
    setSelectedInterview(interview)
    setNoShowNotes(interview.notes || "")
    setShowNoShowDialog(true)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Scheduled Interviews
            </h1>
            <p className="text-gray-600 mt-1">Interviews assigned to you that are scheduled</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={fetchInterviews}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Interviews</CardTitle>
          <CardDescription>Manage your scheduled interviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by candidate name, email, or interview type..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Interviews Table */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p>Loading interviews...</p>
              </div>
            ) : filteredInterviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No scheduled interviews found.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Interview Type</TableHead>
                      <TableHead>Scheduled Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInterviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{interview.candidate_name || `Candidate ${interview.candidate_id}`}</div>
                            {interview.candidate_email && (
                              <div className="text-xs text-gray-500">{interview.candidate_email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getInterviewTypeIcon(interview.interview_type)}
                            <span>{getInterviewTypeLabel(interview.interview_type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>
                              {interview.formatted_date && interview.formatted_time
                                ? `${interview.formatted_date} at ${interview.formatted_time}`
                                : formatDateTime(interview.scheduled_date, interview.scheduled_time)}
                            </span>
                          </div>
                          {interview.is_today && (
                            <Badge variant="outline" className="mt-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Today
                            </Badge>
                          )}
                          {interview.is_overdue && (
                            <Badge variant="outline" className="mt-1 text-xs bg-red-50 text-red-700 border-red-200">
                              Overdue
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(interview.status)}>
                            {interview.status || 'Scheduled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {interview.notes || 'No notes'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              {interview.status === "scheduled" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleOpenCompleteDialog(interview)}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Complete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenCancelDialog(interview)}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Interview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenNoShowDialog(interview)}>
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Mark No Show
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem onClick={() => {
                                // View details - could open a detail view or navigate
                                toast({
                                  title: "Interview Details",
                                  description: `${interview.candidate_name} - ${getInterviewTypeLabel(interview.interview_type)} Interview`,
                                })
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Complete Interview Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Complete Interview
            </DialogTitle>
            <DialogDescription>
              Mark this interview as completed and provide feedback
            </DialogDescription>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Interview Details</p>
                <p className="font-medium">{getInterviewTypeLabel(selectedInterview.interview_type)} Interview</p>
                <p className="text-sm text-gray-600">
                  {formatDateTime(selectedInterview.scheduled_date, selectedInterview.scheduled_time)}
                </p>
                <p className="text-sm text-gray-600">Candidate: {selectedInterview.candidate_name}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rating">Rating *</Label>
                <Select 
                  value={completeInterviewData.rating} 
                  onValueChange={(value) => setCompleteInterviewData({ ...completeInterviewData, rating: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Below Average</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Enter feedback about the interview..."
                  value={completeInterviewData.feedback}
                  onChange={(e) => setCompleteInterviewData({ ...completeInterviewData, feedback: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCompleteDialog(false)
                    setCompleteInterviewData({ feedback: "", rating: "" })
                    setSelectedInterview(null)
                  }}
                  disabled={isChangingStatus}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!completeInterviewData.rating) {
                      toast({
                        title: "Rating Required",
                        description: "Please select a rating before completing the interview.",
                        variant: "destructive",
                      })
                      return
                    }
                    handleChangeInterviewStatus(selectedInterview, "completed", {
                      feedback: completeInterviewData.feedback,
                      rating: parseInt(completeInterviewData.rating)
                    })
                  }}
                  disabled={isChangingStatus || !completeInterviewData.rating}
                >
                  {isChangingStatus ? "Completing..." : "Mark Complete"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Interview Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Cancel Interview
            </DialogTitle>
            <DialogDescription>
              Cancel this interview and optionally add notes
            </DialogDescription>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Interview Details</p>
                <p className="font-medium">{getInterviewTypeLabel(selectedInterview.interview_type)} Interview</p>
                <p className="text-sm text-gray-600">
                  {formatDateTime(selectedInterview.scheduled_date, selectedInterview.scheduled_time)}
                </p>
                <p className="text-sm text-gray-600">Candidate: {selectedInterview.candidate_name}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cancel-notes">Notes (Optional)</Label>
                <Textarea
                  id="cancel-notes"
                  placeholder="Enter reason for cancellation..."
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelDialog(false)
                    setCancelNotes("")
                    setSelectedInterview(null)
                  }}
                  disabled={isChangingStatus}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleChangeInterviewStatus(selectedInterview, "cancelled", {
                      notes: cancelNotes
                    })
                  }}
                  disabled={isChangingStatus}
                >
                  {isChangingStatus ? "Cancelling..." : "Cancel Interview"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* No Show Dialog */}
      <Dialog open={showNoShowDialog} onOpenChange={setShowNoShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Mark No Show
            </DialogTitle>
            <DialogDescription>
              Mark this interview as no show and optionally add notes
            </DialogDescription>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Interview Details</p>
                <p className="font-medium">{getInterviewTypeLabel(selectedInterview.interview_type)} Interview</p>
                <p className="text-sm text-gray-600">
                  {formatDateTime(selectedInterview.scheduled_date, selectedInterview.scheduled_time)}
                </p>
                <p className="text-sm text-gray-600">Candidate: {selectedInterview.candidate_name}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="no-show-notes">Notes (Optional)</Label>
                <Textarea
                  id="no-show-notes"
                  placeholder="Enter any notes about the no show..."
                  value={noShowNotes}
                  onChange={(e) => setNoShowNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNoShowDialog(false)
                    setNoShowNotes("")
                    setSelectedInterview(null)
                  }}
                  disabled={isChangingStatus}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleChangeInterviewStatus(selectedInterview, "no_show", {
                      notes: noShowNotes
                    })
                  }}
                  disabled={isChangingStatus}
                >
                  {isChangingStatus ? "Updating..." : "Mark No Show"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

