"use client"

import { useCallback, useEffect, useState } from "react"
import { getApiUrl, getEndpointUrl, apiRequest, getDocumentUrl } from "@/lib/api"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Briefcase,
  MapPin,
  Users,
  BadgeCheck,
  DollarSign,
  Layers,
  MoreHorizontal,
  ArrowLeft,
  Link2,
  Copy,
  Search,
  Filter,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ResourceGuard } from "@/lib/auth/auth.guards"
import { toast } from "@/hooks/use-toast"

type Job = {
  id: number
  title: string
  description: string
  requirements: string
  status: string
  status_label?: string
  location: string
  job_type: string
  vacancies: number
  department_name: string
  skills: string
  experience: string
  salary_min?: number
  salary_max?: number
  posted: string
  applications: number
  public_slug?: string
  public_apply_url?: string
  publicly_available?: boolean
}

type Candidate = {
  id: number
  first_name: string
  last_name: string
  name?: string
  email: string
  phone?: string
  skills?: string | string[]
  applied_date: string
  status: string
  resume?: string
  linkedin_url?: string
}

export default function JobShowPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [status, setStatus] = useState("")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [newCandidate, setNewCandidate] = useState({ first_name: "", last_name: "", email: "", phone: "" })
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [isAddingCandidate, setIsAddingCandidate] = useState(false)

  const [filterSearch, setFilterSearch] = useState("")
  const [filterSkills, setFilterSkills] = useState("")
  const [filterAppliedFrom, setFilterAppliedFrom] = useState("")
  const [filterAppliedTo, setFilterAppliedTo] = useState("")

  const STATUS_OPTIONS = [
    { label: "Open", value: "open" },
    { label: "Closed", value: "closed" },
    { label: "Draft", value: "draft" },
    { label: "Filled", value: "filled" },
  ]

  const fetchJob = useCallback(async () => {
    try {
      const data = await apiRequest<Job>(getApiUrl(`job_openings/${jobId}`))
      setJob(data)
      setStatus(data.status)
    } catch (err) {
      console.error("Error fetching job:", err)
    }
  }, [jobId])

  const fetchCandidates = useCallback(async () => {
    if (!jobId) return

    setIsLoadingCandidates(true)
    try {
      const query = new URLSearchParams()
      if (filterSearch.trim()) query.set("search", filterSearch.trim())
      if (filterSkills.trim()) query.set("skills", filterSkills.trim())
      if (filterAppliedFrom) query.set("applied_from", filterAppliedFrom)
      if (filterAppliedTo) query.set("applied_to", filterAppliedTo)

      const qs = query.toString()
      const url = getApiUrl(`job_openings/${jobId}/candidates${qs ? `?${qs}` : ""}`)
      const data = await apiRequest<Candidate[]>(url)
      setCandidates(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching candidates:", err)
      setCandidates([])
    } finally {
      setIsLoadingCandidates(false)
    }
  }, [jobId, filterSearch, filterSkills, filterAppliedFrom, filterAppliedTo])

  useEffect(() => {
    fetchJob()
  }, [fetchJob])

  useEffect(() => {
    if (job) fetchCandidates()
  }, [job, fetchCandidates])

  const handleStatusChange = async (value: string) => {
    setStatus(value)
    try {
      await apiRequest(getApiUrl(`job_openings/${jobId}`), {
        method: "PATCH",
        body: JSON.stringify({ job_opening: { status: value } }),
      })
      await fetchJob()
    } catch (err) {
      console.error("Error updating job status:", err)
    }
  }

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job) return

    setIsAddingCandidate(true)
    try {
      await apiRequest(getEndpointUrl("CANDIDATES"), {
        method: "POST",
        body: JSON.stringify({
          candidate: {
            ...newCandidate,
            job_opening_id: job.id,
            position: job.title,
            department: job.department_name,
            status: "applied",
            applied_date: new Date().toISOString().split("T")[0],
            skills: job.skills || "",
            experience: job.experience || "",
          },
        }),
      })
      await fetchCandidates()
      await fetchJob()
      setNewCandidate({ first_name: "", last_name: "", email: "", phone: "" })
      toast({ title: "Candidate added" })
    } catch (err) {
      console.error("Error adding candidate:", err)
    } finally {
      setIsAddingCandidate(false)
    }
  }

  const publicUrl = job?.public_apply_url ?? null

  const copyPublicLink = async () => {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast({ title: "Public link copied" })
    } catch {
      toast({ title: "Could not copy link", variant: "destructive" })
    }
  }

  if (!job) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={() => router.push("/recruitment")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <p className="mt-4 text-gray-500">Loading…</p>
      </div>
    )
  }

  return (
    <ResourceGuard resourceKeys={["job_openings", "candidates"]} pageName="Job opening">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/recruitment")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to recruitment
        </Button>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 min-w-0 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-primary" />
                    {job.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    Job ID: {job.id}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>Update Status</DropdownMenuItem>
                      {STATUS_OPTIONS.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => handleStatusChange(option.value)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <BadgeCheck className="w-5 h-5 text-green-500" title={job.status_label || job.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {publicUrl ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-green-800 font-medium">
                      <Link2 className="h-4 w-4" />
                      Public application link
                    </div>
                    <p className="text-sm text-green-700">
                      Share this link so candidates can apply while the job is open.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input readOnly value={publicUrl} className="bg-white text-sm" />
                      <Button type="button" variant="outline" size="sm" onClick={copyPublicLink}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
                          Preview
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    Public apply link is only available when job status is <strong>Open</strong>.
                  </p>
                )}

                <div className="flex flex-wrap gap-2 items-center">
                  <Badge>{job.job_type}</Badge>
                  <Badge>{job.status_label || job.status}</Badge>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <strong>Vacancies:</strong> {job.vacancies}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Layers className="w-4 h-4" />
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

          <div className="w-full lg:w-[480px] flex-shrink-0 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Filter candidates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Name or email</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="Search…"
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Skills (comma-separated)</Label>
                  <Input
                    placeholder="e.g. React, Ruby"
                    value={filterSkills}
                    onChange={(e) => setFilterSkills(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Applied from</Label>
                    <Input
                      type="date"
                      value={filterAppliedFrom}
                      onChange={(e) => setFilterAppliedFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Applied to</Label>
                    <Input
                      type="date"
                      value={filterAppliedTo}
                      onChange={(e) => setFilterAppliedTo(e.target.value)}
                    />
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={fetchCandidates}>
                  Apply filters
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Candidates ({candidates.length})
                </CardTitle>
                <CardDescription>Applicants for this role</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-2 mb-4 border-b pb-4" onSubmit={handleAddCandidate}>
                  <p className="text-sm font-medium text-gray-700">Add manually (internal)</p>
                  <div className="flex flex-col gap-2">
                    <Input
                      placeholder="First Name"
                      value={newCandidate.first_name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, first_name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Last Name"
                      value={newCandidate.last_name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, last_name: e.target.value })}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={newCandidate.email}
                      onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                      required
                    />
                    <Input
                      type="tel"
                      placeholder="Phone"
                      value={newCandidate.phone}
                      onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isAddingCandidate} className="w-full">
                    {isAddingCandidate ? "Adding…" : "Add candidate"}
                  </Button>
                </form>

                {isLoadingCandidates ? (
                  <div className="text-center text-gray-500 py-4">Loading candidates…</div>
                ) : (
                  <ul className="space-y-2 max-h-[420px] overflow-y-auto">
                    {candidates.map((c) => (
                      <li key={c.id} className="flex flex-col gap-1 p-3 border rounded-md hover:bg-gray-50">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {c.name || `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Unknown"}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {c.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">{c.email}</div>
                        {c.phone && <div className="text-sm text-gray-500">{c.phone}</div>}
                        {c.linkedin_url && (
                          <a
                            href={c.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline ml-0"
                          >
                            LinkedIn profile
                          </a>
                        )}
                        {c.resume && (
                          <a
                            href={getDocumentUrl(c.resume)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View resume
                          </a>
                        )}
                        {c.skills && (
                          <div className="text-xs text-gray-500">
                            Skills: {Array.isArray(c.skills) ? c.skills.join(", ") : c.skills}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          Applied: {c.applied_date}
                        </div>
                      </li>
                    ))}
                    {candidates.length === 0 && (
                      <li className="text-gray-500 text-center py-6">No candidates match your filters.</li>
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ResourceGuard>
  )
}
