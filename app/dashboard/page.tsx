"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/lib/auth"
import {
  Users,
  UserCheck,
  Clock,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  Calendar,
  FileText,
  Plus,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Network,
  Upload,
  GraduationCap,
  HelpCircle,
  LogIn,
  LogOut,
  Coffee,
} from "lucide-react"
import { getApiUrl } from "@/lib/api"
import { apiRequest } from "@/lib/api"

interface TodayAttendance {
  id: number
  employee_id: number
  date: string
  check_in: string | null
  check_out: string | null
  formatted_check_in: string | null
  formatted_check_out: string | null
  status: string
  working_hours: number | null
}

interface AttendanceSession {
  id: string
  punchIn: string
  punchOut: string | null
  workingHours: number
}

export default function Dashboard() {
  const router = useRouter()
  const { checkPermission, checkRole, user } = useAuthContext()
  
  // Attendance state
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null)
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([])
  const [currentPunchIn, setCurrentPunchIn] = useState<string | null>(null)
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null)
  const [breakEndTime, setBreakEndTime] = useState<string | null>(null)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [punchLoading, setPunchLoading] = useState(false)
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false)
  const stats = [
    {
      title: "Total Employees",
      value: "248",
      change: "+12 this month",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Present Today",
      value: "231",
      change: "93.1% attendance",
      trend: "up",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "On Leave",
      value: "17",
      change: "6.9% on leave",
      trend: "down",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Monthly Payroll",
      value: "₹45.2L",
      change: "+8.2% from last month",
      trend: "up",
      icon: IndianRupee,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: "New Employee",
      description: "Priya Sharma joined as Software Developer",
      time: "2 hours ago",
      status: "success",
    },
    {
      id: 2,
      type: "Leave Request",
      description: "Rahul Kumar requested 3 days leave",
      time: "4 hours ago",
      status: "pending",
    },
    {
      id: 3,
      type: "Payroll",
      description: "October payroll processed successfully",
      time: "1 day ago",
      status: "success",
    },
    {
      id: 4,
      type: "Interview",
      description: "Interview scheduled with Anjali Patel",
      time: "2 days ago",
      status: "info",
    },
    {
      id: 5,
      type: "Performance Review",
      description: "Q3 reviews completed for Engineering team",
      time: "3 days ago",
      status: "success",
    },
  ]

  const pendingTasks = [
    {
      id: 1,
      title: "Review Leave Applications",
      count: 5,
      priority: "high",
      dueDate: "Today",
    },
    {
      id: 2,
      title: "Approve Expense Reports",
      count: 12,
      priority: "medium",
      dueDate: "Tomorrow",
    },
    {
      id: 3,
      title: "Update Employee Records",
      count: 8,
      priority: "low",
      dueDate: "This Week",
    },
    {
      id: 4,
      title: "Process Salary Increments",
      count: 3,
      priority: "high",
      dueDate: "End of Week",
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: "Team Building Event",
      date: "Nov 15, 2024",
      time: "10:00 AM",
      attendees: 45,
    },
    {
      id: 2,
      title: "Performance Review Meeting",
      date: "Nov 18, 2024",
      time: "2:00 PM",
      attendees: 12,
    },
    {
      id: 3,
      title: "New Employee Orientation",
      date: "Nov 20, 2024",
      time: "9:00 AM",
      attendees: 8,
    },
  ]

  // Load sessions from localStorage on mount and check for new day
  useEffect(() => {
    if (user?.employee_id) {
      const today = new Date().toISOString().split('T')[0]
      const storageKey = `attendance_sessions_${user.employee_id}_${today}`
      const lastDateKey = `last_attendance_date_${user.employee_id}`
      
      // Check if it's a new day
      const lastDate = localStorage.getItem(lastDateKey)
      if (lastDate && lastDate !== today) {
        // New day - clear old sessions
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`attendance_sessions_${user.employee_id}_`)) {
            localStorage.removeItem(key)
          }
        })
        // Reset state
        setAttendanceSessions([])
        setCurrentPunchIn(null)
        setBreakStartTime(null)
        setBreakEndTime(null)
        setIsOnBreak(false)
      }
      
      // Save current date
      localStorage.setItem(lastDateKey, today)
      
      // Load today's sessions
      const savedSessions = localStorage.getItem(storageKey)
      if (savedSessions) {
        try {
          const sessions = JSON.parse(savedSessions)
          setAttendanceSessions(sessions)
          // Check if there's an active punch in (no punch out)
          const activeSession = sessions.find((s: AttendanceSession) => !s.punchOut)
          if (activeSession) {
            setCurrentPunchIn(activeSession.punchIn)
          }
        } catch (error) {
          console.error("Failed to load saved sessions:", error)
        }
      }
      
      fetchTodayAttendance()
    }
  }, [user])

  // Check for new day periodically (every minute)
  useEffect(() => {
    if (!user?.employee_id) return

    const checkNewDay = () => {
      const today = new Date().toISOString().split('T')[0]
      const lastDateKey = `last_attendance_date_${user.employee_id}`
      const lastDate = localStorage.getItem(lastDateKey)
      
      if (lastDate && lastDate !== today) {
        // New day detected - reset everything
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`attendance_sessions_${user.employee_id}_`)) {
            localStorage.removeItem(key)
          }
        })
        
        // Reset state
        setAttendanceSessions([])
        setCurrentPunchIn(null)
        setBreakStartTime(null)
        setBreakEndTime(null)
        setIsOnBreak(false)
        
        // Update last date
        localStorage.setItem(lastDateKey, today)
      }
    }

    // Check immediately
    checkNewDay()
    
    // Check every minute
    const interval = setInterval(checkNewDay, 60000)
    
    return () => clearInterval(interval)
  }, [user])

  // Update active session hours in real-time (every second for seconds display)
  useEffect(() => {
    if (!currentPunchIn) return

    const interval = setInterval(() => {
      setAttendanceSessions(prevSessions => {
        const updated = prevSessions.map(session => {
          if (session.punchIn === currentPunchIn && !session.punchOut) {
            return {
              ...session,
              workingHours: calculateSessionHours(session.punchIn, null)
            }
          }
          return session
        })
        saveSessionsToStorage(updated)
        return updated
      })
    }, 1000) // Update every second for real-time seconds display

    return () => clearInterval(interval)
  }, [currentPunchIn, user])

  const fetchTodayAttendance = async () => {
    if (!user?.employee_id) return
    
    try {
      const data = await apiRequest<TodayAttendance>(
        getApiUrl(`attendance_records/today?employee_id=${user.employee_id}`)
      )
      setTodayAttendance(data)
    } catch (error) {
      console.error("Failed to fetch today's attendance:", error)
    }
  }

  const saveSessionsToStorage = (sessions: AttendanceSession[]) => {
    if (!user?.employee_id) return
    const today = new Date().toISOString().split('T')[0]
    const storageKey = `attendance_sessions_${user.employee_id}_${today}`
    localStorage.setItem(storageKey, JSON.stringify(sessions))
  }

  const calculateSessionHours = (punchIn: string, punchOut: string | null): number => {
    if (!punchOut) {
      const now = new Date()
      const start = new Date(punchIn)
      return ((now.getTime() - start.getTime()) / (1000 * 60 * 60))
    }
    const start = new Date(punchIn)
    const end = new Date(punchOut)
    return ((end.getTime() - start.getTime()) / (1000 * 60 * 60))
  }

  const calculateTotalWorkingHours = (): number => {
    return attendanceSessions.reduce((total, session) => {
      if (session.punchOut) {
        // For completed sessions, use stored workingHours
        return total + session.workingHours
      }
      // For active session, calculate current hours
      return total + calculateSessionHours(session.punchIn, null)
    }, 0)
  }

  const formatDuration = (hours: number): string => {
    const totalSeconds = Math.floor(hours * 3600)
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    // Format as hh:mm:ss with leading zeros
    const formattedHrs = String(hrs).padStart(2, '0')
    const formattedMins = String(mins).padStart(2, '0')
    const formattedSecs = String(secs).padStart(2, '0')
    
    return `${formattedHrs}:${formattedMins}:${formattedSecs}`
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: true 
      })
    } catch {
      return timeString
    }
  }

  const handlePunchIn = async () => {
    if (!user?.employee_id || currentPunchIn) return
    
    setPunchLoading(true)
    try {
      const now = new Date().toISOString()
      const newSession: AttendanceSession = {
        id: `session_${Date.now()}`,
        punchIn: now,
        punchOut: null,
        workingHours: 0
      }
      
      const updatedSessions = [...attendanceSessions, newSession]
      const isFirstSession = attendanceSessions.length === 0
      
      setAttendanceSessions(updatedSessions)
      setCurrentPunchIn(now)
      saveSessionsToStorage(updatedSessions)

      // Only update backend for the first session
      if (isFirstSession) {
        try {
          const currentAttendance = await apiRequest<TodayAttendance>(
            getApiUrl(`attendance_records/today?employee_id=${user.employee_id}`)
          )
          
          if (currentAttendance && !currentAttendance.check_in) {
            await apiRequest<TodayAttendance>(
              getApiUrl(`attendance_records/${currentAttendance.id}/check_in`),
              { method: 'PATCH' }
            )
            await fetchTodayAttendance()
          }
        } catch (backendError) {
          console.log("Backend update skipped (multiple sessions not supported by backend)")
        }
      }
    } catch (error) {
      console.error("Failed to punch in:", error)
    } finally {
      setPunchLoading(false)
    }
  }

  const handlePunchOut = async () => {
    if (!currentPunchIn || !user?.employee_id) return
    
    setPunchLoading(true)
    try {
      const now = new Date().toISOString()
      const currentSessionIndex = attendanceSessions.findIndex(s => s.punchIn === currentPunchIn && !s.punchOut)
      const isFirstSession = currentSessionIndex === 0
      
      const updatedSessions = attendanceSessions.map(session => {
        if (session.punchIn === currentPunchIn && !session.punchOut) {
          const hours = calculateSessionHours(session.punchIn, now)
          return {
            ...session,
            punchOut: now,
            workingHours: hours
          }
        }
        return session
      })
      
      setAttendanceSessions(updatedSessions)
      setCurrentPunchIn(null)
      saveSessionsToStorage(updatedSessions)

      // End break if on break
      if (isOnBreak) {
        handleBreakEnd()
      }

      // Only update backend for the first session
      if (isFirstSession) {
        try {
          const currentAttendance = await apiRequest<TodayAttendance>(
            getApiUrl(`attendance_records/today?employee_id=${user.employee_id}`)
          )
          
          if (currentAttendance && !currentAttendance.check_out) {
            await apiRequest<TodayAttendance>(
              getApiUrl(`attendance_records/${currentAttendance.id}/check_out`),
              { method: 'PATCH' }
            )
            await fetchTodayAttendance()
          }
        } catch (backendError) {
          console.log("Backend update skipped (multiple sessions not supported by backend)")
        }
      }
    } catch (error) {
      console.error("Failed to punch out:", error)
    } finally {
      setPunchLoading(false)
    }
  }

  const handleBreakStart = async () => {
    if (!currentPunchIn || !user?.employee_id) return
    
    const now = new Date().toISOString()
    
    // Automatically punch out the current session when break starts
    setPunchLoading(true)
    try {
      const updatedSessions = attendanceSessions.map(session => {
        if (session.punchIn === currentPunchIn && !session.punchOut) {
          const hours = calculateSessionHours(session.punchIn, now)
          return {
            ...session,
            punchOut: now,
            workingHours: hours
          }
        }
        return session
      })
      
      setAttendanceSessions(updatedSessions)
      setCurrentPunchIn(null)
      saveSessionsToStorage(updatedSessions)
      
      // Update backend if it's the first session
      const currentSessionIndex = attendanceSessions.findIndex(s => s.punchIn === currentPunchIn && !s.punchOut)
      const isFirstSession = currentSessionIndex === 0
      
      if (isFirstSession) {
        try {
          const currentAttendance = await apiRequest<TodayAttendance>(
            getApiUrl(`attendance_records/today?employee_id=${user.employee_id}`)
          )
          
          if (currentAttendance && !currentAttendance.check_out) {
            await apiRequest<TodayAttendance>(
              getApiUrl(`attendance_records/${currentAttendance.id}/check_out`),
              { method: 'PATCH' }
            )
            await fetchTodayAttendance()
          }
        } catch (backendError) {
          console.log("Backend update skipped (multiple sessions not supported by backend)")
        }
      }
      
      // Now start the break
      setBreakStartTime(now)
      setIsOnBreak(true)
    } catch (error) {
      console.error("Failed to start break:", error)
    } finally {
      setPunchLoading(false)
    }
  }

  const handleBreakEnd = () => {
    const now = new Date()
    setBreakEndTime(now.toISOString())
    setIsOnBreak(false)
    // Reset break times after a short delay to allow UI to show the break summary
    setTimeout(() => {
      setBreakStartTime(null)
      setBreakEndTime(null)
    }, 5000) // Reset after 5 seconds
  }

  const calculateBreakDuration = () => {
    if (!breakStartTime) return null
    const start = new Date(breakStartTime)
    const end = breakEndTime ? new Date(breakEndTime) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening at your company.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <p className={`text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Recent Activities */}
        <Card className="w-full lg:w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest updates from your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === "success"
                        ? "bg-green-500"
                        : activity.status === "pending"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Upcoming Events and Attendance */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Scheduled events and meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[150px] overflow-y-auto pr-2">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg border hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {event.date} at {event.time}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{event.attendees} attendees</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Punch In/Out */}
          {user?.employee_id && (
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Attendance
                    </CardTitle>
                    <CardDescription>
                      Punch in, punch out, and track your break time
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {/* Today's Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Current Status</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {currentPunchIn ? "Punched In" : "Not Punched In"}
                      </p>
                      {currentPunchIn && (
                        <p className="text-sm text-gray-600 mt-1">
                          Since: {formatTime(currentPunchIn)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Total Working Hours</label>
                      <p className="text-lg font-semibold text-green-600 mt-1">
                        {formatDuration(calculateTotalWorkingHours())}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {attendanceSessions.length} session{attendanceSessions.length !== 1 ? 's' : ''}
                        </p>
                        {attendanceSessions.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSessionsModalOpen(true)}
                            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Break Status */}
                  {isOnBreak && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-900">On Break</p>
                          <p className="text-xs text-orange-700 mt-1">
                            Started: {formatTime(breakStartTime || null)}
                          </p>
                          {breakStartTime && (
                            <p className="text-xs text-orange-600 mt-1">
                              Duration: {calculateBreakDuration()}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleBreakEnd}
                          className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                          <Coffee className="w-4 h-4 mr-2" />
                          End Break
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {!currentPunchIn ? (
                      <Button
                        onClick={handlePunchIn}
                        disabled={punchLoading || !user?.employee_id}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <LogIn className="w-5 h-5 mr-2" />
                        {punchLoading ? "Processing..." : "Punch In"}
                      </Button>
                    ) : (
                      <Button
                        disabled
                        variant="outline"
                        className="w-full border-green-300 text-green-700"
                        size="lg"
                      >
                        <LogIn className="w-5 h-5 mr-2" />
                        Punched In
                      </Button>
                    )}

                    {!isOnBreak ? (
                      <Button
                        onClick={handleBreakStart}
                        disabled={!currentPunchIn || punchLoading}
                        variant="outline"
                        className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                        size="lg"
                      >
                        <Coffee className="w-5 h-5 mr-2" />
                        {punchLoading ? "Processing..." : "Start Break"}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleBreakEnd}
                        variant="outline"
                        className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                        size="lg"
                      >
                        <Coffee className="w-5 h-5 mr-2" />
                        End Break
                      </Button>
                    )}

                    {currentPunchIn && !isOnBreak ? (
                      <Button
                        onClick={handlePunchOut}
                        disabled={punchLoading}
                        className="w-full bg-red-600 hover:bg-red-700"
                        size="lg"
                      >
                        <LogOut className="w-5 h-5 mr-2" />
                        {punchLoading ? "Processing..." : "Punch Out"}
                      </Button>
                    ) : (
                      <Button
                        disabled
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        <LogOut className="w-5 h-5 mr-2" />
                        Punch Out
                      </Button>
                    )}
                  </div>

                  {/* Break History */}
                  {breakStartTime && breakEndTime && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Break Summary</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          {formatTime(breakStartTime)} - {formatTime(breakEndTime)}
                        </span>
                        <span className="text-gray-600 font-medium">
                          {calculateBreakDuration()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sessions Modal */}
      <Dialog open={sessionsModalOpen} onOpenChange={setSessionsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Today's Sessions</DialogTitle>
            <DialogDescription>
              View all your attendance sessions for today
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {attendanceSessions.length > 0 ? (
              attendanceSessions.map((session, index) => (
                <div key={session.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Session {index + 1}</span>
                        {!session.punchOut && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">In:</span> 
                          <span>{formatTime(session.punchIn)}</span>
                        </div>
                        {session.punchOut && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-medium">Out:</span> 
                            <span>{formatTime(session.punchOut)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDuration(session.punchOut 
                          ? session.workingHours 
                          : calculateSessionHours(session.punchIn, null))}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Duration</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No sessions recorded for today</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {task.count}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Due: {task.dueDate}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions for faster workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {checkPermission("employees:create") && (
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 bg-transparent"
                  onClick={() => router.push('/employees')}
                >
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Add Employee</span>
                </Button>
              )}
              {checkPermission("attendance_records:create") && (
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 bg-transparent"
                  onClick={() => router.push('/attendance-leave')}
                >
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm">Mark Attendance</span>
                </Button>
              )}
              {(checkPermission("payrolls:index") || checkPermission("payrolls:create")) && (
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 bg-transparent"
                  onClick={() => router.push('/payroll')}
                >
                  <IndianRupee className="w-6 h-6" />
                  <span className="text-sm">Process Payroll</span>
                </Button>
              )}
              {checkPermission("reports:index") && (
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 bg-transparent"
                  onClick={() => router.push('/reports')}
                >
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">Generate Report</span>
                </Button>
              )}
              {checkPermission("assets:index") && (
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 bg-transparent"
                  onClick={() => router.push('/assets')}
                >
                  <Package className="w-6 h-6" />
                  <span className="text-sm">Asset Tracking</span>
                </Button>
              )}
              {checkPermission("employees:index") && (
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 bg-transparent"
                  onClick={() => router.push('/org-chart')}
                >
                  <Network className="w-6 h-6" />
                  <span className="text-sm">Org Chart</span>
                </Button>
              )}
              {(checkPermission("employees:index") || checkPermission("employee_documents:index")) && (
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 bg-transparent"
                  onClick={() => router.push('/documents')}
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">Documents</span>
                </Button>
              )}
              {checkRole("Super Admin") && (
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 bg-transparent"
                  onClick={() => router.push('/learning')}
                >
                  <GraduationCap className="w-6 h-6" />
                  <span className="text-sm">Learning</span>
                </Button>
              )}
              {checkRole("Super Admin") && (
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 bg-transparent"
                  onClick={() => router.push('/helpdesk')}
                >
                  <HelpCircle className="w-6 h-6" />
                  <span className="text-sm">Helpdesk</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
