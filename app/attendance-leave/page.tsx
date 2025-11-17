"use client"

import { useEffect, useState } from "react"
import { apiRequest, getApiUrl, getEndpointUrl } from "@/lib/api"
import { mapLeaveRequestToBackend } from "@/lib/leave-request-mapper"
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
} from "lucide-react"
import { LeaveRequestForm } from "@/components/forms/leave-request-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { format } from "date-fns"

export default function AttendanceLeavePage() {
  const { user, isAuthenticated } = useAuth()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [month, setMonth] = useState<number>(new Date().getMonth())
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [searchTerm, setSearchTerm] = useState("")
  const [attendanceStats, setAttendanceStats] = useState([])
  const [todayAttendance, setTodayAttendance] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [attendanceForm, setAttendanceForm] = useState({ employee_id: "", status: "Present", check_in: "", check_out: "" })

  useEffect(() => {
    fetchAttendance()
    fetchLeaveRequests()
    fetchEmployees()
    fetchDepartments()
  }, [])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res = await apiRequest('ATTENDANCE_RECORDS')
      setTodayAttendance(res as any)
    } catch (error) {
      console.error('Error fetching attendance:', error)
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveRequests = async () => {
    setLoading(true)
    try {
      const res = await apiRequest('LEAVE_REQUESTS')
      setLeaveRequests(res as any)
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await apiRequest('EMPLOYEES')
      setEmployees(res as any)
    } catch (error) {
      console.error('Error fetching employees:', error)
      // handle error
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await apiRequest('DEPARTMENTS')
      setDepartments(res as any)
    } catch (error) {
      console.error('Error fetching departments:', error)
      // handle error
    }
  }

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => String(e.id) === String(id))
    return emp ? `${emp.first_name} ${emp.last_name}` : id
  }

  const getDepartmentName = (id: string) => {
    const dept = departments.find(d => String(d.id) === String(id))
    return dept ? dept.name : id
  }

  const getAttendanceStatusColor = (status: string) => {
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

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleApplyLeave = async (formData) => {
    try {
      // Get current user's employee ID
      const employeeId = user?.employee_id
      if (!employeeId) {
        alert("Employee information not found. Please contact HR.")
        return
      }
      
      // Use utility function to map form data to backend format
      const requestData = mapLeaveRequestToBackend(formData, employeeId, 'pending')
      
      const res = await fetch(getEndpointUrl('LEAVE_REQUESTS'), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(requestData)
      })
      if (res.ok) {
        fetchLeaveRequests()
        setShowLeaveForm(false)
      } else {
        // handle error
      }
    } catch (err) {
      // handle error
    }
  }

  const handleMarkAttendance = async (e) => {
    e.preventDefault()
    await fetch(getEndpointUrl('ATTENDANCE_RECORDS'), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ attendance_record: attendanceForm })
    })
    setShowAttendanceModal(false)
    setAttendanceForm({ employee_id: "", status: "Present", check_in: "", check_out: "" })
    fetchAttendance()
  }

  // Filter attendance by selected date and search term
  const filteredAttendance = (date
    ? todayAttendance.filter((record) => {
        // Assume record.date is in ISO format (YYYY-MM-DD)
        if (!record.date) return false;
        return format(new Date(record.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      })
    : todayAttendance
  ).filter((record) => {
    if (!searchTerm) return true;
    const employeeName = getEmployeeName(record.employee_id).toLowerCase();
    return employeeName.includes(searchTerm.toLowerCase());
  });

  // Calendar styling is now handled through CSS
  const calendarClassNames = {};

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
          <Tabs defaultValue="attendance" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="leave">Leave Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
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
                    <Select>
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
                          <TableHead>Check In</TableHead>
                          <TableHead>Check Out</TableHead>
                          <TableHead>Work Hours</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
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
                              <TableCell>
                                <span className="text-sm text-gray-600">{record.checkIn}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-gray-600">{record.checkOut}</span>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-gray-900">{record.workHours}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-gray-600">{record.location}</span>
                              </TableCell>
                              <TableCell>
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
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Edit Attendance</DropdownMenuItem>
                                    <DropdownMenuItem>View History</DropdownMenuItem>
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
            </TabsContent>

            <TabsContent value="leave" className="space-y-6">
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
                      <Input placeholder="Search leave requests..." className="pl-10" />
                    </div>
                    <Select>
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

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
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
                        {leaveRequests.map((request) => (
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
                              <span className="text-sm text-gray-600">{request.leaveType}</span>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                <p>{new Date(request.startDate).toLocaleDateString()}</p>
                                <p>to {new Date(request.endDate).toLocaleDateString()}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-gray-900">{request.days} days</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600 max-w-32 truncate">{request.reason}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getLeaveStatusColor(request.status)}>{request.status}</Badge>
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
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  {request.status === "Pending" && (
                                    <>
                                      <DropdownMenuItem className="text-green-600">Approve</DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">Reject</DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {showLeaveForm && (
        <LeaveRequestForm onClose={() => setShowLeaveForm(false)} onSubmit={handleApplyLeave} />
      )}
      <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMarkAttendance} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Employee</label>
              <Select value={attendanceForm.employee_id} onValueChange={v => setAttendanceForm(f => ({ ...f, employee_id: v }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={String(emp.id)}>{emp.first_name} {emp.last_name}</SelectItem>
                  ))}
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
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block mb-1 font-medium">Check In (optional)</label>
                <input type="time" className="w-full border rounded px-2 py-1" value={attendanceForm.check_in} onChange={e => setAttendanceForm(f => ({ ...f, check_in: e.target.value }))} />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">Check Out (optional)</label>
                <input type="time" className="w-full border rounded px-2 py-1" value={attendanceForm.check_out} onChange={e => setAttendanceForm(f => ({ ...f, check_out: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Mark Attendance</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
