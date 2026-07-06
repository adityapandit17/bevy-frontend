"use client"

import { useState } from "react"
import { InterviewForm } from "@/components/forms/interview-form"
import { InterviewManagement } from "@/components/interview-management"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function InterviewsPage() {
  const [showScheduleForm, setShowScheduleForm] = useState(false)

  const handleScheduleSuccess = () => {
    // The InterviewManagement component will refresh its data
    // when the form is closed
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Interview Management</h1>
          <p className="text-muted-foreground">
            Schedule, manage, and track all candidate interviews
          </p>
        </div>
        <Button onClick={() => setShowScheduleForm(true)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      <InterviewManagement onScheduleInterview={() => setShowScheduleForm(true)} />

      <InterviewForm
        open={showScheduleForm}
        onOpenChange={setShowScheduleForm}
        onSuccess={handleScheduleSuccess}
      />
    </div>
  )
} 