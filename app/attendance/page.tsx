"use client"

import React, { useState, useEffect } from "react"
import { getApiUrl, getEndpointUrl, API_ENDPOINTS } from "@/lib/api"
import { mapLeaveRequestToBackend } from "@/lib/leave-request-mapper"
import { useAuth } from "@/lib/auth/auth.hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Plus,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  User,
  Building,
  TrendingUp,
  TrendingDown,
  Clock3,
  CalendarDays,
  Users,
  CheckSquare,
  XSquare,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { LeaveRequestForm } from "@/components/forms/leave-request-form"
import { AttendanceMarking } from "@/components/attendance/attendance-marking"
import { LeaveRequestManagement } from "@/components/leave/leave-request-management"
import { LeaveRequestDetails } from "@/components/leave/leave-request-details"

// Types
interface AttendanceRecord {
  id: number
  employee_id: number
  employee_name: string
  employee_email: string
  employee_department: string
  date: string
  check_in: string | null
  check_out: string | null
  formatted_check_in: string | null
  formatted_check_out: string | null
  status: string
  status_label: string
  status_color: string
  working_hours: number
  overtime_hours: number
  is_late: boolean
  created_at: string
  updated_at: string
}

interface LeaveRequest {
  id: number
  employee_id: number
  employee_name: string
  employee_email: string
  employee_department: string
  leave_type: string
  leave_type_label: string
  start_date: string
  end_date: string
  formatted_start_date: string
  formatted_end_date: string
  days: number
  reason: string
  status: string
  status_label: string
  status_color: string
  is_current: boolean
  is_upcoming: boolean
  is_past: boolean
  can_be_cancelled: boolean
  can_be_modified: boolean
  created_at: string
  updated_at: string
}

interface AttendanceStats {
  total_days: number
  present_days: number
  absent_days: number
  late_days: number
  half_days: number
  work_from_home_days: number
  total_working_hours: number
  average_working_hours: number
  attendance_percentage: number
}

interface LeaveBalance {
  leave_type: string
  leave_type_label: string
  total: number
  used: number
  remaining: number
}

export default function AttendancePage() {
  const { user, isAuthenticated } = useAuth()
  
  // State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [activeTab, setActiveTab] = useState("attendance")
  
  // Data
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null)
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([])
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null)
  
  // UI State
  const [loading, setLoading] = useState(false)
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<any>(null)
  const [showLeaveDetails, setShowLeaveDetails] = useState(false)
  
  // Error States
  const [leaveError, setLeaveError] = useState<string | null>(null)
  const [attendanceError, setAttendanceError] = useState<string | null>(null)

  // Load data on component mount
  useEffect(() => {
    fetchAttendanceRecords()
    fetchLeaveRequests()
    fetchEmployees()
    fetchDepartments()
    fetchAttendanceStats()
    fetchLeaveBalance()
    fetchTodayAttendance()
  }, [])

  // Fetch functions
  const fetchAttendanceRecords = async () => {
    setLoading(true)
    try {
      const response = await fetch(getEndpointUrl('ATTENDANCE_RECORDS'))
      if (response.ok) {
        const data = await response.json()
        setAttendanceRecords(data)
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch(getEndpointUrl('LEAVE_REQUESTS'))
      if (response.ok) {
        const data = await response.json()
        setLeaveRequests(data)
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch(getEndpointUrl('EMPLOYEES'))
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch(getEndpointUrl('DEPARTMENTS'))
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchAttendanceStats = async () => {
    try {
      const response = await fetch(getApiUrl('/attendance_records/stats'))
      if (response.ok) {
        const data = await response.json()
        setAttendanceStats(data)
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error)
    }
  }

  const fetchLeaveBalance = async () => {
    try {
      const response = await fetch(getApiUrl('/leave_requests/balance'))
      if (response.ok) {
        const data = await response.json()
        setLeaveBalance(data)
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error)
    }
  }

  const fetchTodayAttendance = async () => {
    try {
      const response = await fetch(getApiUrl('/attendance_records/today'))
      if (response.ok) {
        const data = await response.json()
        setTodayAttendance(data)
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error)
    }
  }

  // Attendance actions
  const handleCheckIn = async () => {
    if (!todayAttendance) return
    
    try {
      setAttendanceError(null) // Clear any previous errors
      
      const response = await fetch(getApiUrl(`/attendance_records/${todayAttendance.id}/check_in`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setAttendanceError(null) // Clear any previous errors
        await fetchTodayAttendance()
        await fetchAttendanceRecords()
        await fetchAttendanceStats()
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Failed to check in'
        setAttendanceError(errorMessage)
        console.error('Error checking in:', errorMessage)
      }
    } catch (error) {
      setAttendanceError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Error checking in:', error)
    }
  }

  const handleCheckOut = async () => {
    if (!todayAttendance) return
    
    try {
      setAttendanceError(null) // Clear any previous errors
      
      const response = await fetch(getApiUrl(`/attendance_records/${todayAttendance.id}/check_out`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setAttendanceError(null) // Clear any previous errors
        await fetchTodayAttendance()
        await fetchAttendanceRecords()
        await fetchAttendanceStats()
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Failed to check out'
        setAttendanceError(errorMessage)
        console.error('Error checking out:', errorMessage)
      }
    } catch (error) {
      setAttendanceError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Error checking out:', error)
    }
  }

  const handleLeaveSubmit = async (formData: any) => {
    try {
      // Clear any previous errors
      setLeaveError(null)
      
      // Get current user's employee ID
      const employeeId = user?.employee?.id
      if (!employeeId) {
        setLeaveError("Employee information not found. Please contact HR.")
        return
      }
      
      // Use utility function to map form data to backend format
      const requestData = mapLeaveRequestToBackend(formData, employeeId, 'pending')
      
      console.log('🚀 Submitting leave request:', requestData)
      console.log('🌐 API URL:', getEndpointUrl('LEAVE_REQUESTS'))
      
      const response = await fetch(getEndpointUrl('LEAVE_REQUESTS'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Leave request created successfully:', result)
        setShowLeaveForm(false)
        setLeaveError(null) // Clear any previous errors
        await fetchLeaveRequests()
        await fetchLeaveBalance()
      } else {
        const errorData = await response.json()
        console.error('❌ Error response:', errorData)
        
        // Set error message for display in UI
        const errorMessage = errorData.errors?.join(', ') || 'Failed to create leave request'
        setLeaveError(errorMessage)
      }
    } catch (error) {
      console.error('❌ Network error submitting leave request:', error)
      setLeaveError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Filter functions
  const filteredAttendanceRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employee_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || record.status === filterStatus
    const matchesDepartment = filterDepartment === "all" || record.employee_department === filterDepartment
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const filteredLeaveRequests = leaveRequests.filter(request => {
    const matchesSearch = request.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.employee_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || request.status === filterStatus
    const matchesDepartment = filterDepartment === "all" || request.employee_department === filterDepartment
    return matchesSearch && matchesStatus && matchesDepartment
  })

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-800"
      case "absent": return "bg-red-100 text-red-800"
      case "late": return "bg-yellow-100 text-yellow-800"
      case "half_day": return "bg-blue-100 text-blue-800"
      case "work_from_home": return "bg-purple-100 text-purple-800"
      case "approved": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "cancelled": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Calendar data for attendance
  const calendarData = attendanceRecords.map(record => ({
    date: new Date(record.date),
    status: record.status,
    working_hours: record.working_hours,
    is_late: record.is_late
  }))

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Attendance & Leave Management</h1>
          <p className="text-gray-600">Track employee attendance and manage leave requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAttendanceModal(true)}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Mark Attendance
          </Button>
          <Button size="sm" onClick={() => setShowLeaveForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Apply Leave
          </Button>
        </div>
      </div>

      {/* Today's Attendance Card */}
      {todayAttendance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(todayAttendance.status)}>
                    {todayAttendance.status_label}
                  </Badge>
                </div>
                {todayAttendance.check_in && (
                  <div>
                    <p className="text-sm text-gray-600">Check In</p>
                    <p className="font-medium">{todayAttendance.formatted_check_in}</p>
                  </div>
                )}
                {todayAttendance.check_out && (
                  <div>
                    <p className="text-sm text-gray-600">Check Out</p>
                    <p className="font-medium">{todayAttendance.formatted_check_out}</p>
                  </div>
                )}
                {todayAttendance.working_hours > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Working Hours</p>
                    <p className="font-medium">{todayAttendance.working_hours}h</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {!todayAttendance.check_in && (
                  <Button onClick={handleCheckIn} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Check In
                  </Button>
                )}
                {todayAttendance.check_in && !todayAttendance.check_out && (
                  <Button onClick={handleCheckOut} className="bg-red-600 hover:bg-red-700">
                    <XCircle className="w-4 h-4 mr-2" />
                    Check Out
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceStats?.present_days || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceStats?.absent_days || 0}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceStats?.late_days || 0}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance %</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceStats?.attendance_percentage || 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave-requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="leave-balance">Leave Balance</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          {/* Error Display */}
          {attendanceError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{attendanceError}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setAttendanceError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
                <SelectItem value="work_from_home">Work from Home</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Recent attendance records for all employees</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Working Hours</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.employee_name}</p>
                          <p className="text-sm text-gray-500">{record.employee_department}</p>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{record.formatted_check_in || '-'}</TableCell>
                      <TableCell>{record.formatted_check_out || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status_label}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.working_hours}h</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Requests Tab */}
        <TabsContent value="leave-requests" className="space-y-6">
          {/* Error Display */}
          {leaveError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{leaveError}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLeaveError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <LeaveRequestManagement 
            onRefresh={() => {
              fetchLeaveRequests()
              fetchLeaveBalance()
            }}
            onError={(error) => setLeaveError(error)}
            onViewDetails={(request) => {
              setSelectedLeaveRequest(request)
              setShowLeaveDetails(true)
            }}
          />
        </TabsContent>

        {/* Leave Balance Tab */}
        <TabsContent value="leave-balance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaveBalance.map((balance) => (
              <Card key={balance.leave_type}>
                <CardHeader>
                  <CardTitle className="text-lg">{balance.leave_type_label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="font-medium">{balance.total} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Used</span>
                      <span className="font-medium text-red-600">{balance.used} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Remaining</span>
                      <span className="font-medium text-green-600">{balance.remaining} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(balance.used / balance.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Calendar</CardTitle>
              <CardDescription>View attendance patterns in calendar format</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leave Request Form Modal */}
      {showLeaveForm && (
        <LeaveRequestForm
          onClose={() => setShowLeaveForm(false)}
          onSubmit={handleLeaveSubmit}
          employeeId={user?.employee?.id || 1}
        />
      )}

      {/* Attendance Marking Modal */}
      <AttendanceMarking
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        onSuccess={() => {
          fetchAttendanceRecords()
          fetchTodayAttendance()
          fetchAttendanceStats()
        }}
      />

      {/* Leave Request Details Modal */}
      <LeaveRequestDetails
        request={selectedLeaveRequest}
        isOpen={showLeaveDetails}
        onClose={() => {
          setShowLeaveDetails(false)
          setSelectedLeaveRequest(null)
        }}
        showActions={false}
      />
    </div>
  )
}
