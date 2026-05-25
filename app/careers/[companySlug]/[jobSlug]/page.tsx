"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MapPin, CheckCircle2, Loader2 } from "lucide-react"
import { getApiUrl, publicApiRequest, publicApiFormRequest } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

type PublicJob = {
  title: string
  description: string
  requirements: string
  location: string
  job_type: string
  job_type_label: string
  experience: string
  skills: string
  skills_list: string[]
  department_name: string
  formatted_posted_date: string
  salary_range: string
}

type PublicCompany = {
  name: string
  careers_slug: string
  logo_url: string | null
}

type PublicJobPayload = {
  company: PublicCompany
  job: PublicJob
}

type ApiSuccess<T> = { success: true; data: T }
type ApiError = { success: false; error?: string; errors?: string[] }

export default function PublicCareersPage() {
  const params = useParams()
  const companySlug = params.companySlug as string
  const jobSlug = params.jobSlug as string

  const [company, setCompany] = useState<PublicCompany | null>(null)
  const [job, setJob] = useState<PublicJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeError, setResumeError] = useState<string | null>(null)

  const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"]
  const ALLOWED_RESUME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    experience: "",
    location: "",
    cover_letter: "",
    education: "",
    current_company: "",
    linkedin_url: "",
  })

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setResumeError(null)

    if (!file) {
      setResumeFile(null)
      return
    }

    const extension = file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
      : ""

    if (!ALLOWED_RESUME_EXTENSIONS.includes(extension)) {
      setResumeError("Only PDF and Word files (.pdf, .doc, .docx) are allowed.")
      setResumeFile(null)
      e.target.value = ""
      return
    }

    if (!ALLOWED_RESUME_TYPES.includes(file.type) && file.type !== "") {
      setResumeError("Invalid file type. Please upload a PDF or Word document.")
      setResumeFile(null)
      e.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeError("File must be 5MB or smaller.")
      setResumeFile(null)
      e.target.value = ""
      return
    }

    setResumeFile(file)
  }

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true)
      try {
        const url = getApiUrl(`api/v1/public/${companySlug}/jobs/${jobSlug}`)
        const res = await publicApiRequest<ApiSuccess<PublicJobPayload> | ApiError>(url)
        if ("success" in res && res.success) {
          setCompany(res.data.company)
          setJob(res.data.job)
          setNotFound(false)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    if (companySlug && jobSlug) fetchJob()
  }, [companySlug, jobSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (resumeError) return

    setSubmitting(true)
    try {
      const url = getApiUrl(`api/v1/public/${companySlug}/jobs/${jobSlug}/apply`)
      const body = new FormData()

      Object.entries(form).forEach(([key, value]) => {
        if (value) body.append(`application[${key}]`, value)
      })

      if (resumeFile) {
        body.append("resume_file", resumeFile)
      }

      await publicApiFormRequest<ApiSuccess<{ message: string }>>(url, body)
      setSubmitted(true)
      toast({
        title: "Application submitted",
        description: "Thank you! Our team will review your application.",
      })
    } catch (err) {
      toast({
        title: "Could not submit",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const companyTitle = company?.name ? `${company.name} Careers` : "Careers"

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound || !job || !company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Job not available</h1>
        <p className="text-gray-600 mt-2 max-w-md">
          This position is closed or the link is invalid.
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Application received</h1>
        <p className="text-gray-600 mt-2">
          Thanks for applying to <strong>{job.title}</strong> at <strong>{company.name}</strong>.
          We will be in touch soon.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {company.logo_url ? (
              <Image
                src={company.logo_url}
                alt={`${company.name} logo`}
                width={48}
                height={48}
                className="h-12 w-12 object-contain rounded"
                unoptimized
              />
            ) : (
              <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg shrink-0">
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-semibold text-gray-900 truncate">{companyTitle}</h1>
              <p className="text-sm text-muted-foreground truncate">We&apos;re hiring</p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {job.department_name}
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              {job.title}
            </CardTitle>
            <CardDescription className="flex flex-wrap gap-3 items-center">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
              <Badge>{job.job_type_label || job.job_type}</Badge>
              <span>Posted {job.formatted_posted_date}</span>
              {job.salary_range && job.salary_range !== "Not specified" && (
                <span>{job.salary_range}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-sm max-w-none">
            <div>
              <h3 className="font-semibold text-gray-900">About the role</h3>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Requirements</h3>
              <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Skills</h3>
              <p className="text-gray-700">{job.skills}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Experience</h3>
              <p className="text-gray-700">{job.experience}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apply for this position</CardTitle>
            <CardDescription>Fill in your details below. All fields marked * are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First name *</Label>
                  <Input
                    id="first_name"
                    required
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last name *</Label>
                  <Input
                    id="last_name"
                    required
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of experience</Label>
                  <Input
                    id="experience"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_company">Current company</Label>
                <Input
                  id="current_company"
                  value={form.current_company}
                  onChange={(e) => setForm({ ...form, current_company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resume_file">Resume (PDF or Word)</Label>
                <Input
                  id="resume_file"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleResumeChange}
                />
                <p className="text-xs text-muted-foreground">
                  Accepted formats: PDF, DOC, DOCX. Max size 5MB.
                </p>
                {resumeFile && (
                  <p className="text-sm text-gray-600">Selected: {resumeFile.name}</p>
                )}
                {resumeError && <p className="text-sm text-red-600">{resumeError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn profile URL</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={form.linkedin_url}
                  onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover_letter">Cover letter</Label>
                <Textarea
                  id="cover_letter"
                  rows={5}
                  value={form.cover_letter}
                  onChange={(e) => setForm({ ...form, cover_letter: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
