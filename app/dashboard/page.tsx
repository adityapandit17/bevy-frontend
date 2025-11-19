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
  id?: number
  employee_id: number
  date: string
  check_in: string | null
  check_out: string | null
  formatted_check_in: string | null
  formatted_check_out: string | null
  status: string
  working_hours: number | null
  total_hours_today?: number
  total_sessions_today?: number
  sessions?: TodayAttendance[]
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
  const [totalHoursToday, setTotalHoursToday] = useState<number>(0)
  const [dashboardStats, setDashboardStats] = useState({
    total_employees: 0,
    present_today: 0,
    on_leave: 0,
    monthly_payroll: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [upcomingEvents, setUpcomingEvents] = useState<Array<{
    id: number
    title: string
    date: string
    time: string
    attendees: number
  }>>([])
  const [eventsLoading, setEventsLoading] = useState(true)

  const formatPayroll = (amount: number): string => {
    if (amount === 0) return "₹0"
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }
  
  const stats = [
    {
      title: "Total Employees",
      value: dashboardStats.total_employees.toString(),
      change: "",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Present Today",
      value: dashboardStats.present_today.toString(),
      change: dashboardStats.total_employees > 0 
        ? `${((dashboardStats.present_today / dashboardStats.total_employees) * 100).toFixed(1)}% attendance`
        : "0% attendance",
      trend: "up",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "On Leave",
      value: dashboardStats.on_leave.toString(),
      change: dashboardStats.total_employees > 0
        ? `${((dashboardStats.on_leave / dashboardStats.total_employees) * 100).toFixed(1)}% on leave`
        : "0% on leave",
      trend: "down",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Monthly Payroll",
      value: formatPayroll(dashboardStats.monthly_payroll),
      change: "",
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
      const data = await apiRequest<TodayAttendance & {
        total_hours_today?: number
        total_sessions_today?: number
        sessions?: TodayAttendance[]
      }>(
        getApiUrl(`attendance_records/today?employee_id=${user.employee_id}`)
      )
      
      // If we have sessions data, sync with local storage
      if (data.sessions && Array.isArray(data.sessions)) {
        const sessions: AttendanceSession[] = data.sessions
          .filter(s => s.check_in)
          .map(s => ({
            id: `session_${s.id}`,
            punchIn: s.check_in!,
            punchOut: s.check_out || null,
            workingHours: s.working_hours || 0
          }))
        
        // Find active session (no check_out)
        const activeSession = sessions.find(s => !s.punchOut)
        if (activeSession) {
          setCurrentPunchIn(activeSession.punchIn)
        }
        
        setAttendanceSessions(sessions)
        saveSessionsToStorage(sessions)
      }
      
      // Set today's attendance to the active one or first session
      if (data.check_in) {
        setTodayAttendance(data)
      } else if (data.sessions && data.sessions.length > 0) {
        setTodayAttendance(data.sessions[data.sessions.length - 1])
      }
      
      // Update total hours from backend if available
      if (data.total_hours_today !== undefined && data.total_hours_today !== null) {
        // Ensure it's a valid number and within reasonable range (0-24 hours)
        const hours = typeof data.total_hours_today === 'number' 
          ? data.total_hours_today 
          : parseFloat(String(data.total_hours_today)) || 0
        // Sanity check: hours should be between 0 and 24
        if (hours >= 0 && hours <= 24) {
          setTotalHoursToday(hours)
        } else {
          // If invalid, calculate from sessions
          console.warn("Invalid total_hours_today from backend:", hours, "Calculating from sessions")
          if (data.sessions && Array.isArray(data.sessions)) {
            const calculatedTotal = data.sessions.reduce((sum: number, session: any) => {
              if (session.check_in && session.check_out) {
                const start = new Date(session.check_in)
                const end = new Date(session.check_out)
                const sessionHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                return sum + (sessionHours > 0 && sessionHours < 24 ? sessionHours : 0)
              }
              const storedHours = session.working_hours || 0
              return sum + (storedHours > 0 && storedHours < 24 ? storedHours : 0)
            }, 0)
            setTotalHoursToday(calculatedTotal)
          } else {
            setTotalHoursToday(0)
          }
        }
      } else {
        // Calculate from sessions if backend doesn't provide it
        if (data.sessions && Array.isArray(data.sessions)) {
          const calculatedTotal = data.sessions.reduce((sum: number, session: any) => {
            if (session.check_in && session.check_out) {
              const start = new Date(session.check_in)
              const end = new Date(session.check_out)
              const sessionHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
              return sum + (sessionHours > 0 && sessionHours < 24 ? sessionHours : 0)
            }
            const storedHours = session.working_hours || 0
            return sum + (storedHours > 0 && storedHours < 24 ? storedHours : 0)
          }, 0)
          setTotalHoursToday(calculatedTotal)
        }
      }
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
    // Ensure hours is a valid number
    if (!hours || isNaN(hours) || hours < 0) {
      return "00:00:00"
    }
    
    // Convert hours to total seconds
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

  const fetchDashboardStats = async () => {
    setStatsLoading(true)
    try {
      const data = await apiRequest<{
        stats: {
          total_employees: number
          present_today: number
          on_leave: number
          monthly_payroll: number
        }
      }>(getApiUrl('dashboard'), {
        method: "GET"
      })
      if (data.stats) {
        setDashboardStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
      // Set default values on error
      setDashboardStats({
        total_employees: 0,
        present_today: 0,
        on_leave: 0,
        monthly_payroll: 0
      })
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
    fetchUpcomingEvents()
  }, [])

  const fetchUpcomingEvents = async () => {
    setEventsLoading(true)
    try {
      interface EventData {
        id: number
        title: string
        start_time: string
        end_time: string
        attendee_ids_list: number[]
      }
      const data = await apiRequest<EventData[]>(`${getApiUrl('events')}?upcoming=true&limit=3`, {
        method: "GET"
      })
      
      const formattedEvents = Array.isArray(data) ? data.slice(0, 3).map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.start_time).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
        time: new Date(event.start_time).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        }),
        attendees: event.attendee_ids_list?.length || 0
      })) : []
      
      setUpcomingEvents(formattedEvents)
    } catch (error) {
      console.error("Failed to fetch upcoming events:", error)
      setUpcomingEvents([])
    } finally {
      setEventsLoading(false)
    }
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
      
      // Always create a new attendance record for check-in
      const attendanceRecord = await apiRequest<TodayAttendance>(
        getApiUrl(`attendance_records/check_in`),
        {
          method: 'POST',
          body: JSON.stringify({
            employee_id: user.employee_id
          })
        }
      )

      const newSession: AttendanceSession = {
        id: `session_${attendanceRecord.id || Date.now()}`,
        punchIn: attendanceRecord.check_in || now,
        punchOut: null,
        workingHours: 0
      }
      
      const updatedSessions = [...attendanceSessions, newSession]
      setAttendanceSessions(updatedSessions)
      setCurrentPunchIn(now)
      saveSessionsToStorage(updatedSessions)
      await fetchTodayAttendance()
    } catch (error) {
      console.error("Failed to punch in:", error)
      alert("Failed to punch in. Please try again.")
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

      // Update backend - find the attendance record using session ID
      try {
        // Find the current session to get the record ID
        const currentSession = attendanceSessions.find(s => s.punchIn === currentPunchIn && !s.punchOut)
        
        if (currentSession && currentSession.id) {
          // Extract record ID from session ID (format: session_123)
          const recordId = currentSession.id.replace('session_', '')
          
          if (recordId && !isNaN(Number(recordId))) {
            // Update the specific record with check_out
            await apiRequest<TodayAttendance>(
              getApiUrl(`attendance_records/${recordId}/check_out`),
              { method: 'PATCH' }
            )
          } else {
            // Fallback: use today endpoint to find the active session
            const todayData = await apiRequest<TodayAttendance>(
              getApiUrl(`attendance_records/today?employee_id=${user.employee_id}`)
            )
            
            // Find the record that matches current punch in time
            if (todayData.sessions && Array.isArray(todayData.sessions)) {
              const punchInTime = new Date(currentPunchIn).getTime()
              const matchingRecord = todayData.sessions.find((record: any) => {
                if (!record.check_in || record.check_out) return false
                const recordTime = new Date(record.check_in).getTime()
                const diff = Math.abs(punchInTime - recordTime)
                return diff < 60000 // Within 1 minute
              })

              if (matchingRecord && matchingRecord.id) {
                await apiRequest<TodayAttendance>(
                  getApiUrl(`attendance_records/${matchingRecord.id}/check_out`),
                  { method: 'PATCH' }
                )
              }
            }
          }
        }
        await fetchTodayAttendance()
      } catch (backendError: any) {
        console.error("Failed to update backend:", backendError)
        alert(backendError?.error || "Failed to update attendance record. Please try again.")
      }
    } catch (error) {
      console.error("Failed to punch out:", error)
      alert("Failed to punch out. Please try again.")
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
      
      // Update backend - find the attendance record using session ID
      try {
        // Find the current session to get the record ID
        const currentSession = attendanceSessions.find(s => s.punchIn === currentPunchIn && !s.punchOut)
        
        if (currentSession && currentSession.id) {
          // Extract record ID from session ID (format: session_123)
          const recordId = currentSession.id.replace('session_', '')
          
          if (recordId && !isNaN(Number(recordId))) {
            // Update the specific record with check_out
            await apiRequest<TodayAttendance>(
              getApiUrl(`attendance_records/${recordId}/check_out`),
              { method: 'PATCH' }
            )
          } else {
            // Fallback: use today endpoint to find the active session
            const todayData = await apiRequest<TodayAttendance>(
              getApiUrl(`attendance_records/today?employee_id=${user.employee_id}`)
            )
            
            // Find the record that matches current punch in time
            if (todayData.sessions && Array.isArray(todayData.sessions)) {
              const punchInTime = new Date(currentPunchIn).getTime()
              const matchingRecord = todayData.sessions.find((record: any) => {
                if (!record.check_in || record.check_out) return false
                const recordTime = new Date(record.check_in).getTime()
                const diff = Math.abs(punchInTime - recordTime)
                return diff < 60000 // Within 1 minute
              })

              if (matchingRecord && matchingRecord.id) {
                await apiRequest<TodayAttendance>(
                  getApiUrl(`attendance_records/${matchingRecord.id}/check_out`),
                  { method: 'PATCH' }
                )
              }
            }
          }
        }
        await fetchTodayAttendance()
      } catch (backendError: any) {
        console.error("Failed to update backend:", backendError)
        alert(backendError?.error || "Failed to update attendance record. Please try again.")
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
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    {stat.change && (
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
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>Scheduled events and meetings</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/events')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[150px] overflow-y-auto pr-2">
                {eventsLoading ? (
                  <div className="text-center py-4 text-gray-500 text-sm">Loading events...</div>
                ) : upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer" onClick={() => router.push('/events')}>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {event.date} at {event.time}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{event.attendees} attendee{event.attendees !== 1 ? 's' : ''}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No upcoming events
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push('/events')}
                    >
                      Create your first event
                    </Button>
                  </div>
                )}
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
                      <label className="text-xs font-medium text-gray-500 uppercase">Total Working Hours Today</label>
                      <p className="text-lg font-semibold text-green-600 mt-1">
                        {(() => {
                          // Use backend total if valid, otherwise calculate from sessions
                          let hoursToDisplay = 0
                          if (totalHoursToday > 0 && totalHoursToday <= 24) {
                            hoursToDisplay = totalHoursToday
                          } else {
                            hoursToDisplay = calculateTotalWorkingHours()
                          }
                          // Ensure it's a valid number
                          if (isNaN(hoursToDisplay) || hoursToDisplay < 0 || hoursToDisplay > 24) {
                            hoursToDisplay = 0
                          }
                          return formatDuration(hoursToDisplay)
                        })()}
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
