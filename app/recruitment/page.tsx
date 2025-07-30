"use client"

import { useEffect, useState } from "react"
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
  const [showForm, setShowForm] = useState(false)
  const [editJob, setEditJob] = useState(null)
  const [showInterviewForm, setShowInterviewForm] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchDepartments()
    fetchJobOpenings()
  }, [])

  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:3000/departments")
      const data = await res.json()
      setDepartments(data)
    } catch (err) {
      // handle error
    }
  }

  const fetchJobOpenings = async () => {
    try {
      const res = await fetch("http://localhost:3000/job_openings")
      const data = await res.json()
      setJobOpenings(data)
    } catch (err) {
      // handle error
    }
  }

  const getDepartmentName = (idOrName) => {
    const dept = departments.find(d => String(d.id) === String(idOrName))
    return dept ? dept.name : idOrName
  }

  const handleAddJob = async (formData) => {
    try {
      const res = await fetch("http://localhost:3000/job_openings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ job_opening: formData })
      })
      if (res.ok) {
        fetchJobOpenings()
        setShowForm(false)
        setEditJob(null)
      } else {
        // handle error
      }
    } catch (err) {
      // handle error
    }
  }

  const handleEditJob = (job) => {
    setEditJob(job)
    setShowForm(true)
  }

  const handleUpdateJob = async (formData) => {
    try {
      const res = await fetch(`http://localhost:3000/job_openings/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ job_opening: formData })
      })
      if (res.ok) {
        fetchJobOpenings()
        setShowForm(false)
        setEditJob(null)
      } else {
        // handle error
      }
    } catch (err) {
      // handle error
    }
  }

  const handleDeactivateJob = async (job) => {
    try {
      const res = await fetch(`http://localhost:3000/job_openings/${job.id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json" }
      })
      if (res.ok) {
        fetchJobOpenings()
      } else {
        // handle error
      }
    } catch (err) {
      // handle error
    }
  }

  const handleScheduleInterview = (candidate = null) => {
    setSelectedCandidate(candidate)
    setShowInterviewForm(true)
  }

  const handleInterviewSuccess = () => {
    setShowInterviewForm(false)
    setSelectedCandidate(null)
    // Optionally refresh candidate data here
  }

  const candidates = [
    {
      id: "CAN001",
      name: "Arjun Mehta",
      email: "arjun.mehta@email.com",
      phone: "+91 98765 43210",
      position: "Senior Software Engineer",
      experience: "5 years",
      location: "Mumbai",
      status: "Interview Scheduled",
      appliedDate: "2024-11-01",
      stage: "Technical Round",
    },
    {
      id: "CAN002",
      name: "Kavya Nair",
      email: "kavya.nair@email.com",
      phone: "+91 87654 32109",
      position: "Product Manager",
      experience: "7 years",
      location: "Bangalore",
      status: "Under Review",
      appliedDate: "2024-11-02",
      stage: "Resume Review",
    },
    {
      id: "CAN003",
      name: "Rohit Gupta",
      email: "rohit.gupta@email.com",
      phone: "+91 76543 21098",
      position: "UI/UX Designer",
      experience: "3 years",
      location: "Delhi",
      status: "Shortlisted",
      appliedDate: "2024-11-03",
      stage: "Portfolio Review",
    },
    {
      id: "CAN004",
      name: "Neha Joshi",
      email: "neha.joshi@email.com",
      phone: "+91 65432 10987",
      position: "Data Analyst",
      experience: "2 years",
      location: "Pune",
      status: "Rejected",
      appliedDate: "2024-10-30",
      stage: "Initial Screening",
    },
  ]

  const recruitmentStats = [
    {
      title: "Active Job Openings",
      value: "12",
      change: "+3 this month",
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Applications",
      value: "234",
      change: "+45 this week",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Interviews Scheduled",
      value: "18",
      change: "Next 7 days",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Offers Extended",
      value: "5",
      change: "This month",
      icon: CheckCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Draft":
        return "bg-gray-100 text-gray-800"
      case "Interview Scheduled":
        return "bg-blue-100 text-blue-800"
      case "Under Review":
        return "bg-yellow-100 text-yellow-800"
      case "Shortlisted":
        return "bg-purple-100 text-purple-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
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
                          <span className="text-sm text-gray-600">{getDepartmentName(job.department)}</span>
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
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeactivateJob(job)}>Close Job</DropdownMenuItem>
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
                  <Input placeholder="Search candidates..." className="pl-10" />
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
                    {candidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{candidate.name}</p>
                            <p className="text-sm text-gray-500">{candidate.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{candidate.position}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{candidate.experience}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{candidate.stage}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(candidate.appliedDate).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(candidate.status)}>{candidate.status}</Badge>
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
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleScheduleInterview(candidate)}>Schedule Interview</DropdownMenuItem>
                              <DropdownMenuItem>Send Message</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Move to Next Stage</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Reject Application</DropdownMenuItem>
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
