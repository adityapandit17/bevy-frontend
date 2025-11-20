"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Eye, Calendar, Phone, Video, MapPin, Clock } from "lucide-react"
import { apiRequest, getApiUrl, getEndpointUrl } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { useAuthContext } from "@/lib/auth"

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

interface ScheduledInterviewsModalProps {
  isOpen: boolean
  onClose: () => void
  onRefresh?: () => void
}

export function ScheduledInterviewsModal({
  isOpen,
  onClose,
  onRefresh,
}: ScheduledInterviewsModalProps) {
  const { user } = useAuthContext()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [employeeName, setEmployeeName] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchInterviews()
    }
  }, [isOpen, user])

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Scheduled Interviews
          </DialogTitle>
          <DialogDescription>
            Interviews assigned to you that are scheduled
          </DialogDescription>
        </DialogHeader>

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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={fetchInterviews}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

