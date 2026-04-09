"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { apiRequest, getApiUrl, getEndpointUrl } from "@/lib/api"
import { mapLeaveRequestToBackend, mapLeaveRequestFromBackend } from "@/lib/leave-request-mapper"
import { useAuth } from "@/lib/auth/auth.hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"
import {
  CalendarCheck,
  Search,
  Plus,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  CalendarIcon,
  Eye,
  RefreshCw,
} from "lucide-react"
import { LeaveRequestForm } from "@/components/forms/leave-request-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { LeaveRequestDetailsDialog } from "@/components/attendance/leave-request-details-dialog"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { useToast } from "@/hooks/use-toast"

interface LeaveRequest {
  id: number
  employee_id: number
  employeeId: number
  leaveType?: string
  leaveTypeLabel?: string
  leave_type?: string
  leave_type_label?: string
  startDate?: string
  endDate?: string
  start_date?: string
  end_date?: string
  formattedStartDate?: string
  formattedEndDate?: string
  formatted_start_date?: string
  formatted_end_date?: string
  days?: number
  reason?: string
  status?: string
  statusLabel?: string
  status_label?: string
  department_id?: number
}

interface Employee {
  id: number
  first_name: string
  last_name: string
}

interface Department {
  id: number
  name: string
}

interface AttendanceSession {
  id: number
  attendance_record_id: number
  check_in: string
  check_out: string | null
  session_hours: number | null
  created_at?: string
  updated_at?: string
}

interface AttendanceRecord {
  id: number
  employee_id: number
  department_id?: number
  date?: string
  checkIn?: string
  checkOut?: string
  workHours?: string
  working_hours?: number | string
  check_in?: string
  check_out?: string
  location?: string
  status?: string
  attendance_sessions?: AttendanceSession[]
}

interface AttendanceStat {
  title: string
  value: string
  change: string
  icon: any
  color: string
  bgColor: string
}

export default function AttendanceLeavePage() {
  const { user, isAuthenticated, checkPermission } = useAuth()
  const searchParams = useSearchParams()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [month, setMonth] = useState<number>(new Date().getMonth())
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [searchTerm, setSearchTerm] = useState("")
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string>("all")
  const [leaveSearchTerm, setLeaveSearchTerm] = useState("")
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("attendance")
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStat[]>([])
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [attendanceForm, setAttendanceForm] = useState({ employee_id: "", status: "present", check_in: "", check_out: "" })
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState<AttendanceRecord | null>(null)
  const [showAttendanceDetails, setShowAttendanceDetails] = useState(false)
  const [dayAttendanceHistory, setDayAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [loadingDayHistory, setLoadingDayHistory] = useState(false)
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false)
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [showPreviousRecords, setShowPreviousRecords] = useState(false)
  const [previousRecords, setPreviousRecords] = useState<AttendanceRecord[]>([])
  const [loadingPreviousRecords, setLoadingPreviousRecords] = useState(false)
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null)
  const [showLeaveDetails, setShowLeaveDetails] = useState(false)
  const [leaveCurrentPage, setLeaveCurrentPage] = useState<number>(1)
  const [leavePageSize, setLeavePageSize] = useState<number>(10)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check for query parameters
    const tabParam = searchParams?.get('tab')
    const managerPending = searchParams?.get('manager_pending')
    
    if (tabParam) {
      setActiveTab(tabParam)
    }
    
    fetchAttendance()
    fetchLeaveRequests(managerPending === 'true')
    fetchEmployees()
    fetchDepartments()
  }, [searchParams])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res = await apiRequest<AttendanceRecord[]>(getEndpointUrl('ATTENDANCE_RECORDS'), { suppressToast: true })
      setTodayAttendance(Array.isArray(res) ? res : [])
    } catch (error: any) {
      console.error('Error fetching attendance:', error)
      if (error?.statusCode !== 403 && !error?.toastShown) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch attendance records",
          variant: "destructive",
        })
      }
      setTodayAttendance([])
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveRequests = async (managerPending: boolean = false) => {
    setLoading(true)
    try {
      let url = getEndpointUrl('LEAVE_REQUESTS')
      if (managerPending) {
        const params = new URLSearchParams()
        params.append('manager_pending', 'true')
        params.append('status', 'pending')
        url += `?${params.toString()}`
      }
      const res = await apiRequest<any[]>(url, { suppressToast: true })
      // Map backend response to frontend format, preserving both formats for compatibility
      const mappedRequests = Array.isArray(res) ? res.map((item) => {
        const mapped = mapLeaveRequestFromBackend(item)
        // Preserve original snake_case fields as fallback
        return {
          ...mapped,
          // Keep original fields as fallback
          employee_id: mapped.employeeId || item.employee_id,
          leave_type: mapped.leaveType || item.leave_type,
          leave_type_label: mapped.leaveTypeLabel || item.leave_type_label,
          start_date: mapped.startDate || item.start_date,
          end_date: mapped.endDate || item.end_date,
          formatted_start_date: mapped.formattedStartDate || item.formatted_start_date,
          formatted_end_date: mapped.formattedEndDate || item.formatted_end_date,
          status: mapped.status || item.status,
          status_label: mapped.statusLabel || item.status_label,
        }
      }) : []
      setLeaveRequests(mappedRequests)
      // If manager_pending is true, also set the status filter to pending
      if (managerPending) {
        setLeaveStatusFilter('pending')
      }
    } catch (error: any) {
      console.error('Error fetching leave requests:', error)
      if (error?.statusCode !== 403 && !error?.toastShown) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch leave requests",
          variant: "destructive",
        })
      }
      setLeaveRequests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await apiRequest<any>(`${getEndpointUrl('EMPLOYEES')}?per_page=1000`, { suppressToast: true })
      
      // Handle both paginated response { data: [...], pagination: {...} } and direct array
      let employeeList: Employee[] = []
      if (Array.isArray(res)) {
        employeeList = res
      } else if (res?.data && Array.isArray(res.data)) {
        employeeList = res.data
      }
      
      setEmployees(employeeList)
    } catch (error: any) {
      console.error('Error fetching employees:', error)
      if (error?.statusCode !== 403 && !error?.toastShown) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch employees",
          variant: "destructive",
        })
      }
      setEmployees([])
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await apiRequest<Department[]>(getEndpointUrl('DEPARTMENTS'), { suppressToast: true })
      setDepartments(Array.isArray(res) ? res : [])
    } catch (error: any) {
      console.error('Error fetching departments:', error)
      if (error?.statusCode !== 403 && !error?.toastShown) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch departments",
          variant: "destructive",
        })
      }
      setDepartments([])
    }
  }

  const getEmployeeName = (id: string | number) => {
    const emp = employees.find(e => String(e.id) === String(id))
    return emp ? `${emp.first_name} ${emp.last_name}` : String(id)
  }

  const getDepartmentName = (id: string | number | undefined) => {
    if (!id) return 'N/A'
    const dept = departments.find(d => String(d.id) === String(id))
    return dept ? dept.name : String(id)
  }

  const getCheckInTime = (record: AttendanceRecord): string => {
    const checkIn = record.checkIn || record.check_in
    if (!checkIn) return ""
    
    // Handle datetime format like "2000-01-01 09:30:00.000000000 +0000"
    if (checkIn.includes(' ')) {
      const timePart = checkIn.split(' ')[1]?.split(':')
      if (timePart && timePart.length >= 2) {
        return `${timePart[0]}:${timePart[1]}`
      }
    }
    // Handle ISO format like "2000-01-01T09:30:00.000Z"
    if (checkIn.includes('T')) {
      return checkIn.split('T')[1]?.substring(0, 5) || ""
    }
    // Handle time-only format like "09:30"
    if (checkIn.match(/^\d{2}:\d{2}/)) {
      return checkIn.substring(0, 5)
    }
    return checkIn
  }

  const getCheckOutTime = (record: AttendanceRecord): string => {
    const checkOut = record.checkOut || record.check_out
    if (!checkOut) return ""
    
    // Handle datetime format like "2000-01-01 18:00:00.000000000 +0000"
    if (checkOut.includes(' ')) {
      const timePart = checkOut.split(' ')[1]?.split(':')
      if (timePart && timePart.length >= 2) {
        return `${timePart[0]}:${timePart[1]}`
      }
    }
    // Handle ISO format like "2000-01-01T18:00:00.000Z"
    if (checkOut.includes('T')) {
      return checkOut.split('T')[1]?.substring(0, 5) || ""
    }
    // Handle time-only format like "18:00"
    if (checkOut.match(/^\d{2}:\d{2}/)) {
      return checkOut.substring(0, 5)
    }
    return checkOut
  }

  const getWorkHours = (record: AttendanceRecord): string => {
    const workHours = record.workHours || record.working_hours
    if (workHours === null || workHours === undefined) return ""
    
    // If it's a number, format it with up to 2 decimal places
    if (typeof workHours === 'number') {
      // Handle scientific notation (e.g., 0.85e1 = 8.5)
      const numValue = workHours
      // Format to remove unnecessary trailing zeros
      return numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(2).replace(/\.?0+$/, '')
    }
    
    // If it's a string, try to parse it as a number first
    const numValue = parseFloat(String(workHours))
    if (!isNaN(numValue)) {
      return numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(2).replace(/\.?0+$/, '')
    }
    
    // If it's a string that can't be parsed, return as is
    return String(workHours)
  }

  const getAttendanceStatusColor = (status: string | undefined) => {
    const statusLower = status?.toLowerCase() || ""
    switch (statusLower) {
      case "present":
        return "bg-green-100 text-green-800"
      case "late":
        return "bg-yellow-100 text-yellow-800"
      case "absent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLeaveStatusColor = (status: string | undefined) => {
    const statusLower = status?.toLowerCase() || ""
    switch (statusLower) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleApplyLeave = async (formData: any, selectedEmployeeId: number) => {
    try {
      // Use the selectedEmployeeId from the form (which should be the current user's ID for self-application)
      const employeeId = selectedEmployeeId || user?.employee_id
      if (!employeeId) {
        alert("Employee information not found. Please contact HR.")
        return
      }
      
      // Use utility function to map form data to backend format
      const requestData = mapLeaveRequestToBackend(formData, employeeId, 'pending')
      
      await apiRequest<any>(getEndpointUrl('LEAVE_REQUESTS'), {
        method: "POST",
        body: JSON.stringify(requestData)
      })
      fetchLeaveRequests()
      setShowLeaveForm(false)
    } catch (err) {
      console.error('Error applying leave:', err)
      alert(err instanceof Error ? err.message : 'Failed to submit leave request')
    }
  }

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get the date - use selected date from calendar or default to today
    const attendanceDate = date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
    const employeeId = parseInt(attendanceForm.employee_id)
    
    // Format check_in and check_out as datetime strings if provided
    const checkInDateTime = attendanceForm.check_in ? `${attendanceDate}T${attendanceForm.check_in}:00` : null
    const checkOutDateTime = attendanceForm.check_out ? `${attendanceDate}T${attendanceForm.check_out}:00` : null
    
    const requestData = {
      attendance_record: {
        employee_id: employeeId,
        date: attendanceDate,
        status: attendanceForm.status.toLowerCase(),
        check_in: checkInDateTime,
        check_out: checkOutDateTime
      }
    }
    
    try {
      // Check if a record already exists for this employee and date
      // Query API with filters to find existing record
      const existingRecords = await apiRequest<any[]>(
        `${getEndpointUrl('ATTENDANCE_RECORDS')}?employee_id=${employeeId}&date=${attendanceDate}`
      )
      
      const existingRecord = existingRecords && existingRecords.length > 0 ? existingRecords[0] : null
      
      if (existingRecord) {
        // Update existing record
        await apiRequest<any>(`${getEndpointUrl('ATTENDANCE_RECORDS')}/${existingRecord.id}`, {
          method: "PUT",
          body: JSON.stringify(requestData)
        })
      } else {
        // Create new record
        await apiRequest<any>(getEndpointUrl('ATTENDANCE_RECORDS'), {
          method: "POST",
          body: JSON.stringify(requestData)
        })
      }
      
      setShowAttendanceModal(false)
      setAttendanceForm({ employee_id: "", status: "present", check_in: "", check_out: "" })
      fetchAttendance()
    } catch (error: any) {
      // If error is about duplicate record, try to find and update it
      if (error?.message?.includes("already has attendance record")) {
        try {
          // Fetch the existing record and update it
          const existingRecords = await apiRequest<any[]>(
            `${getEndpointUrl('ATTENDANCE_RECORDS')}?employee_id=${employeeId}&date=${attendanceDate}`
          )
          if (existingRecords && existingRecords.length > 0) {
            await apiRequest<any>(`${getEndpointUrl('ATTENDANCE_RECORDS')}/${existingRecords[0].id}`, {
              method: "PUT",
              body: JSON.stringify(requestData)
            })
            setShowAttendanceModal(false)
            setAttendanceForm({ employee_id: "", status: "present", check_in: "", check_out: "" })
            fetchAttendance()
            return
          }
        } catch (updateError) {
          console.error('Error updating attendance:', updateError)
        }
      }
      console.error('Error marking attendance:', error)
      // Error will be handled by apiRequest
    }
  }

  const handleViewDetails = async (record: AttendanceRecord) => {
    setSelectedAttendanceRecord(record)
    setShowAttendanceDetails(true)
    // Fetch all attendance records for this employee on this date
    if (record.employee_id && record.date) {
      await fetchDayAttendanceHistory(record.employee_id, record.date)
    }
  }

  const fetchDayAttendanceHistory = async (employeeId: number, date: string) => {
    setLoadingDayHistory(true)
    try {
      const dateStr = new Date(date).toISOString().split('T')[0]
      const res = await apiRequest<AttendanceRecord[]>(
        `${getEndpointUrl('ATTENDANCE_RECORDS')}?employee_id=${employeeId}&date=${dateStr}`
      )
      // Sort by check-in time (earliest first)
      const sorted = Array.isArray(res) 
        ? res.sort((a, b) => {
            const timeA = a.check_in || a.checkIn || ''
            const timeB = b.check_in || b.checkIn || ''
            if (!timeA && !timeB) return 0
            if (!timeA) return 1
            if (!timeB) return -1
            return new Date(timeA).getTime() - new Date(timeB).getTime()
          })
        : []
      setDayAttendanceHistory(sorted)
    } catch (error) {
      console.error('Error fetching day attendance history:', error)
      setDayAttendanceHistory([])
    } finally {
      setLoadingDayHistory(false)
    }
  }

  const handleEditAttendance = (record: AttendanceRecord) => {
    // Use helper functions to extract time from check_in and check_out
    const checkInTime = getCheckInTime(record)
    const checkOutTime = getCheckOutTime(record)
    
    setAttendanceForm({
      employee_id: String(record.employee_id),
      status: record.status || "present",
      check_in: checkInTime,
      check_out: checkOutTime
    })
    // Set the date to the record's date
    if (record.date) {
      setDate(new Date(record.date))
    }
    setShowAttendanceModal(true)
  }

  const fetchAttendanceHistory = async (employeeId: number) => {
    setLoading(true)
    try {
      const res = await apiRequest<AttendanceRecord[]>(
        `${getEndpointUrl('ATTENDANCE_RECORDS')}?employee_id=${employeeId}`
      )
      setAttendanceHistory(Array.isArray(res) ? res : [])
      setShowAttendanceHistory(true)
    } catch (error) {
      console.error('Error fetching attendance history:', error)
      setAttendanceHistory([])
      setShowAttendanceHistory(true)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreviousRecords = async () => {
    if (!user?.employee_id) {
      alert("Please login to view your attendance records")
      return
    }
    
    setLoadingPreviousRecords(true)
    setShowPreviousRecords(true)
    try {
      const res = await apiRequest<AttendanceRecord[]>(
        `${getEndpointUrl('ATTENDANCE_RECORDS')}?employee_id=${user.employee_id}`
      )
      // Sort by date descending (most recent first)
      const sorted = Array.isArray(res) 
        ? res.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0
            const dateB = b.date ? new Date(b.date).getTime() : 0
            return dateB - dateA
          })
        : []
      setPreviousRecords(sorted)
    } catch (error) {
      console.error('Error fetching previous records:', error)
      setPreviousRecords([])
    } finally {
      setLoadingPreviousRecords(false)
    }
  }

  const handleViewHistory = (record: AttendanceRecord) => {
    fetchAttendanceHistory(record.employee_id)
    setSelectedAttendanceRecord(record)
  }

  const handleViewLeaveDetails = (request: LeaveRequest) => {
    setSelectedLeaveRequest(request)
    setShowLeaveDetails(true)
  }

  const handleApprove = async (requestId: number) => {
    setActionLoading(requestId)
    try {
      await apiRequest<any>(getApiUrl(`/leave_requests/${requestId}/approve`), {
        method: 'PATCH',
      })
      
      toast({
        title: "Success",
        description: "Leave request approved successfully.",
        variant: "default",
      })
      
      // Refresh the list
      await fetchLeaveRequests()
    } catch (error: any) {
      console.error('Error approving leave request:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to approve leave request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (requestId: number) => {
    setActionLoading(requestId)
    try {
      await apiRequest<any>(getApiUrl(`/leave_requests/${requestId}/reject`), {
        method: 'PATCH',
      })
      
      toast({
        title: "Success",
        description: "Leave request rejected successfully.",
        variant: "default",
      })
      
      // Refresh the list
      await fetchLeaveRequests()
    } catch (error: any) {
      console.error('Error rejecting leave request:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to reject leave request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Filter attendance by selected date, search term, and status
  const filteredAttendance = (date
    ? todayAttendance.filter((record) => {
        // Assume record.date is in ISO format (YYYY-MM-DD)
        if (!record.date) return false;
        return format(new Date(record.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      })
    : todayAttendance
  ).filter((record) => {
    // Filter by search term
    if (searchTerm) {
      const employeeName = getEmployeeName(record.employee_id).toLowerCase();
      if (!employeeName.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    // Filter by status
    if (attendanceStatusFilter !== "all") {
      const recordStatus = record.status?.toLowerCase() || "";
      if (recordStatus !== attendanceStatusFilter.toLowerCase()) {
        return false;
      }
    }
    return true;
  });

  // Filter leave requests by search term and status
  const filteredLeaveRequests = leaveRequests.filter((request) => {
    // Filter by search term (search in employee name, leave type, reason)
    if (leaveSearchTerm) {
      const searchLower = leaveSearchTerm.toLowerCase();
      const employeeName = getEmployeeName(request.employee_id).toLowerCase();
      const leaveType = (request.leaveTypeLabel || request.leave_type_label || request.leaveType || request.leave_type || '').toLowerCase();
      const reason = (request.reason || '').toLowerCase();
      
      if (!employeeName.includes(searchLower) && 
          !leaveType.includes(searchLower) && 
          !reason.includes(searchLower)) {
        return false;
      }
    }
    // Filter by status
    if (leaveStatusFilter !== "all") {
      const requestStatus = (request.status?.toLowerCase() || request.statusLabel?.toLowerCase() || '');
      if (requestStatus !== leaveStatusFilter.toLowerCase()) {
        return false;
      }
    }
    return true;
  });

  // Pagination for leave requests
  const leaveTotalPages = Math.max(1, Math.ceil(filteredLeaveRequests.length / leavePageSize));
  const leaveCurrentPageSafe = Math.min(leaveCurrentPage, leaveTotalPages);
  const leavePageStartIndex = (leaveCurrentPageSafe - 1) * leavePageSize;
  const leavePageEndIndex = leavePageStartIndex + leavePageSize;
  const paginatedLeaveRequests = filteredLeaveRequests.slice(leavePageStartIndex, leavePageEndIndex);

  const handleLeavePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), leaveTotalPages);
    setLeaveCurrentPage(nextPage);
  };

  // Calendar styling is now handled through CSS
  const calendarClassNames = {};

  // Reset leave pagination when filters, data, or page size change
  useEffect(() => {
    setLeaveCurrentPage(1);
  }, [leaveSearchTerm, leaveStatusFilter, leaveRequests, leavePageSize]);

  // Generate month options
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate year options (current year ± 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] = useState(false);

  // Handle month selection
  const handleMonthSelect = (monthIndex: number) => {
    setMonth(monthIndex);
    const newDate = new Date(year, monthIndex, date?.getDate() || 1);
    setDate(newDate);
    setIsMonthYearPickerOpen(false);
  };

  // Handle year selection
  const handleYearSelect = (selectedYear: number) => {
    setYear(selectedYear);
    const newDate = new Date(selectedYear, month, date?.getDate() || 1);
    setDate(newDate);
  };

  // Handle clear date
  const handleClearDate = () => {
    setDate(undefined);
  };

  // Handle today button
  const handleToday = () => {
    const today = new Date();
    setDate(today);
    setMonth(today.getMonth());
    setYear(today.getFullYear());
  };

  // Handle quick date input
  const handleQuickDateChange = (dateString: string) => {
    if (dateString) {
      const newDate = new Date(dateString);
      setDate(newDate);
      setMonth(newDate.getMonth());
      setYear(newDate.getFullYear());
    }
  };

  // Update month/year when date changes
  useEffect(() => {
    if (date) {
      setMonth(date.getMonth());
      setYear(date.getFullYear());
    }
  }, [date]);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Attendance & Leave</h1>
          <p className="text-gray-600">Track employee attendance and manage leave requests</p>
        </div>
        <div className="flex gap-2">
          {checkPermission('attendance_records.approve') && (
            <Button variant="outline" size="sm" onClick={() => setShowAttendanceModal(true)}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          )}
          {checkPermission('leave_requests.index') && (
            <Button size="sm" onClick={() => setShowLeaveForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Apply Leave
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {attendanceStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1 h-fit shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
            <CardDescription className="text-sm text-gray-600">Select date to view attendance</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            {/* Month-Year Picker */}
            <Popover open={isMonthYearPickerOpen} onOpenChange={setIsMonthYearPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 font-medium bg-white hover:bg-gray-50 border-gray-200"
                >
                  <span>{months[month]} {year}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                  {/* Year List */}
                  <div className="w-24 border-r border-gray-200 overflow-y-auto max-h-[300px]">
                    {years.map((yr) => (
                      <button
                        key={yr}
                        onClick={() => handleYearSelect(yr)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                          yr === year ? "bg-gray-100 font-medium" : ""
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                  {/* Month Grid */}
                  <div className="p-2">
                    <div className="grid grid-cols-4 gap-1">
                      {months.map((monthName, index) => (
                        <button
                          key={index}
                          onClick={() => handleMonthSelect(index)}
                          className={`w-14 h-9 text-xs font-medium rounded hover:bg-gray-100 transition-colors ${
                            index === month
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {monthName.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Calendar */}
            <div className="w-full flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                month={new Date(year, month, 1)}
                onMonthChange={(newMonth) => {
                  setMonth(newMonth.getMonth());
                  setYear(newMonth.getFullYear());
                }}
                className="rounded-lg border border-gray-200 shadow-sm bg-white"
                classNames={calendarClassNames}
              />
            </div>

            {/* Clear and Today Buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearDate}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToday}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Today
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Attendance and Leave */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="leave">Leave Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="space-y-4">
              {checkPermission('attendance_records.index') ? (
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                          <CalendarCheck className="w-5 h-5" />
                          Attendance for {date ? date.toLocaleDateString() : "-"}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {date ? date.toLocaleDateString("en-IN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }) : "Select a date to view attendance."}
                        </CardDescription>
                      </div>
                      {user?.employee_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchPreviousRecords}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Previous Records
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={attendanceStatusFilter} onValueChange={setAttendanceStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead className="text-center">Check In</TableHead>
                          <TableHead className="text-center">Check Out</TableHead>
                          <TableHead className="text-center">Work Hours</TableHead>
                          <TableHead className="text-center">Location</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAttendance.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                              No attendance records for this date.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAttendance.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-gray-900">{getEmployeeName(record.employee_id)}</p>
                                  <p className="text-sm text-gray-500">
                                    {record.employee_id} • {getDepartmentName(record.department_id)}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-sm text-gray-600">
                                  {record.status?.toLowerCase() === "absent" ? "-" : (getCheckInTime(record) || "-")}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-sm text-gray-600">
                                  {record.status?.toLowerCase() === "absent" ? "-" : (getCheckOutTime(record) || "-")}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-medium text-gray-900">
                                  {record.status?.toLowerCase() === "absent" ? "-" : (getWorkHours(record) || "-")}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-sm text-gray-600">{record.location}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={getAttendanceStatusColor(record.status)}>{record.status}</Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleViewDetails(record)}>
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditAttendance(record)}>
                                      Edit Attendance
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewHistory(record)}>
                                      View History
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">Access Denied</p>
                      <p className="text-sm mt-2">You don't have permission to view attendance records.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="leave" className="space-y-6">
              {checkPermission('leave_requests.index') ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Leave Requests
                    </CardTitle>
                    <CardDescription>Manage employee leave applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input 
                          placeholder="Search leave requests..." 
                          className="pl-10"
                          value={leaveSearchTerm}
                          onChange={(e) => setLeaveSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={leaveStatusFilter} onValueChange={setLeaveStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-md border overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow>
                              <TableHead>Employee</TableHead>
                              <TableHead>Leave Type</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Days</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredLeaveRequests.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                  No leave requests found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              paginatedLeaveRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-gray-900">{getEmployeeName(request.employee_id)}</p>
                                    <p className="text-sm text-gray-500">
                                      {request.employee_id} • {getDepartmentName(request.department_id)}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-gray-600">
                                    {request.leaveTypeLabel || request.leave_type_label || request.leaveType || request.leave_type || 'N/A'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-gray-600">
                                    {(() => {
                                      const startDateStr = request.startDate || request.start_date
                                      const endDateStr = request.endDate || request.end_date
                                      const formattedStart = request.formattedStartDate || request.formatted_start_date
                                      const formattedEnd = request.formattedEndDate || request.formatted_end_date
                                      
                                      if (startDateStr && endDateStr) {
                                        return (
                                          <>
                                            <p>
                                              {formattedStart || (startDateStr ? format(new Date(startDateStr), 'MMM dd, yyyy') : 'N/A')}
                                            </p>
                                            <p className="text-gray-500">
                                              to {formattedEnd || (endDateStr ? format(new Date(endDateStr), 'MMM dd, yyyy') : 'N/A')}
                                            </p>
                                          </>
                                        )
                                      }
                                      return <span className="text-gray-400">Date not available</span>
                                    })()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium text-gray-900">{request.days} days</span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-gray-600 max-w-32 truncate">{request.reason}</span>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getLeaveStatusColor(request.status)}>
                                    {request.statusLabel || request.status || 'Unknown'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" disabled={actionLoading === request.id}>
                                        {actionLoading === request.id ? (
                                          <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <MoreHorizontal className="w-4 h-4" />
                                        )}
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => handleViewLeaveDetails(request)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      {(request.status?.toLowerCase() === "pending" || request.statusLabel?.toLowerCase() === "pending") && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() => handleApprove(request.id)}
                                            disabled={actionLoading === request.id}
                                            className="text-green-600"
                                          >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approve
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => handleReject(request.id)}
                                            disabled={actionLoading === request.id}
                                            className="text-red-600"
                                          >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Leave pagination (matching Leave Management style) */}
                    {filteredLeaveRequests.length > 0 && (
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 text-sm text-gray-600">
                        {/* Showing text */}
                        <div>
                          {filteredLeaveRequests.length === 0 ? (
                            <span>Showing 0 results</span>
                          ) : (
                            <span>
                              Showing {leavePageStartIndex + 1} to{" "}
                              {Math.min(leavePageEndIndex, filteredLeaveRequests.length)} of{" "}
                              {filteredLeaveRequests.length} leave requests
                            </span>
                          )}
                        </div>

                        {/* Per-page selector + numbered pagination */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span>Per page:</span>
                            <Select
                              value={leavePageSize.toString()}
                              onValueChange={(value) => {
                                setLeavePageSize(Number(value))
                              }}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLeavePageChange(leaveCurrentPageSafe - 1)}
                              disabled={leaveCurrentPageSafe === 1}
                            >
                              ‹ Previous
                            </Button>

                            {Array.from({ length: leaveTotalPages }, (_, index) => {
                              const page = index + 1
                              return (
                                <Button
                                  key={page}
                                  variant={page === leaveCurrentPageSafe ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleLeavePageChange(page)}
                                >
                                  {page}
                                </Button>
                              )
                            })}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLeavePageChange(leaveCurrentPageSafe + 1)}
                              disabled={leaveCurrentPageSafe === leaveTotalPages}
                            >
                              Next ›
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">Access Denied</p>
                      <p className="text-sm mt-2">You don't have permission to view leave requests.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {showLeaveForm && (
        <LeaveRequestForm 
          onClose={() => setShowLeaveForm(false)} 
          onSubmit={handleApplyLeave}
          employeeId={user?.employee_id ? Number(user.employee_id) : undefined}
          canSelectEmployee={false}
          mode="self"
        />
      )}
      {checkPermission('attendance_records.approve') && (
        <Dialog open={showAttendanceModal} onOpenChange={(open) => {
          setShowAttendanceModal(open)
          if (!open) {
            setAttendanceForm({ employee_id: "", status: "present", check_in: "", check_out: "" })
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {attendanceForm.employee_id ? "Edit Attendance" : "Mark Attendance"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMarkAttendance} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Date</label>
              <DatePicker
                value={date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                onChange={(v) => {
                  if (v) setDate(new Date(v))
                }}
                min={new Date(2000, 0, 1)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Employee</label>
              <Select value={attendanceForm.employee_id} onValueChange={v => setAttendanceForm(f => ({ ...f, employee_id: v }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.length > 0 ? (
                    employees.map(emp => (
                      <SelectItem key={emp.id} value={String(emp.id)}>{emp.first_name} {emp.last_name}</SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No employees available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <Select value={attendanceForm.status} onValueChange={v => setAttendanceForm(f => ({ ...f, status: v }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block mb-1 font-medium">Check In (optional)</label>
                <TimePicker
                  value={attendanceForm.check_in}
                  onChange={(v) => setAttendanceForm((f) => ({ ...f, check_in: v }))}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">Check Out (optional)</label>
                <TimePicker
                  value={attendanceForm.check_out}
                  onChange={(v) => setAttendanceForm((f) => ({ ...f, check_out: v }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {attendanceForm.employee_id ? "Update Attendance" : "Mark Attendance"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      )}

      {/* Attendance Details Dialog */}
      <Dialog open={showAttendanceDetails} onOpenChange={setShowAttendanceDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription>
              Check-in and check-out times for {selectedAttendanceRecord?.date 
                ? format(new Date(selectedAttendanceRecord.date), "MMMM dd, yyyy")
                : "this day"}
            </DialogDescription>
          </DialogHeader>
          {selectedAttendanceRecord && (
            <div className="space-y-6">
              {/* Date and Status Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedAttendanceRecord.date 
                      ? format(new Date(selectedAttendanceRecord.date), "EEEE, MMMM dd, yyyy")
                      : "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">
                    <Badge className={getAttendanceStatusColor(selectedAttendanceRecord.status)}>
                      {selectedAttendanceRecord.status || "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Employee Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee</label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {getEmployeeName(selectedAttendanceRecord.employee_id)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-base text-gray-900 mt-1">
                    {getDepartmentName(selectedAttendanceRecord.department_id)}
                  </p>
                </div>
              </div>

              {/* Check-in and Check-out Times */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Time Records</h3>
                {loadingDayHistory ? (
                  <div className="text-center py-4 text-gray-500">Loading history...</div>
                ) : (() => {
                  // Collect all sessions from all records
                  const allSessions: AttendanceSession[] = []
                  dayAttendanceHistory.forEach(record => {
                    if (record.attendance_sessions && Array.isArray(record.attendance_sessions)) {
                      allSessions.push(...record.attendance_sessions)
                    } else if (record.check_in) {
                      // Fallback: treat record as a session if no sessions array
                      allSessions.push({
                        id: record.id,
                        attendance_record_id: record.id,
                        check_in: record.check_in,
                        check_out: record.check_out || null,
                        session_hours: typeof record.working_hours === 'number' ? record.working_hours : 
                                       typeof record.working_hours === 'string' ? parseFloat(record.working_hours) || null : null
                      })
                    }
                  })
                  
                  return allSessions.length > 1 ? (
                    // Show list if multiple sessions
                    <div className="space-y-3">
                      {allSessions.map((session, index) => (
                        <div key={session.id || index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-semibold text-blue-700">#{index + 1}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-700">Session {index + 1}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 rounded border border-blue-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-3 h-3 text-blue-600" />
                                <label className="text-xs font-medium text-blue-700">Check In</label>
                              </div>
                              <p className="text-lg font-bold text-blue-900">
                                {session.check_in 
                                  ? new Date(session.check_in).toLocaleTimeString("en-US", { 
                                      hour: "2-digit", 
                                      minute: "2-digit",
                                      hour12: true 
                                    })
                                  : "Not recorded"}
                              </p>
                              {session.check_in && (
                                <p className="text-xs text-blue-600 mt-1">
                                  {new Date(session.check_in).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-3 h-3 text-green-600" />
                                <label className="text-xs font-medium text-green-700">Check Out</label>
                              </div>
                              <p className="text-lg font-bold text-green-900">
                                {session.check_out 
                                  ? new Date(session.check_out).toLocaleTimeString("en-US", { 
                                      hour: "2-digit", 
                                      minute: "2-digit",
                                      hour12: true 
                                    })
                                  : "Active"}
                              </p>
                              {session.check_out && (
                                <p className="text-xs text-green-600 mt-1">
                                  {new Date(session.check_out).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          {session.check_in && session.check_out && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Duration</span>
                                <span className="text-sm font-semibold text-gray-700">
                                  {session.session_hours 
                                    ? `${Math.floor(session.session_hours)}h ${Math.round((session.session_hours % 1) * 60)}m`
                                    : (() => {
                                        const checkIn = new Date(session.check_in)
                                        const checkOut = new Date(session.check_out)
                                        const diffMs = checkOut.getTime() - checkIn.getTime()
                                        const diffMins = Math.floor(diffMs / 60000)
                                        const hours = Math.floor(diffMins / 60)
                                        const mins = diffMins % 60
                                        return `${hours}h ${mins}m`
                                      })()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Total Summary */}
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-purple-700">Total Work Hours (All Sessions)</span>
                          <span className="text-xl font-bold text-purple-900">
                            {(() => {
                              let totalHours = 0
                              allSessions.forEach(session => {
                                if (session.session_hours) {
                                  totalHours += session.session_hours
                                } else if (session.check_in && session.check_out) {
                                  const checkIn = new Date(session.check_in)
                                  const checkOut = new Date(session.check_out)
                                  const diffMs = checkOut.getTime() - checkIn.getTime()
                                  totalHours += diffMs / (1000 * 60 * 60)
                                }
                              })
                              const hours = Math.floor(totalHours)
                              const mins = Math.round((totalHours % 1) * 60)
                              return `${hours}h ${mins}m`
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : allSessions.length === 1 ? (
                    // Show single session view
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <label className="text-sm font-medium text-blue-700">Check In</label>
                        </div>
                        <p className="text-xl font-bold text-blue-900">
                          {allSessions[0].check_in 
                            ? new Date(allSessions[0].check_in).toLocaleTimeString("en-US", { 
                                hour: "2-digit", 
                                minute: "2-digit",
                                hour12: true 
                              })
                            : "Not recorded"}
                        </p>
                        {allSessions[0].check_in && (
                          <p className="text-xs text-blue-600 mt-1">
                            {new Date(allSessions[0].check_in).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <label className="text-sm font-medium text-green-700">Check Out</label>
                        </div>
                        <p className="text-xl font-bold text-green-900">
                          {allSessions[0].check_out 
                            ? new Date(allSessions[0].check_out).toLocaleTimeString("en-US", { 
                                hour: "2-digit", 
                                minute: "2-digit",
                                hour12: true 
                              })
                            : "Active"}
                        </p>
                        {allSessions[0].check_out && (
                          <p className="text-xs text-green-600 mt-1">
                            {new Date(allSessions[0].check_out).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Show single record view if no sessions (fallback)
                    <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <label className="text-sm font-medium text-blue-700">Check In</label>
                      </div>
                      <p className="text-xl font-bold text-blue-900">
                        {selectedAttendanceRecord.status?.toLowerCase() === "absent" 
                          ? "N/A" 
                          : (getCheckInTime(selectedAttendanceRecord) || "Not recorded")}
                      </p>
                      {selectedAttendanceRecord.check_in && (
                        <p className="text-xs text-blue-600 mt-1">
                          {new Date(selectedAttendanceRecord.check_in).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <label className="text-sm font-medium text-green-700">Check Out</label>
                      </div>
                      <p className="text-xl font-bold text-green-900">
                        {selectedAttendanceRecord.status?.toLowerCase() === "absent" 
                          ? "N/A" 
                          : (getCheckOutTime(selectedAttendanceRecord) || "Not recorded")}
                      </p>
                      {selectedAttendanceRecord.check_out && (
                        <p className="text-xs text-green-600 mt-1">
                          {new Date(selectedAttendanceRecord.check_out).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  )
                })()}
              </div>

              {/* Work Hours Summary */}
              {selectedAttendanceRecord.status?.toLowerCase() !== "absent" && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-purple-700">Total Work Hours</label>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {getWorkHours(selectedAttendanceRecord) || "0"} hours
                      </p>
                    </div>
                    <div className="text-right">
                      {selectedAttendanceRecord.check_in && selectedAttendanceRecord.check_out && (
                        <p className="text-xs text-purple-600">
                          {(() => {
                            const checkIn = new Date(selectedAttendanceRecord.check_in)
                            const checkOut = new Date(selectedAttendanceRecord.check_out)
                            const diffMs = checkOut.getTime() - checkIn.getTime()
                            const diffMins = Math.floor(diffMs / 60000)
                            const hours = Math.floor(diffMins / 60)
                            const mins = diffMins % 60
                            return `${hours}h ${mins}m`
                          })()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedAttendanceRecord.location || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttendanceDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Previous Records Dialog */}
      <Dialog open={showPreviousRecords} onOpenChange={setShowPreviousRecords}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Previous Attendance Records</DialogTitle>
            <DialogDescription>
              View all your previous attendance records
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            {loadingPreviousRecords ? (
              <div className="text-center py-8 text-gray-500">Loading records...</div>
            ) : previousRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No previous records found.</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Check In</TableHead>
                      <TableHead className="text-center">Check Out</TableHead>
                      <TableHead className="text-center">Work Hours</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previousRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {record.date 
                            ? format(new Date(record.date), "MMM dd, yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-gray-600">
                            {record.status?.toLowerCase() === "absent" ? "-" : (getCheckInTime(record) || "-")}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-gray-600">
                            {record.status?.toLowerCase() === "absent" ? "-" : (getCheckOutTime(record) || "-")}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium text-gray-900">
                            {record.status?.toLowerCase() === "absent" ? "-" : (getWorkHours(record) || "-")}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getAttendanceStatusColor(record.status)}>
                            {record.status || "N/A"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviousRecords(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Previous Records Dialog */}
      <Dialog open={showPreviousRecords} onOpenChange={setShowPreviousRecords}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Previous Attendance Records</DialogTitle>
            <DialogDescription>
              View all your previous attendance records
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            {loadingPreviousRecords ? (
              <div className="text-center py-8 text-gray-500">Loading records...</div>
            ) : previousRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No previous records found.</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Check In</TableHead>
                      <TableHead className="text-center">Check Out</TableHead>
                      <TableHead className="text-center">Work Hours</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previousRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {record.date 
                            ? format(new Date(record.date), "MMM dd, yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-gray-600">
                            {record.status?.toLowerCase() === "absent" ? "-" : (getCheckInTime(record) || "-")}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-gray-600">
                            {record.status?.toLowerCase() === "absent" ? "-" : (getCheckOutTime(record) || "-")}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium text-gray-900">
                            {record.status?.toLowerCase() === "absent" ? "-" : (getWorkHours(record) || "-")}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getAttendanceStatusColor(record.status)}>
                            {record.status || "N/A"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviousRecords(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance History Dialog */}
      <Dialog open={showAttendanceHistory} onOpenChange={setShowAttendanceHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Attendance History - {selectedAttendanceRecord ? getEmployeeName(selectedAttendanceRecord.employee_id) : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading history...</div>
            ) : attendanceHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No attendance history found.</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Check In</TableHead>
                      <TableHead className="text-center">Check Out</TableHead>
                      <TableHead className="text-center">Work Hours</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {record.date 
                            ? format(new Date(record.date), "MMM dd, yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-gray-600">
                            {record.status?.toLowerCase() === "absent" ? "-" : (getCheckInTime(record) || "-")}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-gray-600">
                            {record.status?.toLowerCase() === "absent" ? "-" : (getCheckOutTime(record) || "-")}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium text-gray-900">
                            {record.status?.toLowerCase() === "absent" ? "-" : (getWorkHours(record) || "-")}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getAttendanceStatusColor(record.status)}>
                            {record.status || "N/A"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttendanceHistory(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Request Details Dialog */}
      <LeaveRequestDetailsDialog
        request={selectedLeaveRequest}
        isOpen={showLeaveDetails}
        onClose={() => setShowLeaveDetails(false)}
        getEmployeeName={getEmployeeName}
        getDepartmentName={getDepartmentName}
        getLeaveStatusColor={getLeaveStatusColor}
      />
    </div>
  )
}
