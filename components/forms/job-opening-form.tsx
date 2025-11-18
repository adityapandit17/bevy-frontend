"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getEndpointUrl, apiRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface JobOpeningFormProps {
  onClose: () => void
  onSubmit: (formData: any) => void
  initialData?: any
}

export function JobOpeningForm({ onClose, onSubmit, initialData }: JobOpeningFormProps) {
  const [formData, setFormData] = useState(initialData || {
    title: "",
    department_id: "",
    location: "",
    job_type: "",
    vacancies: "",
    description: "",
    requirements: "",
    salary_min: "",
    salary_max: "",
    experience: "",
    skills: "",
    status: "open",
    posted: new Date().toISOString().split('T')[0],
    applications: 0
  })
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (initialData) {
      // Convert department_id to string for Select component
      const formattedData = {
        ...initialData,
        department_id: String(initialData.department_id || "")
      }
      setFormData(formattedData)
    }
  }, [initialData])

  const fetchDepartments = async () => {
    try {
      const data = await apiRequest<any>(getEndpointUrl('DEPARTMENTS'))
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setDepartments(data)
      } else if (data && Array.isArray(data.departments)) {
        setDepartments(data.departments)
      } else {
        setDepartments([])
      }
    } catch (err) {
      console.error("Error fetching departments:", err)
      setDepartments([]) // Set to empty array on error
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Transform the form data to match backend expectations
    const transformedData = {
      ...formData,
      department_id: formData.department_id ? parseInt(formData.department_id) : null,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) * 100000 : null, // Convert LPA to actual amount
      salary_max: formData.salary_max ? parseInt(formData.salary_max) * 100000 : null, // Convert LPA to actual amount
      vacancies: parseInt(formData.vacancies),
      applications: parseInt(formData.applications) || 0
    }
    
    onSubmit(transformedData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-gray-900">Create Job Opening</CardTitle>
            <CardDescription className="text-gray-600">Post a new position to attract candidates</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department_id} onValueChange={v => handleChange("department_id", v)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(departments) && departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="e.g., Bangalore, India"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="job_type">Employment Type *</Label>
                  <Select onValueChange={(value) => handleChange("job_type", value)} value={formData.job_type} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vacancies">Number of Vacancies *</Label>
                  <Input
                    id="vacancies"
                    type="number"
                    value={formData.vacancies}
                    onChange={(e) => handleChange("vacancies", e.target.value)}
                    placeholder="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience Required *</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleChange("experience", e.target.value)}
                    placeholder="e.g., 3-5 years"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={v => handleChange("status", v)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="filled">Filled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="posted">Posted Date *</Label>
                  <Input
                    id="posted"
                    type="date"
                    value={formData.posted}
                    onChange={(e) => handleChange("posted", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Salary Range */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Compensation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary_min">Minimum Salary (₹ LPA)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => handleChange("salary_min", e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="salary_max">Maximum Salary (₹ LPA)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => handleChange("salary_max", e.target.value)}
                    placeholder="20"
                  />
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleChange("requirements", e.target.value)}
                  rows={4}
                  placeholder="List the required skills, qualifications, and experience..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="skills">Key Skills *</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleChange("skills", e.target.value)}
                  placeholder="e.g., React, Node.js, AWS, Python (comma separated)"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Save as Draft
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {initialData ? "Update Job" : "Publish Job Opening"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
