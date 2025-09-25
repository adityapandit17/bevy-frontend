"use client"

import React, { useState, useEffect } from "react"
import { getApiUrl, getEndpointUrl } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"

interface AttendanceRecord {
  id: number
  employee_id: number
  employee_name: string
  employee_email: string
  employee_department: string
  date: string
  check_in: string | null
  check_out: string | null
  formatted_check_in: string | null
  formatted_check_out: string | null
  status: string
  status_label: string
  status_color: string
  working_hours: number
  overtime_hours: number
  is_late: boolean
  created_at: string
  updated_at: string
}

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  department?: {
    id: number
    name: string
  }
  designation: string
}

interface AttendanceMarkingProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AttendanceMarking({ isOpen, onClose, onSuccess }: AttendanceMarkingProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [attendanceDate, setAttendanceDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [checkInTime, setCheckInTime] = useState<string>("")
  const [checkOutTime, setCheckOutTime] = useState<string>("")
  const [status, setStatus] = useState<string>("present")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load employees on component mount
  useEffect(() => {
    if (isOpen) {
      fetchEmployees()
    }
  }, [isOpen])

  const fetchEmployees = async () => {
    try {
      const response = await fetch(getEndpointUrl('EMPLOYEES'))
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setError('Failed to load employees')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(getEndpointUrl('ATTENDANCE_RECORDS'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendance_record: {
            employee_id: parseInt(selectedEmployee),
            date: attendanceDate,
            check_in: checkInTime ? `${attendanceDate}T${checkInTime}:00` : null,
            check_out: checkOutTime ? `${attendanceDate}T${checkOutTime}:00` : null,
            status: status
          }
        })
      })

      if (response.ok) {
        setSuccess('Attendance marked successfully!')
        // Reset form
        setSelectedEmployee("")
        setCheckInTime("")
        setCheckOutTime("")
        setStatus("present")
        // Call success callback
        if (onSuccess) {
          onSuccess()
        }
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.errors?.join(', ') || 'Failed to mark attendance')
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setSuccess(null)
    setSelectedEmployee("")
    setCheckInTime("")
    setCheckOutTime("")
    setStatus("present")
    onClose()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-800"
      case "absent": return "bg-red-100 text-red-800"
      case "late": return "bg-yellow-100 text-yellow-800"
      case "half_day": return "bg-blue-100 text-blue-800"
      case "work_from_home": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Mark Attendance
          </DialogTitle>
          <DialogDescription>
            Record employee attendance for a specific date
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">Employee *</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee} required>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="date"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="pl-10"
                max={format(new Date(), 'yyyy-MM-dd')}
                required
              />
            </div>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check In Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="checkIn"
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check Out Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="checkOut"
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="pl-10"
                  min={checkInTime}
                />
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Present
                  </div>
                </SelectItem>
                <SelectItem value="absent">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Absent
                  </div>
                </SelectItem>
                <SelectItem value="late">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    Late
                  </div>
                </SelectItem>
                <SelectItem value="half_day">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Half Day
                  </div>
                </SelectItem>
                <SelectItem value="work_from_home">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    Work from Home
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selected Status Preview */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Selected Status:</span>
              <Badge className={getStatusColor(status)}>
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedEmployee}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Attendance
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

