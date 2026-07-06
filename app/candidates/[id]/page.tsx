"use client"

import React, { useState, useEffect } from "react"
import { getApiUrl, apiRequest, getDocumentUrl } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  User,
  GraduationCap,
  Building,
  DollarSign,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  CalendarDays,
} from "lucide-react"
import { DocumentPreview } from "@/components/ui/document-preview"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CandidateForm } from "@/components/forms/candidate-form"
import { toast } from "@/hooks/use-toast"

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
  status: string
  applied_date: string
  last_contact: string
  resume?: string
  cover_letter?: string
  notes?: string
  skills: string[]
  education?: string
  current_company?: string
  expected_salary?: string
  availability?: string
  interview_count?: number
  days_since_applied?: number
  days_since_last_contact?: number
  interviews?: Interview[]
  next_interview?: Interview
}

interface Interview {
  id: string
  candidate_id: string
  scheduled_date: string
  scheduled_time: string
  interview_type: string
  interviewer: string
  status: string
  notes?: string
  feedback?: string
}

export default function CandidateProfilePage() {
  const params = useParams()
  const router = useRouter()
  const candidateId = params.id as string

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditCandidate, setShowEditCandidate] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const data = await apiRequest<Candidate>(getApiUrl(`candidates/${candidateId}`))
        setCandidate(data)
      } catch (error) {
        console.error('Error fetching candidate data:', error)
        setCandidate(null)
      } finally {
        setLoading(false)
      }
    }

    if (candidateId) {
      fetchCandidateData()
    }
  }, [candidateId])

  const handleEditCandidate = () => {
    setShowEditCandidate(true)
  }

  const handleSaveCandidate = async (candidateData: any) => {
    setIsSaving(true)
    try {
      const url = getApiUrl(`candidates/${candidateId}`)
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ candidate: candidateData }),
      })

      if (response.ok) {
        const savedCandidate = await response.json()
        setCandidate(savedCandidate)
        
        toast({
          title: "Candidate Updated",
          description: "Candidate information has been updated successfully.",
        })
        
        setShowEditCandidate(false)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.errors?.join(", ") || "Failed to update candidate",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving candidate:', error)
      toast({
        title: "Error",
        description: "Failed to update candidate. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelForm = () => {
    setShowEditCandidate(false)
  }

  const getInitials = (name?: string) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getDisplayName = (candidate: Candidate) => {
    return candidate.name || `${candidate.first_name} ${candidate.last_name}`.trim() || "Unknown"
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString?: string, timeString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    if (timeString) {
      const [hours, minutes] = timeString.split(":")
      date.setHours(parseInt(hours), parseInt(minutes))
    }
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    const statusLower = (status || "").toLowerCase()
    switch (statusLower) {
      case "applied":
        return "bg-blue-100 text-blue-800"
      case "screening":
        return "bg-yellow-100 text-yellow-800"
      case "interview":
        return "bg-purple-100 text-purple-800"
      case "technical":
        return "bg-indigo-100 text-indigo-800"
      case "final":
        return "bg-pink-100 text-pink-800"
      case "offered":
        return "bg-green-100 text-green-800"
      case "hired":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInterviewStatusColor = (status: string) => {
    const statusLower = (status || "").toLowerCase()
    switch (statusLower) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate profile...</p>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-6 overflow-x-hidden">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Candidate not found</p>
          <Button onClick={() => router.push("/recruitment")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recruitment
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/recruitment")}
          className="gap-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-2xl sm:text-3xl font-bold text-gray-900">Candidate Profile</h1>
            <p className="text-gray-600">View candidate details and application information</p>
          </div>
          <div className="hrms-action-row">
            <Badge className={getStatusColor(candidate.status)}>{candidate.status}</Badge>
            <Button variant="outline" size="sm" onClick={handleEditCandidate}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={undefined} alt={getDisplayName(candidate)} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-semibold">
                {getInitials(getDisplayName(candidate))}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{getDisplayName(candidate)}</h2>
                <p className="text-gray-600">{candidate.position}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{candidate.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{candidate.location || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="w-4 h-4" />
                  <span>{candidate.current_company || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="hrms-tabs-scroll">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interviews">Interviews ({candidate.interviews?.length || 0})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Application Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Position Applied</label>
                  <p className="text-gray-900 mt-1">{candidate.position}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900 mt-1">{candidate.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Experience</label>
                  <p className="text-gray-900 mt-1">{candidate.experience || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Applied Date</label>
                  <p className="text-gray-900 mt-1">{formatDate(candidate.applied_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Contact</label>
                  <p className="text-gray-900 mt-1">{formatDate(candidate.last_contact)}</p>
                </div>
                {candidate.days_since_applied !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Days Since Applied</label>
                    <p className="text-gray-900 mt-1">{candidate.days_since_applied} days</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills & Qualifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Skills & Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills && Array.isArray(candidate.skills) && candidate.skills.length > 0 ? (
                      candidate.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No skills listed</span>
                    )}
                  </div>
                </div>
                {candidate.education && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Education</label>
                    <p className="text-gray-900 mt-1 whitespace-pre-line">{candidate.education}</p>
                  </div>
                )}
                {candidate.expected_salary && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Expected Salary</label>
                    <p className="text-gray-900 mt-1">{candidate.expected_salary}</p>
                  </div>
                )}
                {candidate.availability && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Availability</label>
                    <p className="text-gray-900 mt-1">{candidate.availability}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {candidate.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{candidate.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Interview History
              </CardTitle>
              <CardDescription>
                {candidate.interview_count || 0} interview(s) scheduled
                {candidate.next_interview && (
                  <span className="ml-2 text-green-600">
                    • Next interview: {formatDateTime(candidate.next_interview.scheduled_date, candidate.next_interview.scheduled_time)}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {candidate.interviews && candidate.interviews.length > 0 ? (
                <>
                <div className="hidden md:block rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Interviewer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Feedback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidate.interviews.map((interview) => (
                        <TableRow key={interview.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="w-4 h-4 text-gray-400" />
                              <span>{formatDateTime(interview.scheduled_date, interview.scheduled_time)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{interview.interview_type || "N/A"}</TableCell>
                          <TableCell>{interview.interviewer || "N/A"}</TableCell>
                          <TableCell>
                            <Badge className={getInterviewStatusColor(interview.status)}>
                              {interview.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {interview.feedback ? (
                              <span className="text-sm text-gray-600">{interview.feedback}</span>
                            ) : (
                              <span className="text-sm text-gray-400">No feedback</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-3">
                  {candidate.interviews.map((interview) => (
                    <div key={interview.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{formatDateTime(interview.scheduled_date, interview.scheduled_time)}</p>
                        <Badge className={getInterviewStatusColor(interview.status)}>{interview.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Type</span>
                          <p className="font-medium">{interview.interview_type || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Interviewer</span>
                          <p className="font-medium">{interview.interviewer || "N/A"}</p>
                        </div>
                      </div>
                      {interview.feedback && (
                        <p className="text-sm text-gray-600 line-clamp-2">{interview.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No interviews scheduled yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.resume ? (
                  <div className="space-y-4">
                    <DocumentPreview
                      documentUrl={getDocumentUrl(candidate.resume)}
                      documentName="Resume"
                      documentType="pdf"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getDocumentUrl(candidate.resume!), "_blank")}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getDocumentUrl(candidate.resume!, true), "_blank")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No resume uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cover Letter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Cover Letter
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.cover_letter ? (
                  <div className="space-y-4">
                    <DocumentPreview
                      documentUrl={getDocumentUrl(candidate.cover_letter)}
                      documentName="Cover Letter"
                      documentType="pdf"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getDocumentUrl(candidate.cover_letter!), "_blank")}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getDocumentUrl(candidate.cover_letter!, true), "_blank")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No cover letter uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
            candidate={candidate}
            onSave={handleSaveCandidate}
            onCancel={handleCancelForm}
            isLoading={isSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

