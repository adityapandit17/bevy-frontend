"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getEndpointUrl, apiRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X, Upload } from "lucide-react"

interface EmployeeFormProps {
  onClose: () => void
  onSubmit: (formData: any) => void
  initialData?: any
}

export function EmployeeForm({ onClose, onSubmit, initialData }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_id: "",
    designation: "",
    date_of_joining: "",
    status: "onboarding"
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

  // Also update form data when departments are loaded and we have initial data
  useEffect(() => {
    if (initialData && departments.length > 0) {
      const formattedData = {
        ...initialData,
        department_id: String(initialData.department_id || "")
      }
      setFormData(formattedData)
    }
  }, [departments, initialData])

  const fetchDepartments = async () => {
    try {
      const data = await apiRequest<any[]>(getEndpointUrl('DEPARTMENTS'))
      setDepartments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching departments:', err)
      setDepartments([])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Convert department_id back to number for API
    const formattedData = {
      ...formData,
      department_id: formData.department_id ? parseInt(formData.department_id) : null
    }
    onSubmit(formattedData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-gray-900">Add New Employee</CardTitle>
            <CardDescription className="text-gray-600">Enter employee information</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department_id">Department *</Label>
                  <Select 
                    key={`department-${formData.department_id}-${departments.length}`}
                    value={formData.department_id} 
                    onValueChange={v => handleChange("department_id", v)} 
                    required
                  >
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
                  <Label htmlFor="designation">Designation *</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => handleChange("designation", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_joining">Joining Date *</Label>
                  <Input
                    id="date_of_joining"
                    type="date"
                    value={formData.date_of_joining}
                    onChange={(e) => handleChange("date_of_joining", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    disabled
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {initialData ? "Update Employee" : "Add Employee"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
