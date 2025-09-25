"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Calendar, User } from "lucide-react"

interface LeaveRequestFormProps {
  onClose: () => void
  onSubmit: (formData: any) => void
  employeeId?: number
}

export function LeaveRequestForm({ onClose, onSubmit, employeeId = 1 }: LeaveRequestFormProps) {
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
    emergencyContact: "",
    handoverNotes: "",
    halfDay: false,
    halfDayPeriod: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Map form data to backend parameter names
    const mappedData = {
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      emergencyContact: formData.emergencyContact,
      handoverNotes: formData.handoverNotes,
      halfDay: formData.halfDay,
      halfDayPeriod: formData.halfDayPeriod
    }
    
    onSubmit(mappedData)
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      if (formData.halfDay) {
        return 0.5
      } else {
        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        return diffDays
      }
    }
    return 0
  }

  const leaveBalance = {
    annual: { total: 21, used: 8, remaining: 13 },
    sick: { total: 12, used: 3, remaining: 9 },
    personal: { total: 5, used: 2, remaining: 3 },
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-gray-900">Request Leave</CardTitle>
            <CardDescription className="text-gray-600">Submit a new leave request for approval</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Balance Summary */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Your Leave Balance</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Annual Leave</p>
                  <p className="font-bold text-green-600">{leaveBalance.annual.remaining} days</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Sick Leave</p>
                  <p className="font-bold text-blue-600">{leaveBalance.sick.remaining} days</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Personal Leave</p>
                  <p className="font-bold text-purple-600">{leaveBalance.personal.remaining} days</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Leave Type *</Label>
                <Select onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">
                      Annual Leave ({leaveBalance.annual.remaining} days remaining)
                    </SelectItem>
                    <SelectItem value="sick">Sick Leave ({leaveBalance.sick.remaining} days remaining)</SelectItem>
                    <SelectItem value="personal">
                      Personal Leave ({leaveBalance.personal.remaining} days remaining)
                    </SelectItem>
                    <SelectItem value="maternity">Maternity Leave</SelectItem>
                    <SelectItem value="paternity">Paternity Leave</SelectItem>
                    <SelectItem value="emergency">Emergency Leave</SelectItem>
                    <SelectItem value="bereavement">Bereavement Leave</SelectItem>
                    <SelectItem value="compensatory">Compensatory Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    min={formData.startDate || new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Leave Summary</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total leave days</p>
                      <p className="font-bold text-blue-600">
                        {calculateDays()} {calculateDays() === 0.5 ? 'day (Half Day)' : 'days'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium text-gray-900">
                        {formData.halfDay ? (
                          `${new Date(formData.startDate).toLocaleDateString()} (${formData.halfDayPeriod === 'morning' ? 'Morning' : 'Afternoon'})`
                        ) : (
                          `${new Date(formData.startDate).toLocaleDateString()} to ${new Date(formData.endDate).toLocaleDateString()}`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="reason">Reason for Leave *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  rows={3}
                  placeholder="Please provide a detailed reason for your leave request..."
                  required
                />
              </div>

              {/* Half Day Leave Option */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="halfDay"
                    type="checkbox"
                    checked={formData.halfDay}
                    onChange={(e) => handleChange("halfDay", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="halfDay" className="text-sm font-medium text-gray-700">
                    Half Day Leave
                  </Label>
                </div>

                {formData.halfDay && (
                  <div>
                    <Label htmlFor="halfDayPeriod">Half Day Period *</Label>
                    <Select
                      value={formData.halfDayPeriod}
                      onValueChange={(value) => handleChange("halfDayPeriod", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select half day period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (9:00 AM - 1:00 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (1:00 PM - 5:00 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="handoverNotes">Work Handover Notes</Label>
                <Textarea
                  id="handoverNotes"
                  value={formData.handoverNotes}
                  onChange={(e) => handleChange("handoverNotes", e.target.value)}
                  rows={3}
                  placeholder="Describe any work that needs to be handed over or covered during your absence..."
                />
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleChange("emergencyContact", e.target.value)}
                  placeholder="Name and phone number for emergency contact"
                />
              </div>
            </div>

            {/* Approval Workflow Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Approval Workflow</h3>
              </div>
              <div className="text-sm text-gray-600">
                <p>Your leave request will be sent to:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Direct Manager: Priya Sharma</li>
                  <li>HR Team: For final approval</li>
                </ol>
                <p className="mt-2 text-xs text-gray-500">
                  You will receive email notifications about the status of your request.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
