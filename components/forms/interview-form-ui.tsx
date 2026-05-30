"use client"

import { useState, useEffect, useMemo } from "react"
import { getApiUrl, getEndpointUrl, apiRequest } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
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
import {
  INTERVIEW_DURATION_PRESETS,
  durationMinutesFromForm,
  durationPresetFromMinutes,
} from "@/lib/interview-duration"
import {
  isScheduleInPast,
  minScheduleTimeForDate,
  SCHEDULE_IN_PAST_MESSAGE,
} from "@/lib/interview-schedule"

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
    duration_minutes?: number
    notes?: string
  }
}

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  designation: string
}

export function InterviewFormUI({ 
  open, 
  onOpenChange, 
  candidate, 
  onSuccess,
  editInterview 
}: InterviewFormUIProps) {
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState({
    candidate_id: "",
    interview_type: "",
    scheduled_date: "",
    scheduled_time: "",
    interviewer: "",
    duration_preset: "60",
    custom_duration_minutes: "60",
    notes: ""
  })

  useEffect(() => {
    if (open) {
      fetchEmployees()
      if (candidate) {
        setFormData(prev => ({ ...prev, candidate_id: candidate.id }))
      }
    }
  }, [open, candidate])

  useEffect(() => {
    if (open && editInterview && employees.length > 0) {
      const employee = employees.find(
        (emp) => `${emp.first_name} ${emp.last_name}` === editInterview.interviewer
      )
      setFormData((prev) => ({
        ...prev,
        interview_type: editInterview.interview_type,
        scheduled_date: editInterview.scheduled_date,
        scheduled_time: editInterview.scheduled_time,
        interviewer: employee ? String(employee.id) : "",
        duration_preset: durationPresetFromMinutes(editInterview.duration_minutes),
        custom_duration_minutes: String(editInterview.duration_minutes ?? 60),
        notes: editInterview.notes || "",
      }))
    }
  }, [open, editInterview, employees])

  const fetchEmployees = async () => {
    try {
      const response = await apiRequest<{ data: Employee[] }>(
        `${getEndpointUrl("EMPLOYEES")}?page=1&per_page=1000`
      )
      setEmployees(Array.isArray(response?.data) ? response.data : [])
    } catch {
      setEmployees([])
    }
  }

  const minScheduleTime = useMemo(
    () => minScheduleTimeForDate(formData.scheduled_date),
    [formData.scheduled_date]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      formData.scheduled_date &&
      formData.scheduled_time &&
      isScheduleInPast(formData.scheduled_date, formData.scheduled_time)
    ) {
      toast({
        title: "Invalid schedule",
        description: SCHEDULE_IN_PAST_MESSAGE,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const url = editInterview 
        ? getApiUrl(`interviews/${editInterview.id}`)
        : getEndpointUrl('INTERVIEWS')
      
      const method = editInterview ? "PATCH" : "POST"
      
      const employee = employees.find((emp) => String(emp.id) === formData.interviewer)
      const interviewerName = employee
        ? `${employee.first_name} ${employee.last_name}`
        : formData.interviewer
      const durationMinutes = durationMinutesFromForm(
        formData.duration_preset,
        formData.custom_duration_minutes
      )

      await apiRequest(url, {
        method,
        body: JSON.stringify({
          interview: {
            candidate_id: formData.candidate_id ? parseInt(formData.candidate_id, 10) : null,
            interview_type: formData.interview_type,
            scheduled_date: formData.scheduled_date,
            scheduled_time: formData.scheduled_time,
            interviewer: interviewerName,
            interviewer_employee_id: employee?.id ?? null,
            duration_minutes: durationMinutes,
            notes: formData.notes,
            status: "scheduled",
          },
        }),
      })

      toast({
        title: editInterview ? "Interview Updated" : "Interview Scheduled",
        description: editInterview
          ? "Interview has been updated successfully."
          : "Calendar invites are sent when Google Calendar is connected.",
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
      duration_preset: "60",
      custom_duration_minutes: "60",
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
              <DatePicker
                value={formData.scheduled_date}
                onChange={(v) => setFormData(prev => ({ ...prev, scheduled_date: v }))}
                min={new Date()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Time *</Label>
              <TimePicker
                value={formData.scheduled_time}
                onChange={(v) => setFormData(prev => ({ ...prev, scheduled_time: v }))}
                min={minScheduleTime}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Meeting duration *</Label>
            <Select
              value={formData.duration_preset}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, duration_preset: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {INTERVIEW_DURATION_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {formData.duration_preset === "custom" && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  value={formData.custom_duration_minutes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, custom_duration_minutes: e.target.value }))
                  }
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            )}
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
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {employee.first_name} {employee.last_name} - {employee.designation}
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
                  <span>
                    {formData.scheduled_time} ·{" "}
                    {durationMinutesFromForm(formData.duration_preset, formData.custom_duration_minutes)} min
                  </span>
                </div>
                {formData.interviewer && (() => {
                  const employee = employees.find((emp) => String(emp.id) === formData.interviewer)
                  return employee ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{employee.first_name} {employee.last_name}</span>
                    </div>
                  ) : null
                })()}
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