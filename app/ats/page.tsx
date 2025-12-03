"use client"

import { useState, useEffect } from "react"
import { getApiUrl, getEndpointUrl, getDocumentUrl, getFileType, getDisplayName, apiRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  Users,
  Briefcase,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  FileText,
  Download,
  Send,
  CheckCircle,
  XCircle,
  Clock4,
  UserPlus,
  Filter,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Edit,
} from "lucide-react"
import { InterviewForm } from "@/components/forms/interview-form"
import { CandidateForm } from "@/components/forms/candidate-form"
import { DocumentPreview } from "@/components/ui/document-preview"

interface Candidate {
  id: string
  first_name: string
  last_name: string
  date_of_birth?: string
  name?: string // Computed field from backend for display
  email: string
  phone: string
  position: string
  department: string
  experience: string
  location: string
  status: "applied" | "screening" | "interview" | "technical" | "final" | "offered" | "hired" | "rejected"
  applied_date: string
  last_contact: string
  resume: string
  cover_letter?: string
  notes: string
  interviews: Interview[]
  skills: string[]
  education: string
  current_company?: string
  expected_salary?: string
  availability?: string
}

interface Interview {
  id: string
  candidate_id?: string
  interview_type: "phone" | "video" | "onsite"
  scheduled_date: string
  scheduled_time: string
  interviewer: string
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  notes?: string
  feedback?: string
  rating?: number
}

interface JobPosition {
  id: string
  title: string
  department: string
  location: string
  type: "full-time" | "part-time" | "contract"
  status: "active" | "closed"
  applications: number
  hired: number
}

export default function ATSPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showAddCandidate, setShowAddCandidate] = useState(false)
  
  // Save selected candidate to localStorage
  const saveSelectedCandidate = (candidate: Candidate | null) => {
    if (candidate) {
      localStorage.setItem('ats_selected_candidate_id', candidate.id)
    } else {
      localStorage.removeItem('ats_selected_candidate_id')
    }
  }
  
  // Restore selected candidate from localStorage
  const restoreSelectedCandidate = (candidatesList: Candidate[]) => {
    const savedCandidateId = localStorage.getItem('ats_selected_candidate_id')
    if (savedCandidateId) {
      const candidate = candidatesList.find(c => c.id === savedCandidateId)
      if (candidate) {
        setSelectedCandidate(candidate)
      } else {
        // Clear saved candidate if it no longer exists
        localStorage.removeItem('ats_selected_candidate_id')
      }
    }
  }
  const [showEditCandidate, setShowEditCandidate] = useState(false)
  const [showScheduleInterview, setShowScheduleInterview] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailFormData, setEmailFormData] = useState({
    subject: "",
    message: "",
    sender_name: ""
  })
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [showInterviewDetails, setShowInterviewDetails] = useState(false)
  const [showEditInterview, setShowEditInterview] = useState(false)
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const [showCompleteInterviewDialog, setShowCompleteInterviewDialog] = useState(false)
  const [showCancelInterviewDialog, setShowCancelInterviewDialog] = useState(false)
  const [showNoShowDialog, setShowNoShowDialog] = useState(false)
  const [completeInterviewData, setCompleteInterviewData] = useState({
    feedback: "",
    rating: ""
  })
  const [cancelInterviewNotes, setCancelInterviewNotes] = useState("")
  const [noShowNotes, setNoShowNotes] = useState("")
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Helper function to get display name
  const getCandidateDisplayName = (candidate: Candidate) => {
    return candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || "Unknown Candidate"
  }
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    total_applications: 0,
    active_candidates: 0,
    interviews_this_week: 0,
    offers_extended: 0,
    hired_this_month: 0,
    pipeline: {} as Record<string, number>
  })
  const [interviews, setInterviews] = useState<Interview[]>([])
  
  const [previewState, setPreviewState] = useState({
      open: false,
      documentUrl: '',
      documentName: '',
      documentType: ''
    })

  const handleClosePreview = (open: boolean) => {
    setPreviewState(prev => ({ ...prev, open }))
  }

  useEffect(() => {
    fetchCandidates()
    fetchStats()
    fetchInterviews()
  }, [])

  useEffect(() => {
    // Update selected candidate's interviews when interviews data changes
    if (selectedCandidate && interviews.length > 0) {
      const candidateInterviews = interviews.filter(i => 
        i.candidate_id === selectedCandidate.id || 
        (i as any).candidate?.id === selectedCandidate.id
      )
      if (candidateInterviews.length > 0) {
        setSelectedCandidate({
          ...selectedCandidate,
          interviews: candidateInterviews
        })
      }
    }
  }, [interviews])

  const fetchCandidates = async () => {
    try {
      const res = await apiRequest<any[]>(getEndpointUrl('CANDIDATES'))
      setCandidates(res as any)
      // Restore selected candidate from localStorage
      restoreSelectedCandidate(res as any)
    } catch (error) {
      console.error('Error fetching candidates:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const url = getApiUrl('candidates/stats')
      const res = await apiRequest<any>(url)
      setStats(res as any)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchInterviews = async () => {
    try {
      const res = await apiRequest<any[]>(getEndpointUrl('INTERVIEWS'))
      setInterviews(res as any)
    } catch (err) {
      console.error('Error fetching interviews:', err)
    }
  }

  // Calculate change indicators
  const getChangeText = (statType: string) => {
    switch (statType) {
      case "totalApplications":
        const thisWeek = candidates.filter(c => {
          if (!c.applied_date) return false
          const appliedDate = new Date(c.applied_date)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return appliedDate >= weekAgo
        }).length
        return thisWeek > 0 ? `+${thisWeek} this week` : "No new applications"
      case "inPipeline":
        return `${stats.active_candidates} active candidates`
      case "interviewsThisWeek":
        return stats.interviews_this_week > 0 ? `${stats.interviews_this_week} scheduled` : "No interviews"
      case "offersExtended":
        return stats.hired_this_month > 0 ? `${stats.hired_this_month} hired this month` : "No hires this month"
      default:
        return ""
    }
  }

  const atsStats = [
    {
      title: "Total Applications",
      value: stats.total_applications.toString(),
      change: getChangeText("totalApplications"),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "In Pipeline",
      value: stats.active_candidates.toString(),
      change: getChangeText("inPipeline"),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Interviews This Week",
      value: stats.interviews_this_week.toString(),
      change: getChangeText("interviewsThisWeek"),
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Offers Extended",
      value: stats.offers_extended.toString(),
      change: getChangeText("offersExtended"),
      icon: CheckCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  // Build pipeline stages from stats
  const pipelineStages = [
    { stage: "applied", label: "Applied", count: stats.pipeline?.applied || 0, color: "bg-gray-100 text-gray-800" },
    { stage: "screening", label: "Screening", count: stats.pipeline?.screening || 0, color: "bg-blue-100 text-blue-800" },
    { stage: "interview", label: "Interview", count: stats.pipeline?.interview || 0, color: "bg-yellow-100 text-yellow-800" },
    { stage: "technical", label: "Technical", count: stats.pipeline?.technical || 0, color: "bg-purple-100 text-purple-800" },
    { stage: "final", label: "Final", count: stats.pipeline?.final || 0, color: "bg-indigo-100 text-indigo-800" },
    { stage: "offered", label: "Offered", count: stats.pipeline?.offered || 0, color: "bg-green-100 text-green-800" },
    { stage: "hired", label: "Hired", count: stats.pipeline?.hired || 0, color: "bg-emerald-100 text-emerald-800" },
    { stage: "rejected", label: "Rejected", count: stats.pipeline?.rejected || 0, color: "bg-red-100 text-red-800" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-gray-100 text-gray-800"
      case "screening":
        return "bg-blue-100 text-blue-800"
      case "interview":
        return "bg-yellow-100 text-yellow-800"
      case "technical":
        return "bg-purple-100 text-purple-800"
      case "final":
        return "bg-indigo-100 text-indigo-800"
      case "offered":
        return "bg-green-100 text-green-800"
      case "hired":
        return "bg-emerald-100 text-emerald-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInterviewStatusColor = (status: string) => {
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

  const filteredCandidates = candidates.filter(candidate => {
    const displayName = getCandidateDisplayName(candidate)
    const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || candidate.status === filterStatus
    const matchesDepartment = filterDepartment === "all" || candidate.department === filterDepartment
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      const updatedCandidate = await apiRequest<any>(getApiUrl(`candidates/${candidateId}/update_status`), {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      
      // Update the selected candidate immediately if it's the one being updated
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate(updatedCandidate)
      }
      
      // Update the candidates list
      setCandidates(prevCandidates => 
        prevCandidates.map(candidate => 
          candidate.id === candidateId ? updatedCandidate : candidate
        )
      )
      // Refresh stats
      await fetchStats()
    } catch (error) {
      console.error('Error updating candidate status:', error)
    }
  }

  const handleSaveCandidate = async (candidateData: Candidate) => {
    setIsLoading(true)
    try {
      const isEdit = candidateData.id
      const url = isEdit 
        ? getApiUrl(`candidates/${candidateData.id}`)
        : getEndpointUrl('CANDIDATES')
      
      const method = isEdit ? 'PATCH' : 'POST'
      
      const savedCandidate = await apiRequest<any>(url, {
        method,
        body: JSON.stringify({ candidate: candidateData }),
      })
      
      if (isEdit) {
        setCandidates(prev => 
          prev.map(c => c.id === candidateData.id ? savedCandidate : c)
        )
        setSelectedCandidate(savedCandidate)
        saveSelectedCandidate(savedCandidate)
      } else {
        setCandidates(prev => [...prev, savedCandidate])
        setSelectedCandidate(savedCandidate)
        saveSelectedCandidate(savedCandidate)
      }
      
      // Refresh stats after saving
      await fetchStats()
      
      setShowAddCandidate(false)
      setShowEditCandidate(false)
    } catch (error) {
      console.error('Error saving candidate:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    saveSelectedCandidate(candidate)
    setShowEditCandidate(true)
  }

  const handleCancelForm = () => {
    setShowAddCandidate(false)
    setShowEditCandidate(false)
    setSelectedCandidate(null)
    saveSelectedCandidate(null)
  }


  const handleDocumentPreview = (url: string, name: string, type?: string) => {
    setPreviewState({ open: true, documentUrl: url, documentName: name, documentType: type })
  }

  const handleSendEmail = async () => {
    if (!selectedCandidate) return

    if (!emailFormData.subject.trim() || !emailFormData.message.trim()) {
      alert("Please fill in both subject and message fields")
      return
    }

    setIsSendingEmail(true)
    try {
      const response = await apiRequest<any>(getApiUrl(`candidates/${selectedCandidate.id}/send_email`), {
        method: 'POST',
        body: JSON.stringify({
          subject: emailFormData.subject,
          message: emailFormData.message,
          sender_name: emailFormData.sender_name || undefined
        }),
      })

      // Update the candidate with the new last_contact date
      if (response.candidate) {
        setSelectedCandidate(response.candidate)
        setCandidates(prev => 
          prev.map(c => c.id === selectedCandidate.id ? response.candidate : c)
        )
      }

      alert("Email sent successfully!")
      setShowEmailDialog(false)
      setEmailFormData({ subject: "", message: "", sender_name: "" })
    } catch (error: any) {
      console.error('Error sending email:', error)
      alert(`Failed to send email: ${error?.message || 'Please try again.'}`)
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleOpenEmailDialog = () => {
    if (!selectedCandidate) return
    // Pre-fill subject with a default based on candidate status
    const defaultSubject = `Update on Your Application - ${selectedCandidate.position}`
    setEmailFormData({
      subject: defaultSubject,
      message: `Dear ${getCandidateDisplayName(selectedCandidate)},\n\n`,
      sender_name: ""
    })
    setShowEmailDialog(true)
  }

  const handleViewInterviewDetails = (interview: Interview) => {
    setSelectedInterview(interview)
    setShowInterviewDetails(true)
  }

  const handleEditInterview = (interview: Interview) => {
    setSelectedInterview(interview)
    setShowEditInterview(true)
  }

  const handleSendReminder = async (interview: Interview) => {
    if (!selectedCandidate) return

    setIsSendingReminder(true)
    try {
      // Format the interview date and time
      const interviewDate = new Date(interview.scheduled_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const interviewTime = interview.scheduled_time

      // Create reminder message
      const reminderMessage = `Dear ${getCandidateDisplayName(selectedCandidate)},

This is a reminder about your upcoming interview:

Interview Type: ${interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1)} Interview
Date: ${interviewDate}
Time: ${interviewTime}
Interviewer: ${interview.interviewer}

${interview.notes ? `Notes: ${interview.notes}\n\n` : ''}Please make sure to be available at the scheduled time. If you have any questions or need to reschedule, please contact us as soon as possible.

We look forward to speaking with you!

Best regards,
HR Team`

      await apiRequest<any>(getApiUrl(`candidates/${selectedCandidate.id}/send_email`), {
        method: 'POST',
        body: JSON.stringify({
          subject: `Reminder: Interview Scheduled for ${interviewDate}`,
          message: reminderMessage,
          sender_name: "HR Team"
        }),
      })

      // Update the candidate's last contact date
      await fetchCandidates()
      
      // Show success message
      alert("Reminder sent successfully!")
    } catch (error: any) {
      console.error('Error sending reminder:', error)
      alert(`Failed to send reminder: ${error?.message || 'Please try again.'}`)
    } finally {
      setIsSendingReminder(false)
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
        case "scheduled":
          // Use general update endpoint
          url = getApiUrl(`interviews/${interview.id}`)
          body = {
            interview: {
              status: "scheduled"
            }
          }
          break
        default:
          throw new Error("Invalid status")
      }

      const updatedInterview = await apiRequest<any>(url, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })

      // Refresh interviews and candidates
      await fetchInterviews()
      await fetchCandidates()
      
      // Update selected candidate's interviews
      if (selectedCandidate) {
        try {
          const updatedCandidate = await apiRequest<any>(getApiUrl(`candidates/${selectedCandidate.id}`))
          setSelectedCandidate(updatedCandidate)
          saveSelectedCandidate(updatedCandidate)
        } catch (error) {
          console.error('Error refreshing selected candidate:', error)
        }
      }

      // Update selected interview if it's the one being changed
      if (selectedInterview && selectedInterview.id === interview.id) {
        setSelectedInterview(updatedInterview)
      }

      alert(`Interview status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`)
      
      // Close dialogs
      setShowCompleteInterviewDialog(false)
      setShowCancelInterviewDialog(false)
      setShowNoShowDialog(false)
      setCompleteInterviewData({ feedback: "", rating: "" })
      setCancelInterviewNotes("")
      setNoShowNotes("")
    } catch (error: any) {
      console.error('Error changing interview status:', error)
      alert(`Failed to update status: ${error?.message || 'Please try again.'}`)
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
    setShowCompleteInterviewDialog(true)
  }

  const handleOpenCancelDialog = (interview: Interview) => {
    setSelectedInterview(interview)
    setCancelInterviewNotes(interview.notes || "")
    setShowCancelInterviewDialog(true)
  }

  const handleOpenNoShowDialog = (interview: Interview) => {
    setSelectedInterview(interview)
    setNoShowNotes(interview.notes || "")
    setShowNoShowDialog(true)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Applicant Tracking System</h1>
          <p className="text-gray-600">Manage candidate applications and recruitment pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button size="sm" onClick={() => setShowAddCandidate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {atsStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recruitment Pipeline
          </CardTitle>
          <CardDescription>Overview of candidates across different stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {pipelineStages.map((stage) => (
              <div key={stage.stage} className="text-center p-4 border rounded-lg hover:bg-gray-50">
                <Badge className={`mb-2 ${stage.color}`}>{stage.label}</Badge>
                <p className="text-2xl font-bold text-gray-900">{stage.count}</p>
                <p className="text-xs text-gray-500">candidates</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Candidates
            </CardTitle>
            <CardDescription>All candidates in the recruitment pipeline</CardDescription>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="offered">Offered</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto">
            <div className="space-y-3">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedCandidate?.id === candidate.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedCandidate(candidate)
                    saveSelectedCandidate(candidate)
                    // Scroll to the candidate profile section
                    setTimeout(() => {
                      const profileSection = document.getElementById('candidate-profile')
                      if (profileSection) {
                        const elementPosition = profileSection.getBoundingClientRect().top
                        const offsetPosition = elementPosition + window.pageYOffset - 80 // 80px offset to show main header
                        
                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                        })
                      }
                    }, 100)
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{getCandidateDisplayName(candidate)}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(candidate.status)}>
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleEditCandidate(candidate)
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCandidate(candidate)
                              setShowScheduleInterview(true)
                            }}
                            disabled={candidate.status === "rejected"}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Interview
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{candidate.position}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{candidate.department}</span>
                    <span>{new Date(candidate.applied_date).toLocaleDateString()}</span>
                  </div>
                  {candidate.interviews.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{candidate.interviews.length} interview(s)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Candidate Details */}
        <Card id="candidate-profile" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Candidate Profile
                </CardTitle>
                <CardDescription>
                  {selectedCandidate ? `${getCandidateDisplayName(selectedCandidate)} - ${selectedCandidate.position}` : "Select a candidate to view their profile"}
                </CardDescription>
              </div>
              {selectedCandidate && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditCandidate(selectedCandidate)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedCandidate ? (
              <div className="space-y-6">
                {/* Candidate Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contact Information</p>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{selectedCandidate.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{selectedCandidate.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{selectedCandidate.location}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Professional Details</p>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span>{selectedCandidate.experience} experience</span>
                        </div>
                        {selectedCandidate.current_company && (
                          <div className="text-sm text-gray-600">
                            Current: {selectedCandidate.current_company}
                          </div>
                        )}
                        {selectedCandidate.expected_salary && (
                          <div className="text-sm text-gray-600">
                            Expected: {selectedCandidate.expected_salary}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Application Details</p>
                      <div className="space-y-1 mt-2">
                        <div className="text-sm">
                          <span className="font-medium">Applied:</span> {new Date(selectedCandidate.applied_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Last Contact:</span> {new Date(selectedCandidate.last_contact).toLocaleDateString()}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Availability:</span> {selectedCandidate.availability || "Not specified"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Documents</p>
                      <div className="space-y-2 mt-2">
                        {selectedCandidate.resume && (
                          <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 font-medium">
                                Resume
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDocumentPreview(getDocumentUrl(selectedCandidate.resume, false), 'Resume')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const downloadUrl = getDocumentUrl(selectedCandidate.resume, true)
                                  const link = document.createElement('a')
                                  link.href = downloadUrl
                                  link.download = 'Resume.pdf'
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                }}
                                className="h-8 px-2 text-blue-600 hover:text-blue-800"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                        {selectedCandidate.cover_letter && (
                          <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 font-medium">
                                Cover Letter
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDocumentPreview(getDocumentUrl(selectedCandidate.cover_letter, false), 'Cover Letter')}
                                className="h-8 px-2 text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const downloadUrl = getDocumentUrl(selectedCandidate.cover_letter, true)
                                  const link = document.createElement('a')
                                  link.href = downloadUrl
                                  link.download = 'Cover_Letter.pdf'
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                }}
                                className="h-8 px-2 text-blue-600 hover:text-blue-800"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills and Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-3">Education</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <span>{selectedCandidate.education}</span>
                    </div>
                  </div>
                </div>

                {/* Status Management */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Current Status</h3>
                    <Badge className={getStatusColor(selectedCandidate.status)}>
                      {selectedCandidate.status.charAt(0).toUpperCase() + selectedCandidate.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCandidate.status} onValueChange={(value) => handleStatusChange(selectedCandidate.id, value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="screening">Screening</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                        <SelectItem value="offered">Offered</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowScheduleInterview(true)}
                      disabled={selectedCandidate.status === "rejected"}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Interview
                    </Button>
                  </div>
                </div>

                {/* Interviews */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Interviews</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowScheduleInterview(true)}
                      disabled={selectedCandidate.status === "rejected"}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Interview
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {selectedCandidate.interviews.length > 0 ? (
                      selectedCandidate.interviews.map((interview) => (
                        <div key={interview.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge className={getInterviewStatusColor(interview.status)}>
                                {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                              </Badge>
                              <span className="font-medium">{interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1)} Interview</span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewInterviewDetails(interview)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleSendReminder(interview)}
                                  disabled={isSendingReminder || interview.status !== "scheduled"}
                                >
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  {isSendingReminder ? "Sending..." : "Send Reminder"}
                                </DropdownMenuItem>
                                {interview.status === "scheduled" && (
                                  <>
                                    <DropdownMenuSeparator />
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
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleEditInterview(interview)}
                                  disabled={interview.status === "completed"}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Interview
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Date</p>
                              <p className="font-medium">{new Date(interview.scheduled_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Time</p>
                              <p className="font-medium">{interview.scheduled_time}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Interviewer</p>
                              <p className="font-medium">{interview.interviewer}</p>
                            </div>
                            {interview.rating && (
                              <div>
                                <p className="text-gray-600">Rating</p>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-3 h-3 rounded-full ${
                                        i < interview.rating! ? "bg-yellow-400" : "bg-gray-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          {interview.notes && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-gray-600 mb-1">Notes:</p>
                              <p className="text-sm">{interview.notes}</p>
                            </div>
                          )}
                          {interview.feedback && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-gray-600 mb-1">Feedback:</p>
                              <p className="text-sm">{interview.feedback}</p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No interviews scheduled yet</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2" 
                          onClick={() => setShowScheduleInterview(true)}
                          disabled={selectedCandidate.status === "rejected"}
                        >
                          Schedule First Interview
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Notes</h3>
                  <Textarea
                    value={selectedCandidate.notes}
                    onChange={(e) => {
                      setCandidates(prev => prev.map(candidate => 
                        candidate.id === selectedCandidate.id 
                          ? { ...candidate, notes: e.target.value }
                          : candidate
                      ))
                    }}
                    placeholder="Add notes about the candidate..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={handleOpenEmailDialog}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Candidate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getDocumentUrl(selectedCandidate.resume), "_blank")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                  <Button variant="outline" size="sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Extend Offer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Candidate Selected</h3>
                <p className="text-gray-600">Select a candidate from the list to view their profile</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Candidate Dialog */}
      <Dialog open={showAddCandidate} onOpenChange={setShowAddCandidate}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
            <DialogDescription>
              Add a new candidate to the recruitment pipeline
            </DialogDescription>
          </DialogHeader>
          <CandidateForm
            onSave={handleSaveCandidate}
            onCancel={handleCancelForm}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Candidate Dialog */}
      <Dialog open={showEditCandidate} onOpenChange={setShowEditCandidate}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
            <DialogDescription>
              Update candidate information
            </DialogDescription>
          </DialogHeader>
          <CandidateForm
            candidate={selectedCandidate}
            onSave={handleSaveCandidate}
            onCancel={handleCancelForm}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <InterviewForm
        open={showScheduleInterview}
        onOpenChange={setShowScheduleInterview}
        candidate={selectedCandidate ? {
          id: selectedCandidate.id,
          name: getCandidateDisplayName(selectedCandidate),
          email: selectedCandidate.email,
          position: selectedCandidate.position
        } : undefined}
        onSuccess={async () => {
          setShowScheduleInterview(false)
          // Refresh all data
          await fetchCandidates()
          await fetchStats()
          await fetchInterviews()
          
          // Update the selected candidate with fresh data
          if (selectedCandidate) {
            try {
              const updatedCandidate = await apiRequest<any>(getApiUrl(`candidates/${selectedCandidate.id}`))
              setSelectedCandidate(updatedCandidate)
              saveSelectedCandidate(updatedCandidate)
            } catch (error) {
              console.error('Error refreshing selected candidate:', error)
            }
          }
        }}
      />

      {/* Edit Interview Dialog */}
      <InterviewForm
        open={showEditInterview}
        onOpenChange={(open) => {
          setShowEditInterview(open)
          if (!open) setSelectedInterview(null)
        }}
        candidate={selectedCandidate ? {
          id: selectedCandidate.id,
          name: getCandidateDisplayName(selectedCandidate),
          email: selectedCandidate.email,
          position: selectedCandidate.position
        } : undefined}
        editInterview={selectedInterview ? {
          id: selectedInterview.id,
          interview_type: selectedInterview.interview_type,
          scheduled_date: selectedInterview.scheduled_date,
          scheduled_time: selectedInterview.scheduled_time,
          interviewer: selectedInterview.interviewer,
          notes: selectedInterview.notes
        } : undefined}
        onSuccess={async () => {
          setShowEditInterview(false)
          setSelectedInterview(null)
          // Refresh all data
          await fetchCandidates()
          await fetchStats()
          await fetchInterviews()
          
          // Update the selected candidate with fresh data
          if (selectedCandidate) {
            try {
              const updatedCandidate = await apiRequest<any>(getApiUrl(`candidates/${selectedCandidate.id}`))
              setSelectedCandidate(updatedCandidate)
              saveSelectedCandidate(updatedCandidate)
            } catch (error) {
              console.error('Error refreshing selected candidate:', error)
            }
          }
        }}
      />

      {/* Interview Details Dialog */}
      <Dialog open={showInterviewDetails} onOpenChange={setShowInterviewDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Interview Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the interview
            </DialogDescription>
          </DialogHeader>
          {selectedInterview && selectedCandidate && (
            <div className="space-y-6 py-4">
              {/* Interview Status and Type */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getInterviewStatusColor(selectedInterview.status)}>
                    {selectedInterview.status.charAt(0).toUpperCase() + selectedInterview.status.slice(1)}
                  </Badge>
                  <span className="font-medium text-lg">
                    {selectedInterview.interview_type.charAt(0).toUpperCase() + selectedInterview.interview_type.slice(1)} Interview
                  </span>
                </div>
                <Select 
                  value={selectedInterview.status} 
                  onValueChange={(value) => {
                    if (value === "completed") {
                      handleOpenCompleteDialog(selectedInterview)
                    } else if (value === "cancelled") {
                      handleOpenCancelDialog(selectedInterview)
                    } else if (value === "no_show") {
                      handleOpenNoShowDialog(selectedInterview)
                    } else {
                      handleChangeInterviewStatus(selectedInterview, value)
                    }
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Candidate Information */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Candidate Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{getCandidateDisplayName(selectedCandidate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Position:</span>
                    <p className="font-medium">{selectedCandidate.position}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedCandidate.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{selectedCandidate.phone}</p>
                  </div>
                </div>
              </div>

              {/* Interview Schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Date</span>
                  </div>
                  <p className="font-medium">{new Date(selectedInterview.scheduled_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Time</span>
                  </div>
                  <p className="font-medium">{selectedInterview.scheduled_time}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <UserPlus className="w-4 h-4" />
                    <span>Interviewer</span>
                  </div>
                  <p className="font-medium">{selectedInterview.interviewer}</p>
                </div>
                {selectedInterview.rating && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <span>Rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full ${
                            i < selectedInterview.rating! ? "bg-yellow-400" : "bg-gray-200"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({selectedInterview.rating}/5)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedInterview.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedInterview.notes}</p>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {selectedInterview.feedback && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedInterview.feedback}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t">
                {selectedInterview.status === "scheduled" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowInterviewDetails(false)
                        handleOpenCompleteDialog(selectedInterview)
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowInterviewDetails(false)
                        handleOpenCancelDialog(selectedInterview)
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowInterviewDetails(false)
                        handleOpenNoShowDialog(selectedInterview)
                      }}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Mark No Show
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInterviewDetails(false)
                    handleEditInterview(selectedInterview)
                  }}
                  disabled={selectedInterview.status === "completed"}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Interview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInterviewDetails(false)
                    handleSendReminder(selectedInterview)
                  }}
                  disabled={isSendingReminder || selectedInterview.status !== "scheduled"}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {isSendingReminder ? "Sending..." : "Send Reminder"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Send Email to Candidate</DialogTitle>
            <DialogDescription>
              Send an email to {selectedCandidate ? getCandidateDisplayName(selectedCandidate) : 'candidate'} ({selectedCandidate?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email-subject">Subject *</Label>
              <Input
                id="email-subject"
                value={emailFormData.subject}
                onChange={(e) => setEmailFormData({ ...emailFormData, subject: e.target.value })}
                placeholder="Email subject"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email-message">Message *</Label>
              <Textarea
                id="email-message"
                value={emailFormData.message}
                onChange={(e) => setEmailFormData({ ...emailFormData, message: e.target.value })}
                placeholder="Enter your message to the candidate..."
                rows={8}
                required
                className="min-h-[200px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email-sender-name">Sender Name (Optional)</Label>
              <Input
                id="email-sender-name"
                value={emailFormData.sender_name}
                onChange={(e) => setEmailFormData({ ...emailFormData, sender_name: e.target.value })}
                placeholder="e.g., John Doe, HR Team"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEmailDialog(false)
                setEmailFormData({ subject: "", message: "", sender_name: "" })
              }}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendEmail}
              disabled={isSendingEmail || !emailFormData.subject.trim() || !emailFormData.message.trim()}
            >
              {isSendingEmail ? (
                <>
                  <Clock4 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <DocumentPreview
        open={previewState.open}
        onOpenChange={handleClosePreview}
        documentUrl={previewState.documentUrl}
        documentName={previewState.documentName}
        documentType={previewState.documentType}
      />

      {/* Complete Interview Dialog */}
      <Dialog open={showCompleteInterviewDialog} onOpenChange={setShowCompleteInterviewDialog}>
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
                <p className="font-medium">{selectedInterview.interview_type.charAt(0).toUpperCase() + selectedInterview.interview_type.slice(1)} Interview</p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedInterview.scheduled_date).toLocaleDateString()} at {selectedInterview.scheduled_time}
                </p>
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
                    setShowCompleteInterviewDialog(false)
                    setCompleteInterviewData({ feedback: "", rating: "" })
                  }}
                  disabled={isChangingStatus}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!completeInterviewData.rating) {
                      alert("Please select a rating")
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
      <Dialog open={showCancelInterviewDialog} onOpenChange={setShowCancelInterviewDialog}>
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
                <p className="font-medium">{selectedInterview.interview_type.charAt(0).toUpperCase() + selectedInterview.interview_type.slice(1)} Interview</p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedInterview.scheduled_date).toLocaleDateString()} at {selectedInterview.scheduled_time}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cancel-notes">Notes (Optional)</Label>
                <Textarea
                  id="cancel-notes"
                  placeholder="Enter reason for cancellation..."
                  value={cancelInterviewNotes}
                  onChange={(e) => setCancelInterviewNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelInterviewDialog(false)
                    setCancelInterviewNotes("")
                  }}
                  disabled={isChangingStatus}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleChangeInterviewStatus(selectedInterview, "cancelled", {
                      notes: cancelInterviewNotes
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
                <p className="font-medium">{selectedInterview.interview_type.charAt(0).toUpperCase() + selectedInterview.interview_type.slice(1)} Interview</p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedInterview.scheduled_date).toLocaleDateString()} at {selectedInterview.scheduled_time}
                </p>
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