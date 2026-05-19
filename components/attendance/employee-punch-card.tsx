"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, LogIn, LogOut, RefreshCw } from "lucide-react"
import { apiRequest, getApiUrl, getEndpointUrl } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface EmployeePunchCardProps {
  employeeId: number
  onPunchChange?: () => void
}

export function EmployeePunchCard({ employeeId, onPunchChange }: EmployeePunchCardProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [currentPunchIn, setCurrentPunchIn] = useState<string | null>(null)
  const [totalHoursToday, setTotalHoursToday] = useState(0)

  const loadToday = useCallback(async () => {
    if (!employeeId) return
    setFetching(true)
    try {
      const data = await apiRequest<{
        check_in: string | null
        total_hours_today?: number
        sessions?: Array<{ check_in: string; check_out: string | null }>
      }>(`${getEndpointUrl("ATTENDANCE_TODAY")}?employee_id=${employeeId}`, { suppressToast: true })

      const active = data.sessions?.find((s) => s.check_in && !s.check_out)
      setCurrentPunchIn(active?.check_in || data.check_in || null)
      setTotalHoursToday(data.total_hours_today ?? 0)
    } catch {
      setCurrentPunchIn(null)
      setTotalHoursToday(0)
    } finally {
      setFetching(false)
    }
  }, [employeeId])

  useEffect(() => {
    loadToday()
  }, [loadToday])

  const handlePunchIn = async () => {
    setLoading(true)
    try {
      await apiRequest(
        getApiUrl(`employees/${employeeId}/attendance_records/clock_in`),
        { method: "POST" }
      )
      toast({ title: "Checked in", description: "Your punch-in was recorded." })
      await loadToday()
      onPunchChange?.()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to check in"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handlePunchOut = async () => {
    setLoading(true)
    try {
      await apiRequest(
        getApiUrl(`employees/${employeeId}/attendance_records/clock_out`),
        { method: "POST" }
      )
      toast({ title: "Checked out", description: "Your punch-out was recorded." })
      await loadToday()
      onPunchChange?.()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to check out"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (iso: string | null) => {
    if (!iso) return "—"
    try {
      return new Date(iso).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return iso
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Today&apos;s attendance
        </CardTitle>
        <CardDescription>Check in and check out for your shift today</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            Status:{" "}
            <span className="font-medium text-foreground">
              {fetching ? "Loading…" : currentPunchIn ? "On the clock" : "Not checked in"}
            </span>
          </p>
          {currentPunchIn && (
            <p>
              Since: <span className="font-medium text-foreground">{formatTime(currentPunchIn)}</span>
            </p>
          )}
          <p>
            Hours today:{" "}
            <span className="font-medium text-foreground">{totalHoursToday.toFixed(2)}h</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={loadToday} disabled={loading || fetching}>
            <RefreshCw className={`h-4 w-4 mr-1 ${fetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {!currentPunchIn ? (
            <Button onClick={handlePunchIn} disabled={loading || fetching}>
              <LogIn className="h-4 w-4 mr-2" />
              Check in
            </Button>
          ) : (
            <Button onClick={handlePunchOut} disabled={loading || fetching} variant="destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Check out
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
