"use client"

import React, { useState, useEffect } from "react"
import { getApiUrl, getEndpointUrl } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
} from "@/components/ui/dialog"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  User,
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth/auth.hooks"

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

interface LeaveRequestManagementProps {
  onRefresh?: () => void
  onError?: (error: string) => void
  onViewDetails?: (request: any) => void
}

export function LeaveRequestManagement({ onRefresh, onError, onViewDetails }: LeaveRequestManagementProps) {
  const { user, checkRole, checkPermission, roles, permissions } = useAuth()
  const isHRManager = checkRole("HR Manager") || roles?.some((r: any) => r?.name === "HR Manager")
  const isHR = checkRole("HR") || roles?.some((r: any) => r?.name === "HR")
  const isSuperAdmin = checkRole("Super Admin") || roles?.some((r: any) => r?.name === "Super Admin")
  const hasLeavePermission = checkPermission("leave_requests.index") || 
    permissions?.some((p: any) => {
      const permName = typeof p === 'string' ? p : p.name
      return permName === "leave_requests.index" || permName?.includes("leave")
    })
  const canViewAllRequests = isHRManager || isHR || isSuperAdmin || hasLeavePermission
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  // Load data on component mount
  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  // Filter requests when search or filters change
  useEffect(() => {
    let filtered = leaveRequests

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.employee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.leave_type_label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(request => request.employee_department === departmentFilter)
    }

    setFilteredRequests(filtered)
  }, [leaveRequests, searchTerm, statusFilter, departmentFilter])

  const fetchLeaveRequests = async () => {
    setLoading(true)
    try {
      let url = getEndpointUrl('LEAVE_REQUESTS')
      // For regular employees, filter by their employee_id
      if (!canViewAllRequests && user?.employee?.id) {
        url = `${url}?employee_id=${user.employee.id}`
      }
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setLeaveRequests(data)
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: number) => {
    setActionLoading(requestId)
    try {
      const response = await fetch(getApiUrl(`/leave_requests/${requestId}/approve`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        await fetchLeaveRequests()
        if (onRefresh) onRefresh()
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Failed to approve leave request'
        if (onError) onError(errorMessage)
        console.error('Error approving leave request:', errorMessage)
      }
    } catch (error) {
      const errorMessage = `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      if (onError) onError(errorMessage)
      console.error('Error approving leave request:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (requestId: number) => {
    setActionLoading(requestId)
    try {
      const response = await fetch(getApiUrl(`/leave_requests/${requestId}/reject`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        await fetchLeaveRequests()
        if (onRefresh) onRefresh()
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Failed to reject leave request'
        if (onError) onError(errorMessage)
        console.error('Error rejecting leave request:', errorMessage)
      }
    } catch (error) {
      const errorMessage = `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      if (onError) onError(errorMessage)
      console.error('Error rejecting leave request:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (requestId: number) => {
    setActionLoading(requestId)
    try {
      const response = await fetch(getApiUrl(`/leave_requests/${requestId}/cancel`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        await fetchLeaveRequests()
        if (onRefresh) onRefresh()
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Failed to cancel leave request'
        if (onError) onError(errorMessage)
        console.error('Error cancelling leave request:', errorMessage)
      }
    } catch (error) {
      const errorMessage = `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      if (onError) onError(errorMessage)
      console.error('Error cancelling leave request:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewDetails = (request: LeaveRequest) => {
    if (onViewDetails) {
      onViewDetails(request)
    } else {
      setSelectedRequest(request)
      setShowDetails(true)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "cancelled": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected": return <XCircle className="w-4 h-4 text-red-600" />
      case "pending": return <Clock className="w-4 h-4 text-yellow-600" />
      case "cancelled": return <AlertCircle className="w-4 h-4 text-gray-600" />
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType) {
      case "annual": return "bg-blue-100 text-blue-800"
      case "sick": return "bg-red-100 text-red-800"
      case "personal": return "bg-purple-100 text-purple-800"
      case "maternity": return "bg-pink-100 text-pink-800"
      case "paternity": return "bg-indigo-100 text-indigo-800"
      case "unpaid": return "bg-gray-100 text-gray-800"
      case "other": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Leave Requests</h2>
          <p className="text-gray-600">Manage employee leave requests and approvals</p>
        </div>
        <Button onClick={fetchLeaveRequests} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search leave requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Leave Requests ({filteredRequests.length})</span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Pending: {leaveRequests.filter(r => r.status === 'pending').length}</span>
              <span>•</span>
              <span>Approved: {leaveRequests.filter(r => r.status === 'approved').length}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading leave requests...</span>
            </div>
          ) : (
            <>
            <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.employee_name}</p>
                        <p className="text-sm text-gray-500">{request.employee_department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getLeaveTypeColor(request.leave_type)}>
                        {request.leave_type_label}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.formatted_start_date}</TableCell>
                    <TableCell>{request.formatted_end_date}</TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <Badge className={getStatusColor(request.status)}>
                          {request.status_label}
                        </Badge>
                      </div>
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
                          <DropdownMenuItem onClick={() => handleViewDetails(request)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {request.status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApprove(request.id)}
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleReject(request.id)}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {request.can_be_cancelled && (
                            <DropdownMenuItem
                              onClick={() => handleCancel(request.id)}
                              className="text-gray-600"
                            >
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{request.employee_name}</p>
                      <p className="text-sm text-gray-500">{request.employee_department}</p>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status_label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getLeaveTypeColor(request.leave_type)}>
                      {request.leave_type_label}
                    </Badge>
                    <span className="text-sm text-gray-600">{request.days} day(s)</span>
                  </div>
                  <p className="text-sm">
                    {request.formatted_start_date} – {request.formatted_end_date}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewDetails(request)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {request.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-green-600"
                          onClick={() => handleApprove(request.id)}
                          disabled={actionLoading === request.id}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600"
                          onClick={() => handleReject(request.id)}
                          disabled={actionLoading === request.id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {request.can_be_cancelled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(request.id)}
                        disabled={actionLoading === request.id}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredRequests.length === 0 && (
                <p className="text-center text-gray-500 py-8">No leave requests found</p>
              )}
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Leave Request Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Detailed information about the leave request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee</label>
                  <p className="text-sm text-gray-900">{selectedRequest.employee_name}</p>
                  <p className="text-xs text-gray-500">{selectedRequest.employee_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Department</label>
                  <p className="text-sm text-gray-900">{selectedRequest.employee_department}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Leave Type</label>
                  <Badge className={getLeaveTypeColor(selectedRequest.leave_type)}>
                    {selectedRequest.leave_type_label}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedRequest.status)}
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status_label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Date</label>
                  <p className="text-sm text-gray-900">{selectedRequest.formatted_start_date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">End Date</label>
                  <p className="text-sm text-gray-900">{selectedRequest.formatted_end_date}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Duration</label>
                <p className="text-sm text-gray-900">{selectedRequest.days} days</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Reason</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {selectedRequest.reason}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Applied On</label>
                  <p className="text-sm text-gray-900">
                    {format(new Date(selectedRequest.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-sm text-gray-900">
                    {format(new Date(selectedRequest.updated_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
