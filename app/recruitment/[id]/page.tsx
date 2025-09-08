"use client"
import { useEffect, useState } from "react"
import { getApiUrl, getEndpointUrl } from "@/lib/api"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, MapPin, Users, BadgeCheck, DollarSign, Layers, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function JobShowPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id
  const [job, setJob] = useState(null)
  const [status, setStatus] = useState("")
  const [candidates, setCandidates] = useState([])
  const [newCandidate, setNewCandidate] = useState({ name: "", email: "" })

  useEffect(() => {
    fetchJob()
    // fetchCandidates() // Uncomment if backend for candidates exists
  }, [jobId])

  const fetchJob = async () => {
    try {
      const res = await fetch(getApiUrl(`job_openings/${jobId}`))
      const data = await res.json()
      setJob(data)
      setStatus(data.status)
    } catch (err) {
      // handle error
    }
  }

  const handleStatusChange = async (value) => {
    setStatus(value)
    await fetch(getApiUrl(`job_openings/${jobId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ job_opening: { status: value } })
    })
    fetchJob()
  }

  const handleAddCandidate = (e) => {
    e.preventDefault()
    // Stub: Add candidate to backend if available
    setCandidates([...candidates, { ...newCandidate }])
    setNewCandidate({ name: "", email: "" })
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
                    <DropdownMenuItem onClick={() => handleStatusChange("Open")}>Open</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("Closed")}>Closed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("Draft")}>Draft</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("Inactive")}>Inactive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <BadgeCheck className="w-5 h-5 text-green-500" title={job.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge>{job.job_type}</Badge>
                <Badge>{job.status}</Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="w-4 h-4" />{job.location}</span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground"><Users className="w-4 h-4" />Vacancies: {job.vacancies}</span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground"><Layers className="w-4 h-4" />Department: {job.department_id}</span>
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
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <strong>Salary Range:</strong> {job.salary_min} - {job.salary_max}
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
              <form className="flex gap-2 mb-4" onSubmit={handleAddCandidate}>
                <Input
                  placeholder="Candidate Name"
                  value={newCandidate.name}
                  onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Email"
                  value={newCandidate.email}
                  onChange={e => setNewCandidate({ ...newCandidate, email: e.target.value })}
                  required
                />
                <Button type="submit">Add</Button>
              </form>
              <ul className="space-y-2">
                {candidates.map((c, i) => (
                  <li key={i} className="flex gap-2 items-center">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{c.name}</span>
                    <span className="text-gray-500">{c.email}</span>
                  </li>
                ))}
                {candidates.length === 0 && <li className="text-gray-500">No candidates yet.</li>}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 