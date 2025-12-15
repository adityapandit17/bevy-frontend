"use client"
import { useEffect, useState } from "react"
import { getApiUrl, getEndpointUrl, apiRequest } from "@/lib/api"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Briefcase, MapPin, Users, BadgeCheck, DollarSign, Layers, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function JobShowPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id
  const [job, setJob] = useState(null)
  const [status, setStatus] = useState("")
  const [candidates, setCandidates] = useState([])
  const [newCandidate, setNewCandidate] = useState({ first_name: "", last_name: "", email: "", phone: "" })
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [isAddingCandidate, setIsAddingCandidate] = useState(false)

  const STATUS_OPTIONS = [
    { label: "Open", value: "open" },
    { label: "Closed", value: "closed" },
    { label: "Draft", value: "draft" },
    // Backend expects "filled" (not \"inactive\")
    { label: "Filled", value: "filled" }
  ]

  useEffect(() => {
    fetchJob()
  }, [jobId])

  useEffect(() => {
    if (job) {
      fetchCandidates()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job])

  const fetchJob = async () => {
    try {
      const data = await apiRequest(getApiUrl(`job_openings/${jobId}`))
      setJob(data)
      setStatus(data.status)
    } catch (err) {
      console.error("Error fetching job:", err)
    }
  }

  const fetchCandidates = async () => {
    if (!job) return
    
    setIsLoadingCandidates(true)
    try {
      // Fetch candidates that match this job opening by position and department
      const url = `${getEndpointUrl('CANDIDATES')}?search=${encodeURIComponent(job.title)}&department=${encodeURIComponent(job.department_name || '')}`
      const data = await apiRequest(url)
      
      // Filter candidates that match the job position (title) and department
      const matchingCandidates = data.filter(candidate => 
        candidate.position === job.title && candidate.department === job.department_name
      )
      setCandidates(matchingCandidates)
    } catch (err) {
      console.error("Error fetching candidates:", err)
      setCandidates([])
    } finally {
      setIsLoadingCandidates(false)
    }
  }

  const handleStatusChange = async (value) => {
    setStatus(value)
    try {
      await apiRequest(getApiUrl(`job_openings/${jobId}`), {
        method: "PATCH",
        body: JSON.stringify({ job_opening: { status: value } })
      })
      fetchJob()
    } catch (err) {
      console.error("Error updating job status:", err)
    }
  }

  const handleAddCandidate = async (e) => {
    e.preventDefault()
    
    if (!job) return
    
    setIsAddingCandidate(true)
    try {
      const candidateData = {
        first_name: newCandidate.first_name,
        last_name: newCandidate.last_name,
        email: newCandidate.email,
        phone: newCandidate.phone,
        position: job.title, // Link to job opening via position
        department: job.department_name, // Link to job opening via department
        status: "applied",
        applied_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        skills: job.skills || "",
        experience: job.experience || ""
      }

      const savedCandidate = await apiRequest(getEndpointUrl('CANDIDATES'), {
        method: 'POST',
        body: JSON.stringify({ candidate: candidateData }),
      })

      // Refresh candidates list
      await fetchCandidates()
      
      // Clear form
      setNewCandidate({ first_name: "", last_name: "", email: "", phone: "" })
    } catch (err) {
      console.error("Error adding candidate:", err)
    } finally {
      setIsAddingCandidate(false)
    }
  }

  if (!job) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left: Job Details */}
        <div className="flex-1 min-w-0 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2"><Briefcase className="w-6 h-6 text-primary" />{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Layers className="w-4 h-4 text-muted-foreground" /> Job ID: {job.id}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-5 h-5" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>Update Status</DropdownMenuItem>
                    {STATUS_OPTIONS.map(option => (
                      <DropdownMenuItem key={option.value} onClick={() => handleStatusChange(option.value)}>
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <BadgeCheck className="w-5 h-5 text-green-500" title={job.status_label || job.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge>{job.job_type}</Badge>
                <Badge>{job.status_label || job.status}</Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="w-4 h-4" />{job.location}</span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <strong>Vacancies:</strong> {job.vacancies}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground"><Layers className="w-4 h-4" />
                  <strong>Department:</strong> {job.department_name}
                </span>
              </div>
              <div>
                <strong>Description:</strong>
                <div className="text-gray-700 whitespace-pre-line">{job.description}</div>
              </div>
              <div>
                <strong>Requirements:</strong>
                <div className="text-gray-700 whitespace-pre-line">{job.requirements}</div>
              </div>
              <div>
                <strong>Skills:</strong> {job.skills}
              </div>
              <div>
                <strong>Experience:</strong> {job.experience}
              </div>
              <div className="flex items-center gap-2">
                <strong>Salary Range:</strong>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                {job.salary_min} - {job.salary_max}
              </div>
              <div>
                <strong>Posted:</strong> {job.posted}
              </div>
              <div>
                <strong>Applications:</strong> {job.applications}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right: Candidates */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-2 mb-4" onSubmit={handleAddCandidate}>
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="First Name"
                    value={newCandidate.first_name}
                    onChange={e => setNewCandidate({ ...newCandidate, first_name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Last Name"
                    value={newCandidate.last_name}
                    onChange={e => setNewCandidate({ ...newCandidate, last_name: e.target.value })}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={newCandidate.email}
                    onChange={e => setNewCandidate({ ...newCandidate, email: e.target.value })}
                    required
                  />
                  <Input
                    type="tel"
                    placeholder="Phone"
                    value={newCandidate.phone}
                    onChange={e => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={isAddingCandidate} className="w-full">
                  {isAddingCandidate ? "Adding..." : "Add"}
                </Button>
              </form>
              {isLoadingCandidates ? (
                <div className="text-center text-gray-500 py-4">Loading candidates...</div>
              ) : (
                <ul className="space-y-2">
                  {candidates.map((c) => (
                    <li key={c.id} className="flex flex-col gap-1 p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || "Unknown"}</span>
                      </div>
                      <div className="text-sm text-gray-500 ml-6">{c.email}</div>
                      {c.phone && (
                        <div className="text-sm text-gray-500 ml-6">{c.phone}</div>
                      )}
                    </li>
                  ))}
                  {candidates.length === 0 && <li className="text-gray-500 text-center py-4">No candidates yet.</li>}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 