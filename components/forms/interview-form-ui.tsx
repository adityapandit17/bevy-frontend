"use client"

import { useState, useEffect } from "react"
import { getApiUrl, getEndpointUrl, apiRequest } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, Clock, User, Video, Phone, MapPin } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface InterviewFormUIProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate?: {
    id: string
    name: string
    email: string
    position: string
  }
  onSuccess?: () => void
  editInterview?: {
    id: string
    interview_type: string
    scheduled_date: string
    scheduled_time: string
    interviewer: string
    notes?: string
  }
}

// Mock employee data
const mockEmployees = [
  { id: "1", name: "Sarah Johnson", email: "sarah.johnson@company.com", designation: "Senior HR Manager" },
  { id: "2", name: "Mike Chen", email: "mike.chen@company.com", designation: "Technical Lead" },
  { id: "3", name: "Lisa Wang", email: "lisa.wang@company.com", designation: "Product Manager" },
  { id: "4", name: "David Brown", email: "david.brown@company.com", designation: "Engineering Manager" },
  { id: "5", name: "Emma Wilson", email: "emma.wilson@company.com", designation: "Design Lead" },
]

export function InterviewFormUI({ 
  open, 
  onOpenChange, 
  candidate, 
  onSuccess,
  editInterview 
}: InterviewFormUIProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    candidate_id: "",
    interview_type: "",
    scheduled_date: "",
    scheduled_time: "",
    interviewer: "",
    notes: ""
  })

  useEffect(() => {
    if (open) {
      if (candidate) {
        setFormData(prev => ({ ...prev, candidate_id: candidate.id }))
      }
      if (editInterview) {
        setFormData({
          candidate_id: candidate?.id || "",
          interview_type: editInterview.interview_type,
          scheduled_date: editInterview.scheduled_date,
          scheduled_time: editInterview.scheduled_time,
          interviewer: editInterview.interviewer,
          notes: editInterview.notes || ""
        })
      }
    }
  }, [open, candidate, editInterview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editInterview 
        ? getApiUrl(`interviews/${editInterview.id}`)
        : getEndpointUrl('INTERVIEWS')
      
      const method = editInterview ? "PATCH" : "POST"
      
      await apiRequest(url, {
        method,
        body: JSON.stringify({
          interview: {
            ...formData,
            candidate_id: formData.candidate_id ? parseInt(formData.candidate_id) : null,
            status: "scheduled"
          }
        })
      })

      toast({
        title: editInterview ? "Interview Updated" : "Interview Scheduled",
        description: editInterview 
          ? "Interview has been updated successfully."
          : "Interview has been scheduled successfully."
      })
      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      // Error handling is done by apiRequest (toast notifications)
      console.error("Error scheduling interview:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      candidate_id: "",
      interview_type: "",
      scheduled_date: "",
      scheduled_time: "",
      interviewer: "",
      notes: ""
    })
  }

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case "phone":
        return <Phone className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "onsite":
        return <MapPin className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getInterviewTypeLabel = (type: string) => {
    switch (type) {
      case "phone":
        return "Phone Interview"
      case "video":
        return "Video Interview"
      case "onsite":
        return "On-site Interview"
      default:
        return "Interview"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {editInterview ? "Edit Interview" : "Schedule Interview"}
          </DialogTitle>
          <DialogDescription>
            {editInterview 
              ? "Update interview details for this candidate"
              : `Schedule an interview for ${candidate?.name || "the candidate"}`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Candidate Info */}
          {candidate && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Candidate Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{candidate.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Position:</span>
                  <p className="font-medium">{candidate.position}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{candidate.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Interview Type */}
          <div className="space-y-2">
            <Label htmlFor="interviewType">Interview Type *</Label>
            <Select 
              value={formData.interview_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, interview_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Interview
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video Interview
                  </div>
                </SelectItem>
                <SelectItem value="onsite">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    On-site Interview
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Date *</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Time *</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Interviewer */}
          <div className="space-y-2">
            <Label htmlFor="interviewer">Interviewer *</Label>
            <Select 
              value={formData.interviewer} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, interviewer: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interviewer" />
              </SelectTrigger>
              <SelectContent>
                {mockEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.name}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {employee.name} - {employee.designation}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or instructions for the interview..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Interview Preview */}
          {formData.interview_type && formData.scheduled_date && formData.scheduled_time && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Interview Preview</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  {getInterviewTypeIcon(formData.interview_type)}
                  <span>{getInterviewTypeLabel(formData.interview_type)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(formData.scheduled_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formData.scheduled_time}</span>
                </div>
                {formData.interviewer && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{formData.interviewer}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : editInterview ? "Update Interview" : "Schedule Interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 