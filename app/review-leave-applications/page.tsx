"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Search, RefreshCw, Eye, AlertCircle, ArrowLeft } from "lucide-react"
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

export default function ReviewLeaveApplicationsPage() {
  const router = useRouter()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              Review Leave Applications
            </h1>
            <p className="text-gray-600 mt-1">
              Pending leave requests from your direct reports requiring your approval
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
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
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pending</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{leaveRequests.length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Filtered Results</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{filteredRequests.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ready to Review</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{filteredRequests.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Pending Leave Requests</CardTitle>
                <CardDescription className="mt-1">
                  {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'} pending approval
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by employee name, leave type, or reason..."
                  className="pl-11 h-11 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Leave Requests Table */}
              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                  <p className="text-gray-600 font-medium">Loading leave requests...</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
                    <AlertCircle className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">No pending leave requests found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {searchTerm ? 'Try adjusting your search criteria' : 'All leave requests have been processed'}
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-semibold text-gray-700">Employee</TableHead>
                          <TableHead className="font-semibold text-gray-700">Department</TableHead>
                          <TableHead className="font-semibold text-gray-700">Leave Type</TableHead>
                          <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                          <TableHead className="font-semibold text-gray-700">Days</TableHead>
                          <TableHead className="font-semibold text-gray-700">Reason</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map((request, index) => (
                          <TableRow 
                            key={request.id}
                            className="hover:bg-blue-50/50 transition-colors border-b border-gray-100"
                          >
                            <TableCell className="font-medium text-gray-900 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                                  {(request.employee_name || 'E')[0].toUpperCase()}
                                </div>
                                <span>{request.employee_name || `Employee ${request.employee_id}`}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600 py-4">
                              <Badge variant="outline" className="font-normal">
                                {request.employee_department || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-700 py-4">
                              <span className="font-medium">
                                {request.leave_type_label || request.leave_type || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-600 py-4 text-sm">
                              {request.formatted_start_date && request.formatted_end_date
                                ? `${request.formatted_start_date} - ${request.formatted_end_date}`
                                : request.start_date && request.end_date
                                ? `${new Date(request.start_date).toLocaleDateString()} - ${new Date(request.end_date).toLocaleDateString()}`
                                : 'N/A'}
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge variant="secondary" className="font-semibold">
                                {request.days || request.duration_days || 0} day{(request.days || request.duration_days || 0) !== 1 ? 's' : ''}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs py-4">
                              <div className="truncate text-gray-600" title={request.reason || 'No reason provided'}>
                                {request.reason || 'No reason provided'}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge className={`${getStatusColor(request.status)} font-medium px-3 py-1`}>
                                {request.status_label || request.status || 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(request)}
                                  title="View Details"
                                  className="hover:bg-blue-100 hover:text-blue-700"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm"
                                  onClick={() => handleApprove(request.id)}
                                  disabled={actionLoading === request.id}
                                >
                                  {actionLoading === request.id ? (
                                    <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-1.5" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="shadow-sm"
                                  onClick={() => handleReject(request.id)}
                                  disabled={actionLoading === request.id}
                                >
                                  {actionLoading === request.id ? (
                                    <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4 mr-1.5" />
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
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  )
}

