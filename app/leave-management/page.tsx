"use client"

import React, { useState, useEffect } from "react"
import { getEndpointUrl } from "@/lib/api"
import { useAuth } from "@/lib/auth/auth.hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  Search,
  Filter,
  MoreHorizontal,
  User,
  Building,
  Eye,
  Check,
  X,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"

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
  duration_days: number
  reason: string
  status: string
  status_label: string
  status_color: string
  is_current: boolean
  is_upcoming: boolean
  is_past: boolean
  can_be_cancelled: boolean
  can_be_modified: boolean
  half_day: boolean
  half_day_period: string
  half_day_period_label: string
  emergency_contact: string
  handover_notes: string
  created_at: string
  updated_at: string
}

interface LeaveStats {
  total_requests: number
  pending_requests: number
  approved_requests: number
  rejected_requests: number
  cancelled_requests: number
  this_month_requests: number
  this_week_requests: number
}

export default function LeaveManagementPage() {
  const { user, isAuthenticated } = useAuth()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [stats, setStats] = useState<LeaveStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(getEndpointUrl('LEAVE_REQUESTS'))
      if (response.ok) {
        const data = await response.json()
        setLeaveRequests(data)
      } else {
        setError("Failed to fetch leave requests")
      }
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Fetch leave statistics
  const fetchLeaveStats = async () => {
    try {
      const response = await fetch(getEndpointUrl('LEAVE_STATS'))
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching leave stats:", error)
    }
  }

  // Handle approve/reject/cancel actions
  const handleAction = async (requestId: number, action: 'approve' | 'reject' | 'cancel') => {
    try {
      setActionLoading(requestId)
      setError(null)

      const endpoint = action === 'approve' ? 'LEAVE_APPROVE' : 
                     action === 'reject' ? 'LEAVE_REJECT' : 'LEAVE_CANCEL'
      
      const response = await fetch(
        getEndpointUrl(endpoint).replace('{id}', requestId.toString()),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      if (response.ok) {
        // Refresh the data
        await fetchLeaveRequests()
        await fetchLeaveStats()
      } else {
        const errorData = await response.json()
        setError(errorData.message || `Failed to ${action} leave request`)
      }
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Filter leave requests
  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = 
      request.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leave_type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    const matchesDepartment = filterStatus === 'all' || request.employee_department === filterDepartment

    return matchesSearch && matchesStatus && matchesDepartment
  })

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      case 'pending':
        return 'secondary'
      case 'cancelled':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'cancelled':
        return <X className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeaveRequests()
      fetchLeaveStats()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">Please log in to access leave management.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Manage employee leave requests and approvals</p>
        </div>
        <Button onClick={() => { fetchLeaveRequests(); fetchLeaveStats(); }} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_requests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_requests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved_requests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected_requests}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or leave type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {/* Add department options dynamically */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests ({filteredRequests.length})</CardTitle>
          <CardDescription>
            Manage and review employee leave requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading leave requests...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.employee_name}</div>
                        <div className="text-sm text-gray-500">{request.employee_email}</div>
                        <div className="text-sm text-gray-500">{request.employee_department}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{request.leave_type_label}</div>
                      {request.half_day && (
                        <div className="text-sm text-gray-500">
                          {request.half_day_period_label}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{request.duration_days} day(s)</div>
                      {request.reason && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {request.reason}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{request.formatted_start_date}</div>
                        <div className="text-gray-500">to</div>
                        <div>{request.formatted_end_date}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(request.status)}
                        {request.status_label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {format(new Date(request.created_at), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowDetails(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleAction(request.id, 'approve')}
                                disabled={actionLoading === request.id}
                                className="text-green-600"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction(request.id, 'reject')}
                                disabled={actionLoading === request.id}
                                className="text-red-600"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {request.can_be_cancelled && request.status !== 'cancelled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(request.id, 'cancel')}
                            disabled={actionLoading === request.id}
                            className="text-orange-600"
                          >
                            {actionLoading === request.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Leave Request Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Detailed information about the leave request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Employee Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee Name</label>
                  <p className="text-lg font-semibold">{selectedRequest.employee_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{selectedRequest.employee_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-lg">{selectedRequest.employee_department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={getStatusBadgeVariant(selectedRequest.status)} className="flex items-center gap-1 w-fit">
                    {getStatusIcon(selectedRequest.status)}
                    {selectedRequest.status_label}
                  </Badge>
                </div>
              </div>

              {/* Leave Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Leave Type</label>
                  <p className="text-lg font-semibold">{selectedRequest.leave_type_label}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="text-lg">{selectedRequest.duration_days} day(s)</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <p className="text-lg">{selectedRequest.formatted_start_date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">End Date</label>
                  <p className="text-lg">{selectedRequest.formatted_end_date}</p>
                </div>
              </div>

              {/* Half Day Information */}
              {selectedRequest.half_day && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Half Day Period</label>
                  <p className="text-lg">{selectedRequest.half_day_period_label}</p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="text-sm font-medium text-gray-500">Reason</label>
                <p className="text-lg bg-gray-50 p-3 rounded-lg">{selectedRequest.reason}</p>
              </div>

              {/* Emergency Contact */}
              {selectedRequest.emergency_contact && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                  <p className="text-lg">{selectedRequest.emergency_contact}</p>
                </div>
              )}

              {/* Handover Notes */}
              {selectedRequest.handover_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Handover Notes</label>
                  <p className="text-lg bg-gray-50 p-3 rounded-lg">{selectedRequest.handover_notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Applied On</label>
                  <p className="text-lg">{format(new Date(selectedRequest.created_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-lg">{format(new Date(selectedRequest.updated_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleAction(selectedRequest.id, 'approve')
                      setShowDetails(false)
                    }}
                    disabled={actionLoading === selectedRequest.id}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleAction(selectedRequest.id, 'reject')
                      setShowDetails(false)
                    }}
                    disabled={actionLoading === selectedRequest.id}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

