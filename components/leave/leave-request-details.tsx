"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  User,
  Building,
  Phone,
  FileText,
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

interface LeaveRequestDetailsProps {
  request: LeaveRequest | null
  isOpen: boolean
  onClose: () => void
  onApprove?: (requestId: number) => void
  onReject?: (requestId: number) => void
  onCancel?: (requestId: number) => void
  actionLoading?: boolean
  showActions?: boolean
}

export function LeaveRequestDetails({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onCancel,
  actionLoading = false,
  showActions = true
}: LeaveRequestDetailsProps) {
  if (!request) return null

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Leave Request Details
          </DialogTitle>
          <DialogDescription>
            Complete information about the leave request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{request.employee_name}</h3>
              <p className="text-sm text-gray-500">{request.employee_email}</p>
            </div>
            <Badge variant={getStatusBadgeVariant(request.status)} className="flex items-center gap-1">
              {getStatusIcon(request.status)}
              {request.status_label}
            </Badge>
          </div>

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-sm font-semibold">{request.employee_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-sm">{request.employee_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-sm flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {request.employee_department}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee ID</label>
                  <p className="text-sm font-mono">#{request.employee_id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Leave Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Leave Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Leave Type</label>
                  <p className="text-sm font-semibold">{request.leave_type_label}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="text-sm">
                    {request.duration_days} day{request.duration_days !== 1 ? 's' : ''}
                    {request.half_day && (
                      <span className="text-gray-500 ml-1">
                        ({request.half_day_period_label})
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <p className="text-sm">{request.formatted_start_date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">End Date</label>
                  <p className="text-sm">{request.formatted_end_date}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reason and Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Reason & Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Reason for Leave</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{request.reason}</p>
                </div>
              </div>

              {request.emergency_contact && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Emergency Contact
                  </label>
                  <p className="text-sm mt-1">{request.emergency_contact}</p>
                </div>
              )}

              {request.handover_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Handover Notes</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{request.handover_notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Applied On</label>
                  <p className="text-sm">
                    {format(new Date(request.created_at), 'EEEE, MMMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(request.created_at), 'HH:mm:ss')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm">
                    {format(new Date(request.updated_at), 'EEEE, MMMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(request.updated_at), 'HH:mm:ss')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {showActions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
                <CardDescription>
                  Available actions for this leave request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {request.status === 'pending' && onApprove && (
                    <Button
                      onClick={() => onApprove(request.id)}
                      disabled={actionLoading}
                      className="flex items-center gap-2"
                    >
                      {actionLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Approve Leave
                    </Button>
                  )}
                  
                  {request.status === 'pending' && onReject && (
                    <Button
                      variant="destructive"
                      onClick={() => onReject(request.id)}
                      disabled={actionLoading}
                      className="flex items-center gap-2"
                    >
                      {actionLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      Reject Leave
                    </Button>
                  )}
                  
                  {request.can_be_cancelled && request.status !== 'cancelled' && onCancel && (
                    <Button
                      variant="outline"
                      onClick={() => onCancel(request.id)}
                      disabled={actionLoading}
                      className="flex items-center gap-2"
                    >
                      {actionLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      Cancel Leave
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

