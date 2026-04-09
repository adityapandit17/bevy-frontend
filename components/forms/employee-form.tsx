"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getEndpointUrl, apiRequest } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EmployeeFormProps {
  open: boolean
  onClose: () => void
  // Allow async submit handlers; we'll catch errors locally
  onSubmit: (formData: any) => Promise<void> | void
  initialData?: any
}

export function EmployeeForm({ open, onClose, onSubmit, initialData }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_id: "",
    designation: "",
    date_of_joining: "",
    status: "onboarding",
    badge_level: ""
  })
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    if (open) {
      fetchDepartments()
    }
  }, [open])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Convert department_id back to number for API
    const formattedData = {
      ...formData,
      department_id: formData.department_id ? parseInt(formData.department_id) : null
    }
    try {
      await onSubmit(formattedData)
    } catch (error) {
      // Errors are already surfaced via toasts in apiRequest
      // Silently handle to prevent Next.js error overlay
      // Don't re-throw or log to console to avoid Next.js detecting it
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>{initialData ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>Enter employee information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 min-h-0">
            <div className="space-y-6 pb-4">
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
                    <DatePicker
                      value={formData.date_of_joining}
                      onChange={(v) => handleChange("date_of_joining", v)}
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
                  <div>
                    <Label htmlFor="badge_level">Badge Level</Label>
                    <Select 
                      value={formData.badge_level || undefined} 
                      onValueChange={v => handleChange("badge_level", v === "none" ? "" : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select badge level (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="rockstar">Rockstar</SelectItem>
                        <SelectItem value="ninja">Ninja</SelectItem>
                        <SelectItem value="champion">Champion</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="rookie">Rookie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 border-t flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {initialData ? "Update Employee" : "Add Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
