"use client"

import { useState, useEffect } from "react"
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

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  experience: string
  location: string
  status: "applied" | "screening" | "interview" | "technical" | "final" | "offered" | "hired" | "rejected"
  appliedDate: string
  lastContact: string
  resume: string
  coverLetter?: string
  notes: string
  interviews: Interview[]
  skills: string[]
  education: string
  currentCompany?: string
  expectedSalary?: string
  availability?: string
}

interface Interview {
  id: string
  type: "phone" | "video" | "onsite"
  scheduledDate: string
  scheduledTime: string
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
  const [showScheduleInterview, setShowScheduleInterview] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDepartment, setFilterDepartment] = useState<string>("all")

  useEffect(() => {
    fetchCandidates()
    fetchStats()
  }, [])

  const fetchCandidates = async () => {
    try {
      const response = await fetch('http://localhost:3000/candidates')
      const data = await response.json()
      setCandidates(data)
    } catch (error) {
      console.error('Error fetching candidates:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/candidates/stats')
      const data = await response.json()
      // Update stats if needed
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const atsStats = [
    {
      title: "Total Applications",
      value: "234",
      change: "+45 this week",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "In Pipeline",
      value: "89",
      change: "Active candidates",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Interviews This Week",
      value: "12",
      change: "Scheduled",
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

  const pipelineStages = [
    { stage: "applied", label: "Applied", count: 45, color: "bg-gray-100 text-gray-800" },
    { stage: "screening", label: "Screening", count: 23, color: "bg-blue-100 text-blue-800" },
    { stage: "interview", label: "Interview", count: 15, color: "bg-yellow-100 text-yellow-800" },
    { stage: "technical", label: "Technical", count: 8, color: "bg-purple-100 text-purple-800" },
    { stage: "final", label: "Final", count: 5, color: "bg-indigo-100 text-indigo-800" },
    { stage: "offered", label: "Offered", count: 3, color: "bg-green-100 text-green-800" },
    { stage: "hired", label: "Hired", count: 2, color: "bg-emerald-100 text-emerald-800" },
    { stage: "rejected", label: "Rejected", count: 12, color: "bg-red-100 text-red-800" },
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
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || candidate.status === filterStatus
    const matchesDepartment = filterDepartment === "all" || candidate.department === filterDepartment
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3000/candidates/${candidateId}/update_status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        // Refresh the data
        fetchCandidates()
      }
    } catch (error) {
      console.error('Error updating candidate status:', error)
    }
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
          <CardContent>
            <div className="space-y-3">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedCandidate?.id === candidate.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                    <Badge className={getStatusColor(candidate.status)}>
                      {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{candidate.position}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{candidate.department}</span>
                    <span>{new Date(candidate.appliedDate).toLocaleDateString()}</span>
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Candidate Profile
            </CardTitle>
            <CardDescription>
              {selectedCandidate ? `${selectedCandidate.name} - ${selectedCandidate.position}` : "Select a candidate to view their profile"}
            </CardDescription>
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
                        {selectedCandidate.currentCompany && (
                          <div className="text-sm text-gray-600">
                            Current: {selectedCandidate.currentCompany}
                          </div>
                        )}
                        {selectedCandidate.expectedSalary && (
                          <div className="text-sm text-gray-600">
                            Expected: {selectedCandidate.expectedSalary}
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
                          <span className="font-medium">Applied:</span> {new Date(selectedCandidate.appliedDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Last Contact:</span> {new Date(selectedCandidate.lastContact).toLocaleDateString()}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Availability:</span> {selectedCandidate.availability || "Not specified"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Documents</p>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-blue-600 cursor-pointer underline">{selectedCandidate.resume}</span>
                        </div>
                        {selectedCandidate.coverLetter && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-blue-600 cursor-pointer underline">{selectedCandidate.coverLetter}</span>
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
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Current Status</h3>
                    <Badge className={getStatusColor(selectedCandidate.status)}>
                      {selectedCandidate.status.charAt(0).toUpperCase() + selectedCandidate.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCandidate.status} onValueChange={(value) => handleStatusChange(selectedCandidate.id, value)}>
                      <SelectTrigger className="w-32">
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
                    <Button variant="outline" size="sm" onClick={() => setShowScheduleInterview(true)}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Interview
                    </Button>
                  </div>
                </div>

                {/* Interviews */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Interviews</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowScheduleInterview(true)}>
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
                              <span className="font-medium">{interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview</span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Send Reminder
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Interview
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Date</p>
                              <p className="font-medium">{new Date(interview.scheduledDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Time</p>
                              <p className="font-medium">{interview.scheduledTime}</p>
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
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowScheduleInterview(true)}>
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
                  <Button variant="outline" size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Candidate
                  </Button>
                  <Button variant="outline" size="sm">
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
            <DialogDescription>
              Add a new candidate to the recruitment pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter email address" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="Enter phone number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Position</Label>
                <Input id="position" placeholder="Enter job title" />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="experience">Experience</Label>
              <Input id="experience" placeholder="e.g., 5 years" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Enter location" />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add any notes about the candidate..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddCandidate(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddCandidate(false)}>
              Add Candidate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={showScheduleInterview} onOpenChange={setShowScheduleInterview}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule an interview for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="interviewType">Interview Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Interview</SelectItem>
                  <SelectItem value="video">Video Interview</SelectItem>
                  <SelectItem value="onsite">On-site Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interviewDate">Date</Label>
                <Input id="interviewDate" type="date" />
              </div>
              <div>
                <Label htmlFor="interviewTime">Time</Label>
                <Input id="interviewTime" type="time" />
              </div>
            </div>
            <div>
              <Label htmlFor="interviewer">Interviewer</Label>
              <Input id="interviewer" placeholder="Enter interviewer name" />
            </div>
            <div>
              <Label htmlFor="interviewNotes">Notes</Label>
              <Textarea id="interviewNotes" placeholder="Add any notes for the interview..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowScheduleInterview(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowScheduleInterview(false)}>
              Schedule Interview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 