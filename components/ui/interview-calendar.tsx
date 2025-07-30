"use client"

import * as React from "react"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Phone, Video, MapPin, Clock, User, Calendar as CalendarIcon } from "lucide-react"
import { format, isSameDay, parseISO } from "date-fns"

interface Interview {
  id: string
  candidate_id: string
  candidate_name: string
  candidate_email: string
  interview_type: "phone" | "video" | "onsite"
  scheduled_date: string
  scheduled_time: string
  interviewer: string
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  notes?: string
  feedback?: string
  rating?: number
}

interface InterviewCalendarProps {
  interviews: Interview[]
  onInterviewClick?: (interview: Interview) => void
}

export function InterviewCalendar({ interviews, onInterviewClick }: InterviewCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [showInterviewDetails, setShowInterviewDetails] = useState(false)

  // Group interviews by date
  const interviewsByDate = interviews.reduce((acc, interview) => {
    const date = interview.scheduled_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(interview)
    return acc
  }, {} as Record<string, Interview[]>)

  // Get interviews for selected date
  const selectedDateInterviews = selectedDate 
    ? interviewsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : []

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  const handleInterviewClick = (interview: Interview) => {
    setSelectedInterview(interview)
    setShowInterviewDetails(true)
    onInterviewClick?.(interview)
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
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no_show":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Scheduled"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      case "no_show":
        return "No Show"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Interview Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
            />
            
            {/* Legend */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Cancelled</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>No Show</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Interviews */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {selectedDateInterviews.length} interview{selectedDateInterviews.length !== 1 ? 's' : ''}
            </p>
          </CardHeader>
          <CardContent>
            {selectedDateInterviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No interviews scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleInterviewClick(interview)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getInterviewTypeIcon(interview.interview_type)}
                        <span className="font-medium text-sm">{interview.candidate_name}</span>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(interview.status)}`}>
                        {getStatusBadge(interview.status)}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{interview.scheduled_time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{interview.interviewer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interview Details Dialog */}
      <Dialog open={showInterviewDetails} onOpenChange={setShowInterviewDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedInterview && getInterviewTypeIcon(selectedInterview.interview_type)}
              Interview Details
            </DialogTitle>
            <DialogDescription>
              {selectedInterview?.candidate_name} - {selectedInterview?.interview_type} Interview
            </DialogDescription>
          </DialogHeader>
          
          {selectedInterview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Candidate</label>
                  <p className="text-sm text-gray-900">{selectedInterview.candidate_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedInterview.candidate_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Interview Type</label>
                  <div className="flex items-center gap-1 mt-1">
                    {getInterviewTypeIcon(selectedInterview.interview_type)}
                    <span className="text-sm text-gray-900 capitalize">{selectedInterview.interview_type}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Interviewer</label>
                  <p className="text-sm text-gray-900">{selectedInterview.interviewer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900">
                    {format(parseISO(selectedInterview.scheduled_date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Time</label>
                  <p className="text-sm text-gray-900">{selectedInterview.scheduled_time}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(selectedInterview.status)}>
                    {getStatusBadge(selectedInterview.status)}
                  </Badge>
                </div>
              </div>
              
              {selectedInterview.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedInterview.notes}</p>
                </div>
              )}
              
              {selectedInterview.feedback && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Feedback</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedInterview.feedback}</p>
                </div>
              )}
              
              {selectedInterview.rating && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Rating</label>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < selectedInterview.rating! ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      {selectedInterview.rating}/5
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 