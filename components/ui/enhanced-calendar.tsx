"use client"

import * as React from "react"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Video, MapPin, Clock, User, Calendar as CalendarIcon } from "lucide-react"
import { format, parseISO } from "date-fns"

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

interface EnhancedCalendarProps {
  interviews: Interview[]
  onDateSelect?: (date: Date | undefined) => void
  onInterviewClick?: (interview: Interview) => void
}

export function EnhancedCalendar({ interviews, onDateSelect, onInterviewClick }: EnhancedCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

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
    onDateSelect?.(date)
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

  // Custom classNames for calendar with interview indicators
  const calendarClassNames = {
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium",
    nav: "space-x-1 flex items-center",
    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
    row: "flex w-full mt-2",
    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative",
    day_range_end: "day-range-end",
    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    day_today: "bg-accent text-accent-foreground",
    day_outside: "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
    day_hidden: "invisible",
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
              classNames={calendarClassNames}
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
                    onClick={() => onInterviewClick?.(interview)}
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
    </div>
  )
} 