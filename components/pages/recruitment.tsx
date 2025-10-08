"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter, MoreHorizontal, MapPin, Clock, Users, Calendar, Star, FileText } from "lucide-react"
import { JobOpeningForm } from "@/components/forms/job-opening-form"

const jobOpenings = [
  {
    id: 1,
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Bangalore, India",
    type: "Full-time",
    status: "active",
    applicants: 24,
    vacancies: 2,
    postedDate: "2024-01-15",
    description: "We're looking for a senior software engineer to join our growing team...",
    requirements: "5+ years experience in React, Node.js, and cloud technologies",
    salaryRange: "₹15-25 LPA",
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    location: "Mumbai, India",
    type: "Full-time",
    status: "Active",
    applicants: 18,
    vacancies: 1,
    postedDate: "2024-01-10",
    description: "Lead our product initiatives and drive innovation...",
    requirements: "3+ years in product management, MBA preferred",
    salaryRange: "₹20-30 LPA",
  },
  {
    id: 3,
    title: "UI/UX Designer",
    department: "Design",
    location: "Remote",
    type: "Contract",
    status: "Draft",
    applicants: 0,
    vacancies: 1,
    postedDate: "2024-01-20",
    description: "Create intuitive and engaging user experiences...",
    requirements: "Portfolio showcasing web and mobile designs",
    salaryRange: "₹8-15 LPA",
  },
]

const applicants = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 98765 43210",
    position: "Senior Software Engineer",
    stage: "Interview",
    rating: 4,
    source: "LinkedIn",
    appliedDate: "2024-01-20",
    experience: "6 years",
    skills: ["React", "Node.js", "AWS"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Rahul Kumar",
    email: "rahul.kumar@email.com",
    phone: "+91 87654 32109",
    position: "Senior Software Engineer",
    stage: "Screening",
    rating: 3,
    source: "Company Website",
    appliedDate: "2024-01-18",
    experience: "5 years",
    skills: ["Python", "Django", "PostgreSQL"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Anjali Patel",
    email: "anjali.patel@email.com",
    phone: "+91 76543 21098",
    position: "Product Manager",
    stage: "Offer",
    rating: 5,
    source: "Referral",
    appliedDate: "2024-01-15",
    experience: "4 years",
    skills: ["Product Strategy", "Analytics", "Agile"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const interviewSchedule = [
  {
    id: 1,
    candidate: "Priya Sharma",
    position: "Senior Software Engineer",
    interviewer: "Tech Team",
    date: "2024-01-25",
    time: "10:00 AM",
    type: "Technical Round",
    status: "Scheduled",
  },
  {
    id: 2,
    candidate: "Vikram Singh",
    position: "Product Manager",
    interviewer: "Product Head",
    date: "2024-01-25",
    time: "2:00 PM",
    type: "Final Round",
    status: "Scheduled",
  },
  {
    id: 3,
    candidate: "Sneha Reddy",
    position: "UI/UX Designer",
    interviewer: "Design Team",
    date: "2024-01-26",
    time: "11:00 AM",
    type: "Portfolio Review",
    status: "Confirmed",
  },
]

export function RecruitmentPage() {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("jobs")

  const filteredJobs = jobOpenings.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredApplicants = applicants.filter(
    (applicant) =>
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-gray-600 mt-1">Manage job openings and track candidates</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Job Opening
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="jobs">Job Openings</TabsTrigger>
          <TabsTrigger value="applicants">Applicants</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          {/* Search and Filter */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search job openings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200"
                  />
                </div>
                <Button variant="outline" className="border-gray-200 text-gray-600 bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Job Openings */}
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        <Badge
                          className={
                            job.status === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{job.description}</p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {job.applicants} applicants
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {job.vacancies} positions
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {job.department}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {job.salaryRange}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Posted {job.postedDate}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
                      >
                        View Applications
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applicants" className="space-y-6">
          {/* Search */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search applicants by name, skills, position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200"
                  />
                </div>
                <Button variant="outline" className="border-gray-200 text-gray-600 bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Stage
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Applicants */}
          <div className="grid gap-4">
            {filteredApplicants.map((applicant) => (
              <Card key={applicant.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={applicant.avatar || "/placeholder.svg"}
                        alt={applicant.name}
                        className="w-12 h-12 rounded-full bg-gray-200"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{applicant.name}</h3>
                        <p className="text-gray-600">{applicant.position}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{applicant.experience} experience</span>
                          <span>Applied {applicant.appliedDate}</span>
                          <span>Source: {applicant.source}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {applicant.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="text-right">
                        <Badge
                          className={
                            applicant.stage === "Offer"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : applicant.stage === "Interview"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {applicant.stage}
                        </Badge>
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < applicant.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Review
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Interview Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interviewSchedule.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{interview.candidate}</h3>
                      <p className="text-sm text-gray-600">{interview.position}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {interview.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {interview.time}
                        </span>
                        <span>{interview.type}</span>
                        <span>Interviewer: {interview.interviewer}</span>
                      </div>
                    </div>
                    <Badge
                      className={
                        interview.status === "Confirmed"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                      }
                    >
                      {interview.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Hiring Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Applications</span>
                    <span className="font-semibold text-gray-900">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Screening</span>
                    <span className="font-semibold text-gray-900">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Interviews</span>
                    <span className="font-semibold text-gray-900">34</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Offers</span>
                    <span className="font-semibold text-gray-900">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Hired</span>
                    <span className="font-semibold text-green-600">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Source Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">LinkedIn</span>
                    <span className="font-semibold text-gray-900">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Company Website</span>
                    <span className="font-semibold text-gray-900">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Referrals</span>
                    <span className="font-semibold text-gray-900">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Job Portals</span>
                    <span className="font-semibold text-gray-900">9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {showForm && <JobOpeningForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
