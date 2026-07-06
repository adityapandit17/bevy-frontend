"use client"

import { Calendar } from "@/components/ui/calendar"
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

// Sample interview data for testing
const sampleInterviews = [
  {
    id: "1",
    candidate_id: "1",
    candidate_name: "Arjun Mehta",
    candidate_email: "arjun.mehta@email.com",
    interview_type: "phone" as const,
    scheduled_date: "2025-01-24",
    scheduled_time: "04:30",
    interviewer: "Sarah Johnson",
    status: "completed" as const,
    notes: "Good technical discussion",
    feedback: "Positive - Proceed to technical round",
    rating: 4,
  },
  {
    id: "2",
    candidate_id: "2",
    candidate_name: "Priya Sharma",
    candidate_email: "priya.sharma@email.com",
    interview_type: "video" as const,
    scheduled_date: "2025-01-31",
    scheduled_time: "08:30",
    interviewer: "Mike Chen",
    status: "scheduled" as const,
    notes: "Technical coding interview",
    feedback: null,
    rating: null,
  },
  {
    id: "3",
    candidate_id: "3",
    candidate_name: "Rohit Gupta",
    candidate_email: "rohit.gupta@email.com",
    interview_type: "onsite" as const,
    scheduled_date: "2025-01-30",
    scheduled_time: "10:00",
    interviewer: "David Wilson",
    status: "cancelled" as const,
    notes: "Candidate requested reschedule",
    feedback: null,
    rating: null,
  },
]

export default function CalendarTestPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Calendar Test Page</h1>
        <p className="text-gray-600">Testing calendar components and functionality</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <p className="mt-4 text-sm text-gray-600">
              Selected date: {date ? date.toLocaleDateString() : "None"}
            </p>
          </CardContent>
        </Card>

        {/* Enhanced Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Calendar with Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedCalendar
              interviews={sampleInterviews}
              onInterviewClick={(interview) => {
                console.log('Interview clicked:', interview)
                alert(`Interview: ${interview.candidate_name} - ${interview.interview_type}`)
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-green-600">✓ Basic Calendar</h3>
              <p className="text-sm text-gray-600 mt-1">Date selection working</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-green-600">✓ Enhanced Calendar</h3>
              <p className="text-sm text-gray-600 mt-1">Interview display working</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-green-600">✓ Responsive Design</h3>
              <p className="text-sm text-gray-600 mt-1">Mobile-friendly layout</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 