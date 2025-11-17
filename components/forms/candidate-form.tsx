"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Save, UserPlus, Upload, FileText, Trash2, Eye } from "lucide-react"
import { getApiUrl, getEndpointUrl, getDocumentUrl, getFileType } from "@/lib/api"
import { DocumentPreview } from "@/components/ui/document-preview"
import { AUTH_CONFIG } from "@/config/auth.config"

interface Candidate {
  id?: string
  name: string
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
  skills: string[]
  education: string
  current_company?: string
  expected_salary?: string
  availability?: string
}

interface CandidateFormProps {
  candidate?: Candidate | null
  onSave: (candidate: Candidate) => void
  onCancel: () => void
  isLoading?: boolean
}

const statusOptions = [
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "technical", label: "Technical" },
  { value: "final", label: "Final" },
  { value: "offered", label: "Offered" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
]

const departmentOptions = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "Customer Success",
  "Data Science",
]

export function CandidateForm({ candidate, onSave, onCancel, isLoading = false }: CandidateFormProps) {
  const [formData, setFormData] = useState<Candidate>({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    experience: "",
    location: "",
    status: "applied",
    applied_date: new Date().toISOString().split('T')[0],
    last_contact: new Date().toISOString().split('T')[0],
    resume: "",
    cover_letter: "",
    notes: "",
    skills: [],
    education: "",
    current_company: "",
    expected_salary: "",
    availability: "",
  })

  const [skillInput, setSkillInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const coverLetterInputRef = useRef<HTMLInputElement>(null)
  
  const [previewState, setPreviewState] = useState({
    open: false,
    documentUrl: '',
    documentName: '',
    documentType: 'pdf'
  })

  const handleDocumentPreview = (url: string, name: string, type?: string) => {
    setPreviewState({
      open: true,
      documentUrl: url,
      documentName: name,
      documentType: type || getFileType(url) || 'pdf'
    })
  }

  const handleClosePreview = (open: boolean) => {
    setPreviewState(prev => ({ ...prev, open }))
  }

  useEffect(() => {
    if (candidate) {
      setFormData(prev => ({
        ...prev,
        ...candidate,
        skills: Array.isArray(candidate.skills)
          ? candidate.skills
          : (candidate.skills || "")
              .split(",")
              .map(s => s.trim())
              .filter(Boolean),
        resume: candidate.resume || prev.resume,
        cover_letter: candidate.cover_letter || prev.cover_letter,
        department:
          departmentOptions.includes(candidate.department)
            ? candidate.department
            : departmentOptions.find(
                d => d.toLowerCase() === (candidate.department || "").toLowerCase()
              ) || prev.department,
        status: candidate.status && statusOptions.find(s => s.value === candidate.status)
          ? candidate.status
          : prev.status,
      }))
    }
  }, [candidate])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    if (!formData.position.trim()) newErrors.position = "Position is required"
    if (!formData.department.trim()) newErrors.department = "Department is required"
    if (!formData.experience.trim()) newErrors.experience = "Experience is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.applied_date) newErrors.applied_date = "Applied date is required"
    if (!formData.last_contact) newErrors.last_contact = "Last contact date is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof Candidate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleFileUpload = (file: File, type: 'resume' | 'coverLetter') => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [type]: 'Please upload a PDF or Word document' }))
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [type]: 'File size must be less than 5MB' }))
      return
    }

    // Clear any existing errors
    setErrors(prev => ({ ...prev, [type]: '' }))

    if (type === 'resume') {
      setResumeFile(file)
    } else {
      setCoverLetterFile(file)
    }
  }

  const handleFileRemove = (type: 'resume' | 'coverLetter') => {
    if (type === 'resume') {
      setResumeFile(null)
      if (resumeInputRef.current) {
        resumeInputRef.current.value = ''
      }
    } else {
      setCoverLetterFile(null)
      if (coverLetterInputRef.current) {
        coverLetterInputRef.current.value = ''
      }
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    // Get authorization token
    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_CONFIG.tokenKey) : null
    
    // Prepare headers - don't set Content-Type for FormData (browser will set it with boundary)
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    try {
      const response = await fetch(getEndpointUrl('UPLOAD'), {
        method: 'POST',
        headers,
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
      
      const result = await response.json()
      return result.url || result.path
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsUploading(true)
    try {
      const candidateData = { ...formData }

      if (Array.isArray(candidateData.skills)) {
        candidateData.skills = candidateData.skills.join(", ")
      }

      // Upload files if they exist
      if (resumeFile) {
        candidateData.resume = await uploadFile(resumeFile)
      } else {
        candidateData.resume = formData.resume // keep old one
      }
      if (coverLetterFile) {
        candidateData.cover_letter = await uploadFile(coverLetterFile)
      } else {
        candidateData.cover_letter = formData.cover_letter
      }

      onSave(candidateData)
    } catch (error) {
      console.error("Error saving candidate:", error)
      setErrors(prev => ({ ...prev, general: "Failed to save candidate. Please try again." }))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {candidate ? "Edit Candidate" : "Add New Candidate"}
          </CardTitle>
          <CardDescription>
            {candidate ? "Update candidate information" : "Enter candidate details to add them to the system"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter full name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter location"
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
            </div>
          </div>

          {/* Job Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                placeholder="Enter position title"
                className={errors.position ? "border-red-500" : ""}
              />
              {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Label htmlFor="department">Department *</Label>
              <Select
                key={formData.department || "no-dept"} // 👈 forces re-render if department changes
                value={formData.department || ""}
                onValueChange={(value) => handleInputChange("department", value)}
              >
                <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience *</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)}
                placeholder="e.g., 3 years"
                className={errors.experience ? "border-red-500" : ""}
              />
              {errors.experience && <p className="text-sm text-red-500">{errors.experience}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                key={formData.status || "no-status"}
                value={formData.status || ""}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => handleInputChange("education", e.target.value)}
                placeholder="Enter education details"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_company">Current Company</Label>
              <Input
                id="current_company"
                value={formData.current_company}
                onChange={(e) => handleInputChange("current_company", e.target.value)}
                placeholder="Enter current company"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_salary">Expected Salary</Label>
              <Input
                id="expected_salary"
                value={formData.expected_salary}
                onChange={(e) => handleInputChange("expected_salary", e.target.value)}
                placeholder="Enter expected salary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Input
                id="availability"
                value={formData.availability}
                onChange={(e) => handleInputChange("availability", e.target.value)}
                placeholder="e.g., 2 weeks notice"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applied_date">Applied Date *</Label>
              <Input
                id="applied_date"
                type="date"
                value={formData.applied_date}
                onChange={(e) => handleInputChange("applied_date", e.target.value)}
                className={errors.applied_date ? "border-red-500" : ""}
              />
              {errors.applied_date && <p className="text-sm text-red-500">{errors.applied_date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_contact">Last Contact Date *</Label>
              <Input
                id="last_contact"
                type="date"
                value={formData.last_contact}
                onChange={(e) => handleInputChange("last_contact", e.target.value)}
                className={errors.last_contact ? "border-red-500" : ""}
              />
              {errors.last_contact && <p className="text-sm text-red-500">{errors.last_contact}</p>}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
              />
              <Button type="button" onClick={handleAddSkill} size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Resume</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {resumeFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{resumeFile.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileRemove('resume')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload resume (PDF, DOC, DOCX)</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => resumeInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'resume')
                      }}
                    />
                  </div>
                )}
              </div>
              {errors.resume && <p className="text-sm text-red-500">{errors.resume}</p>}
            </div>

            {!resumeFile && formData.resume && (
              <div className="flex items-center justify-between text-sm text-gray-700 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDocumentPreview(getDocumentUrl(formData.resume, false), 'Resume', getFileType(formData.resume))}
                  className="text-blue-600 hover:text-blue-700 hover:underline p-0 h-auto"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View existing resume
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, resume: "" }))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label>Cover Letter</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {coverLetterFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{coverLetterFile.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(coverLetterFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileRemove('coverLetter')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload cover letter (PDF, DOC, DOCX)</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => coverLetterInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                    <input
                      ref={coverLetterInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'coverLetter')
                      }}
                    />
                  </div>
                )}
              </div>
              {errors.coverLetter && <p className="text-sm text-red-500">{errors.coverLetter}</p>}
            </div>

            {!coverLetterFile && formData.cover_letter && (
              <div className="flex items-center justify-between text-sm text-gray-700 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDocumentPreview(getDocumentUrl(formData.cover_letter || '', false), 'Cover Letter', getFileType(formData.cover_letter || ''))}
                  className="text-blue-600 hover:text-blue-700 hover:underline p-0 h-auto"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View existing cover letter
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, cover_letter: "" }))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Enter any additional notes about the candidate"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* General Error Display */}
      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading || isUploading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isUploading}>
          {isLoading || isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {isUploading ? "Uploading files..." : "Saving..."}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {candidate ? "Update Candidate" : "Add Candidate"}
            </>
          )}
        </Button>
      </div>

      {/* Document Preview Dialog */}
      <DocumentPreview
        open={previewState.open}
        onOpenChange={handleClosePreview}
        documentUrl={previewState.documentUrl}
        documentName={previewState.documentName}
        documentType={previewState.documentType}
      />
    </form>
  )
}
