"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Search, RefreshCw, Eye, AlertCircle } from "lucide-react"
import { apiRequest, getApiUrl, getEndpointUrl } from "@/lib/api"
import { mapLeaveRequestFromBackend } from "@/lib/leave-request-mapper"
import { LeaveRequestDetailsDialog } from "@/components/attendance/leave-request-details-dialog"
import { toast } from "@/hooks/use-toast"

interface LeaveRequest {
  id: number
  employee_id: number
  employee_name?: string
  employee_email?: string
  employee_department?: string
  leave_type?: string
  leave_type_label?: string
  start_date?: string
  end_date?: string
  formatted_start_date?: string
  formatted_end_date?: string
  days?: number
  duration_days?: number
  reason?: string
  status?: string
  status_label?: string
}

interface ReviewLeaveApplicationsModalProps {
  isOpen: boolean
  onClose: () => void
  onRefresh?: () => void
}

export function ReviewLeaveApplicationsModal({
  isOpen,
  onClose,
  onRefresh,
}: ReviewLeaveApplicationsModalProps) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchLeaveRequests()
    }
  }, [isOpen])

  useEffect(() => {
    // Filter requests based on search term
    if (searchTerm.trim() === "") {
      setFilteredRequests(leaveRequests)
    } else {
      const filtered = leaveRequests.filter((request) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          request.employee_name?.toLowerCase().includes(searchLower) ||
          request.employee_email?.toLowerCase().includes(searchLower) ||
          request.leave_type_label?.toLowerCase().includes(searchLower) ||
          request.reason?.toLowerCase().includes(searchLower)
        )
      })
      setFilteredRequests(filtered)
    }
  }, [searchTerm, leaveRequests])

  const fetchLeaveRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('manager_pending', 'true')
      params.append('status', 'pending')
      const url = `${getEndpointUrl('LEAVE_REQUESTS')}?${params.toString()}`
      
      const res = await apiRequest<any[]>(url)
      const mappedRequests = Array.isArray(res) ? res.map((item) => {
        const mapped = mapLeaveRequestFromBackend(item)
        return {
          ...mapped,
          employee_id: mapped.employeeId || item.employee_id,
          employee_name: item.employee_name || `${item.employee?.first_name || ''} ${item.employee?.last_name || ''}`.trim(),
          employee_email: item.employee_email || item.employee?.email,
          employee_department: item.employee_department || item.employee?.department?.name,
          leave_type: mapped.leaveType || item.leave_type,
          leave_type_label: mapped.leaveTypeLabel || item.leave_type_label,
          start_date: mapped.startDate || item.start_date,
          end_date: mapped.endDate || item.end_date,
          formatted_start_date: mapped.formattedStartDate || item.formatted_start_date,
          formatted_end_date: mapped.formattedEndDate || item.formatted_end_date,
          status: mapped.status || item.status,
          status_label: mapped.statusLabel || item.status_label,
          days: mapped.days || item.days || item.duration_days,
        }
      }) : []
      setLeaveRequests(mappedRequests)
      setFilteredRequests(mappedRequests)
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      toast({
        title: "Error",
        description: "Failed to fetch leave requests. Please try again.",
        variant: "destructive",
      })
      setLeaveRequests([])
      setFilteredRequests([])
    } finally {
      setLoading(false)
    }
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
      // Refresh pending tasks count
      if (onRefresh) {
        onRefresh()
      }
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
      // Refresh pending tasks count
      if (onRefresh) {
        onRefresh()
      }
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

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setShowDetails(true)
  }

  const getStatusColor = (status: string | undefined) => {
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

  const getEmployeeName = (id: string | number) => {
    const request = leaveRequests.find(r => String(r.employee_id) === String(id))
    return request?.employee_name || `Employee ${id}`
  }

  const getDepartmentName = (id: string | number | undefined) => {
    const request = leaveRequests.find(r => String(r.employee_id) === String(id))
    return request?.employee_department || 'N/A'
  }

  const getLeaveStatusColor = (status: string | undefined) => {
    return getStatusColor(status)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Review Leave Applications
            </DialogTitle>
            <DialogDescription>
              Pending leave requests from your direct reports requiring your approval
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by employee name, leave type, or reason..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Leave Requests Table */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p>Loading leave requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No pending leave requests found.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.employee_name || `Employee ${request.employee_id}`}
                        </TableCell>
                        <TableCell>
                          {request.employee_department || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {request.leave_type_label || request.leave_type || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {request.formatted_start_date && request.formatted_end_date
                            ? `${request.formatted_start_date} - ${request.formatted_end_date}`
                            : request.start_date && request.end_date
                            ? `${new Date(request.start_date).toLocaleDateString()} - ${new Date(request.end_date).toLocaleDateString()}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {request.days || request.duration_days || 0} day{(request.days || request.duration_days || 0) !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {request.reason || 'No reason provided'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status_label || request.status || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(request)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApprove(request.id)}
                              disabled={actionLoading === request.id}
                            >
                              {actionLoading === request.id ? (
                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleReject(request.id)}
                              disabled={actionLoading === request.id}
                            >
                              {actionLoading === request.id ? (
                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-1" />
                              )}
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={fetchLeaveRequests}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Request Details Dialog */}
      {selectedRequest && (
        <LeaveRequestDetailsDialog
          request={selectedRequest}
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false)
            setSelectedRequest(null)
          }}
          getEmployeeName={getEmployeeName}
          getDepartmentName={getDepartmentName}
          getLeaveStatusColor={getLeaveStatusColor}
        />
      )}
    </>
  )
}

