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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Management</h1>
          <p className="text-muted-foreground">
            Schedule, manage, and track all candidate interviews
          </p>
        </div>
        <Button onClick={() => setShowScheduleForm(true)} className="flex items-center gap-2">
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