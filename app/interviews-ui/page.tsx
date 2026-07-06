"use client"

import { useState } from "react"
import { InterviewFormUI } from "@/components/forms/interview-form-ui"
import { InterviewManagementUI } from "@/components/interview-management-ui"
import { DemoRouteGuard } from "@/components/demo-route-guard"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function InterviewsUIPage() {
  const [showScheduleForm, setShowScheduleForm] = useState(false)

  const handleScheduleSuccess = () => {
    // The InterviewManagementUI component will handle its own state
    console.log("Interview scheduled successfully!")
  }

  return (
    <DemoRouteGuard>
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Management (UI Only)</h1>
          <p className="text-muted-foreground">
            Schedule, manage, and track all candidate interviews (Mock Data)
          </p>
        </div>
        <Button onClick={() => setShowScheduleForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      <InterviewManagementUI onScheduleInterview={() => setShowScheduleForm(true)} />

      <InterviewFormUI
        open={showScheduleForm}
        onOpenChange={setShowScheduleForm}
        onSuccess={handleScheduleSuccess}
      />
    </div>
    </DemoRouteGuard>
  )
} 