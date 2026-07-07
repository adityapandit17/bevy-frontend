"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  LogIn,
  LogOut,
  Coffee,
  CalendarPlus,
  MessageSquare,
  LifeBuoy,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EmployeeMobileDashboardProps {
  userName?: string
  isPunchedIn: boolean
  isOnBreak: boolean
  punchLoading: boolean
  hoursLabel: string
  punchInTime?: string | null
  onPunchIn: () => void
  onPunchOut: () => void
  onBreakToggle: () => void
  hasEmployeeId: boolean
}

export function EmployeeMobileDashboard({
  userName,
  isPunchedIn,
  isOnBreak,
  punchLoading,
  hoursLabel,
  punchInTime,
  onPunchIn,
  onPunchOut,
  onBreakToggle,
  hasEmployeeId,
}: EmployeeMobileDashboardProps) {
  const router = useRouter()
  const firstName = userName?.split(" ")[0] || "there"

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  })()

  return (
    <div className="md:hidden space-y-4 min-w-0">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-gray-900 truncate">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full shrink-0",
                    isPunchedIn ? "bg-green-500" : "bg-gray-300"
                  )}
                />
                <p className="font-medium text-gray-900 truncate">
                  {isOnBreak ? "On break" : isPunchedIn ? "On the clock" : "Not checked in"}
                </p>
              </div>
              {isPunchedIn && punchInTime && (
                <p className="text-xs text-muted-foreground mt-1 truncate">Since {punchInTime}</p>
              )}
            </div>
            <p className="text-lg font-bold text-green-700 shrink-0">{hoursLabel}</p>
          </div>

          {!isPunchedIn ? (
            <Button
              className="w-full h-12 text-base bg-green-600 hover:bg-green-700"
              disabled={punchLoading || !hasEmployeeId}
              onClick={onPunchIn}
            >
              <LogIn className="h-5 w-5 mr-2" />
              {punchLoading ? "Checking in…" : "Check in"}
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-11"
                disabled={punchLoading}
                onClick={onBreakToggle}
              >
                <Coffee className="h-4 w-4 mr-1.5" />
                {isOnBreak ? "End break" : "Break"}
              </Button>
              <Button
                className="h-11 bg-red-600 hover:bg-red-700"
                disabled={punchLoading || isOnBreak}
                onClick={onPunchOut}
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Check out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          className="h-auto flex-col gap-1.5 py-3 px-1 min-w-0"
          onClick={() => router.push("/attendance?tab=leave-requests&apply=leave")}
        >
          <CalendarPlus className="h-5 w-5 shrink-0" />
          <span className="text-[11px] leading-tight">Apply leave</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-1.5 py-3 px-1 min-w-0"
          onClick={() => router.push("/chat")}
        >
          <MessageSquare className="h-5 w-5 shrink-0" />
          <span className="text-[11px] leading-tight">Chat</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-1.5 py-3 px-1 min-w-0"
          onClick={() => router.push("/helpdesk")}
        >
          <LifeBuoy className="h-5 w-5 shrink-0" />
          <span className="text-[11px] leading-tight">Help</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-1.5 py-3 px-1 min-w-0"
          onClick={() => router.push("/notifications")}
        >
          <Bell className="h-5 w-5 shrink-0" />
          <span className="text-[11px] leading-tight">Alerts</span>
        </Button>
      </div>
    </div>
  )
}
