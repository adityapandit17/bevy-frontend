"use client"

import { useState } from "react"
import { InterviewForm } from "@/components/forms/interview-form"
import { InterviewManagement } from "@/components/interview-management"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function InterviewTestPage() {
  const [showScheduleForm, setShowScheduleForm] = useState(false)

  const testCandidate = {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    position: "Software Engineer"
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Interview Functionality Test</h1>
          <p className="text-muted-foreground">
            Testing the interview scheduling and management features
          </p>
        </div>
        <Button onClick={() => setShowScheduleForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Test Interview
        </Button>
      </div>

      <InterviewManagement onScheduleInterview={() => setShowScheduleForm(true)} />

      <InterviewForm
        open={showScheduleForm}
        onOpenChange={setShowScheduleForm}
        candidate={testCandidate}
        onSuccess={() => {
          console.log("Interview scheduled successfully!")
        }}
      />
    </div>
  )
} 