"use client"

import { useEffect, useState } from "react"
import { apiRequest, getApiUrl, getEndpointUrl } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Briefcase,
  Search,
  Plus,
  MoreHorizontal,
  Users,
  Clock,
  CheckCircle,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
} from "lucide-react"
import { JobOpeningForm } from "@/components/forms/job-opening-form"
import { InterviewFormUI } from "@/components/forms/interview-form-ui"
import { useRouter } from "next/navigation"

export default function RecruitmentPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [departments, setDepartments] = useState([])
  const [jobOpenings, setJobOpenings] = useState([])
  const [allJobOpenings, setAllJobOpenings] = useState([]) // For stats calculation
  const [candidates, setCandidates] = useState([])
  const [candidateSearchTerm, setCandidateSearchTerm] = useState("")
  const [interviews, setInterviews] = useState([])
  const [stats, setStats] = useState({
    activeJobOpenings: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    offersExtended: 0
  })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editJob, setEditJob] = useState(null)
  const [showInterviewForm, setShowInterviewForm] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchDepartments()
    fetchAllJobOpenings() // Fetch all for stats
    fetchJobOpenings() // Fetch for display (may be filtered)
    fetchCandidates()
    fetchInterviews()
  }, [])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() === "") {
        fetchJobOpenings()
      } else {
        fetchJobOpenings(searchTerm)
      }
    }, 400) 
    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  // Recalculate stats when data changes (use allJobOpenings for accurate stats)
  useEffect(() => {
    calculateStats()
  }, [allJobOpenings, candidates, interviews])

  const fetchDepartments = async () => {
    try {

      const res = await apiRequest(getEndpointUrl('DEPARTMENTS'))
      setDepartments(res as any)
    } catch (err) {
      console.error("Error fetching departments:", err)
    }
  }

  const fetchAllJobOpenings = async () => {
    try {
      const res = await apiRequest<any[]>(getEndpointUrl('JOB_OPENINGS'))
      setAllJobOpenings(res as any) // Keep all job openings for stats
    } catch (err) {
      console.error("Error fetching all jobs:", err)
    }
  }

  const filteredCandidates = candidates.filter((candidate) => {
    const term = candidateSearchTerm.toLowerCase();
    return (
      candidate.name?.toLowerCase().includes(term) ||
      candidate.email?.toLowerCase().includes(term) ||
      candidate.position?.toLowerCase().includes(term)
    );
  });
  
  const fetchJobOpenings = async (query = "") => {
    try {
      const url = query
        ? `${getEndpointUrl("JOB_OPENINGS")}?search=${encodeURIComponent(query)}`
        : getEndpointUrl("JOB_OPENINGS")

      const res = await apiRequest<any[]>(url)
      setJobOpenings(res as any) // Filtered results for display
      // Also update allJobOpenings if no search query (for stats)
      if (!query) {
        setAllJobOpenings(res as any)
      }
    } catch (err) {
      console.error("Error fetching jobs:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCandidates = async () => {
    try {
      const res = await apiRequest<any[]>(getEndpointUrl('CANDIDATES'))
      setCandidates(res as any)
    } catch (err) {
      console.error('Error fetching candidates:', err)
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

  const calculateStats = () => {
    // Active job openings (status = "open") - use allJobOpenings for accurate stats
    const activeJobOpenings = allJobOpenings.filter((job: any) => {
      const status = (job.status || "").toLowerCase()
      return status === "open"
    }).length

    // Total applications (total candidates)
    const totalApplications = candidates.length

    // Interviews scheduled (scheduled or upcoming interviews)
    const now = new Date()
    const interviewsScheduled = interviews.filter((interview: any) => {
      if (!interview.scheduled_date) return false
      const interviewDate = new Date(interview.scheduled_date)
      return interview.status === "scheduled" || 
             (interview.status === "pending" && interviewDate >= now)
    }).length

    // Offers extended (candidates with status "offered" or "hired")
    const offersExtended = candidates.filter((candidate: any) => 
      candidate.status === "offered" || candidate.status === "hired"
    ).length

    setStats({
      activeJobOpenings,
      totalApplications,
      interviewsScheduled,
      offersExtended
    })
  }

  const getDepartmentName = (idOrNameOrObject: any) => {
    // Handle department object from serializer
    if (idOrNameOrObject && typeof idOrNameOrObject === 'object' && idOrNameOrObject.name) {
      return idOrNameOrObject.name
    }
    // Handle department_id number or string
    if (typeof idOrNameOrObject === 'number' || (typeof idOrNameOrObject === 'string' && !isNaN(Number(idOrNameOrObject)))) {
      const dept = (departments as any[]).find((d: any) => String(d.id) === String(idOrNameOrObject))
      return dept ? dept.name : 'Unknown'
    }
    // Handle department name string directly
    if (typeof idOrNameOrObject === 'string') {
      return idOrNameOrObject
    }
    // Fallback
    return 'Unknown'
  }

  const handleAddJob = async (formData) => {
    try {
      await apiRequest<any>(getEndpointUrl('JOB_OPENINGS'), {
        method: "POST",
        body: JSON.stringify({ job_opening: formData })
      })
      fetchJobOpenings()
      fetchAllJobOpenings() // Refresh stats
      setShowForm(false)
      setEditJob(null)
    } catch (err) {
      console.error('Error adding job:', err)
    }
  }

  const handleEditJob = (job) => {
    setEditJob(job)
    setShowForm(true)
  }

  const handleUpdateJob = async (formData) => {
    try {
      await apiRequest<any>(getApiUrl(`job_openings/${formData.id}`), {
        method: "PATCH",
        body: JSON.stringify({ job_opening: formData })
      })
      fetchJobOpenings()
      fetchAllJobOpenings() // Refresh stats
      setShowForm(false)
      setEditJob(null)
    } catch (err) {
      console.error('Error updating job:', err)
    }
  }

  const handleDeactivateJob = async (job) => {
    try {
      await apiRequest<any>(getApiUrl(`job_openings/${job.id}`), {
        method: "DELETE",
      });
      fetchJobOpenings(); // refresh display
      fetchAllJobOpenings(); // refresh stats
    } catch (err) {
      console.error("Error closing job:", err);
    }
  };


 const handleActivateJob = async (job) => {
  try {
    await apiRequest<any>(getApiUrl(`job_openings/${job.id}`), {
      method: "PATCH",
      body: JSON.stringify({
        job_opening: { status: "open" },
      }),
    });
    fetchJobOpenings(); // refresh display
    fetchAllJobOpenings(); // refresh stats
  } catch (err) {
    console.error("Error opening job:", err);
  }
};

  const handleScheduleInterview = (candidate = null) => {
    setSelectedCandidate(candidate)
    setShowInterviewForm(true)
  }

  const handleInterviewSuccess = () => {
    setShowInterviewForm(false)
    setSelectedCandidate(null)
    // Refresh data after interview is scheduled
    fetchInterviews()
    fetchCandidates()
  }

  const handleRejectApplication = async (candidate: any) => {
    try {
      await apiRequest<any>(getApiUrl(`candidates/${candidate.id}/update_status`), {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected' }),
      })
      // Refresh candidates list to show updated status
      fetchCandidates()
    } catch (err) {
      console.error('Error rejecting application:', err)
    }
  }

  // Calculate change indicators
  const getChangeText = (statType: string) => {
    // For now, return placeholder text. Can be enhanced with historical data comparison
    switch (statType) {
      case "activeJobOpenings":
        // const drafts = allJobOpenings.filter((j: any) => {
        //   const status = (j.status || "").toLowerCase()
        //   return status === "draft"
        // }).length
        // return drafts > 0 ? `${drafts} drafts` : "All active"
        "All active"
      case "totalApplications":
        const thisWeek = candidates.filter(c => {
          if (!c.applied_date) return false
          const appliedDate = new Date(c.applied_date)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return appliedDate >= weekAgo
        }).length
        return thisWeek > 0 ? `+${thisWeek} this week` : "No new applications"
      case "interviewsScheduled":
        const nextWeek = interviews.filter(i => {
          if (!i.scheduled_date) return false
          const interviewDate = new Date(i.scheduled_date)
          const weekFromNow = new Date()
          weekFromNow.setDate(weekFromNow.getDate() + 7)
          return interviewDate <= weekFromNow && interviewDate >= new Date()
        }).length
        return nextWeek > 0 ? `${nextWeek} next 7 days` : "No upcoming interviews"
      case "offersExtended":
        const thisMonth = candidates.filter(c => {
          if (!c.applied_date) return false
          const appliedDate = new Date(c.applied_date)
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return (c.status === "offered" || c.status === "hired") && appliedDate >= monthAgo
        }).length
        return thisMonth > 0 ? `${thisMonth} this month` : "No offers this month"
      default:
        return ""
    }
  }

  const recruitmentStats = [
    {
      title: "Active Job Openings",
      value: stats.activeJobOpenings.toString(),
      change: getChangeText("activeJobOpenings"),
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Applications",
      value: stats.totalApplications.toString(),
      change: getChangeText("totalApplications"),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Interviews Scheduled",
      value: stats.interviewsScheduled.toString(),
      change: getChangeText("interviewsScheduled"),
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Offers Extended",
      value: stats.offersExtended.toString(),
      change: getChangeText("offersExtended"),
      icon: CheckCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const getStatusColor = (status: string) => {
    const statusLower = (status || "").toLowerCase()
    switch (statusLower) {
      case "open":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "closed":
        return "bg-red-100 text-red-800"
      case "filled":
        return "bg-blue-100 text-blue-800"
      case "interview scheduled":
        return "bg-blue-100 text-blue-800"
      case "under review":
        return "bg-yellow-100 text-yellow-800"
      case "shortlisted":
        return "bg-purple-100 text-purple-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "offered":
        return "bg-green-100 text-green-800"
      case "hired":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-gray-600">Manage job openings and candidate applications</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/ats')} className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <TrendingUp className="w-4 h-4 mr-2" />
              ATS
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleScheduleInterview()}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Interview
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post Job
            </Button>
          </div>
          <p className="text-xs text-gray-500">Track candidates through the recruitment pipeline</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recruitmentStats.map((stat, index) => (
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

      {/* Tabs for Job Openings and Candidates */}
      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-96">
          <TabsTrigger value="jobs">Job Openings</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Openings
              </CardTitle>
              <CardDescription>Manage active and draft job postings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search job openings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobOpenings.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium text-blue-600 cursor-pointer underline" onClick={() => router.push(`/recruitment/${job.id}`)}>
                          {job.title}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {(job as any).department_name || 
                             ((job as any).department?.name) || 
                             getDepartmentName((job as any).department_id || (job as any).department)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>{job.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-3 h-3" />
                            <span>{job.salary}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{job.applications}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditJob(job)}>Edit Job</DropdownMenuItem>
                              <DropdownMenuItem>View Applications</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className={job.status === "closed" ? "text-green-600" : "text-red-600"}
                                onClick={() =>
                                  job.status === "closed"
                                    ? handleActivateJob(job)
                                    : handleDeactivateJob(job)
                                }
                              >
                                {job.status === "closed" ? "Open Job" : "Close Job"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Candidates
              </CardTitle>
              <CardDescription>Track candidate applications and interview progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search candidates..."
                    value={candidateSearchTerm}
                    onChange={(e) => setCandidateSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No candidates found
                        </TableCell>
                      </TableRow>
                    ) : (
                        filteredCandidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{candidate.name}</p>
                              <p className="text-sm text-gray-500">{candidate.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{candidate.position || "N/A"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{candidate.experience || "N/A"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{candidate.status || "N/A"}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-3 h-3" />
                              <span>
                                {candidate.applied_date 
                                  ? new Date(candidate.applied_date).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(candidate.status || "")}>
                              {candidate.status || "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => router.push(`/candidates/${candidate.id}`)}>View Profile</DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleScheduleInterview(candidate)}
                                  disabled={candidate.status === "rejected"}
                                >
                                  Schedule Interview
                                </DropdownMenuItem>
                                <DropdownMenuItem>Send Message</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Move to Next Stage</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleRejectApplication(candidate)}>Reject Application</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showForm && (
        <JobOpeningForm
          onClose={() => { setShowForm(false); setEditJob(null); }}
          onSubmit={editJob ? handleUpdateJob : handleAddJob}
          initialData={editJob}
        />
      )}

      <InterviewFormUI
        open={showInterviewForm}
        onOpenChange={setShowInterviewForm}
        candidate={selectedCandidate ? {
          id: selectedCandidate.id,
          name: selectedCandidate.name,
          email: selectedCandidate.email,
          position: selectedCandidate.position
        } : undefined}
        onSuccess={handleInterviewSuccess}
      />
    </div>
  )
}
