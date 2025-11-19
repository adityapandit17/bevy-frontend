"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

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

interface LeaveRequestDetailsDialogProps {
  request: LeaveRequest | null
  isOpen: boolean
  onClose: () => void
  getEmployeeName: (id: string | number) => string
  getDepartmentName: (id: string | number | undefined) => string
  getLeaveStatusColor: (status: string | undefined) => string
}

export function LeaveRequestDetailsDialog({
  request,
  isOpen,
  onClose,
  getEmployeeName,
  getDepartmentName,
  getLeaveStatusColor,
}: LeaveRequestDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
        </DialogHeader>
        {request && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Employee</label>
                <p className="text-base font-semibold text-gray-900">
                  {getEmployeeName(request.employee_id)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Department</label>
                <p className="text-base text-gray-900">
                  {getDepartmentName(request.department_id)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Leave Type</label>
                <p className="text-base text-gray-900">
                  {request.leaveTypeLabel || request.leave_type_label || request.leaveType || request.leave_type || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge className={getLeaveStatusColor(request.status)}>
                    {request.statusLabel || request.status_label || request.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Start Date</label>
                <p className="text-base text-gray-900">
                  {(() => {
                    const startDateStr = request.startDate || request.start_date
                    const formattedStart = request.formattedStartDate || request.formatted_start_date
                    if (formattedStart) return formattedStart
                    if (startDateStr) return format(new Date(startDateStr), 'MMM dd, yyyy')
                    return 'N/A'
                  })()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">End Date</label>
                <p className="text-base text-gray-900">
                  {(() => {
                    const endDateStr = request.endDate || request.end_date
                    const formattedEnd = request.formattedEndDate || request.formatted_end_date
                    if (formattedEnd) return formattedEnd
                    if (endDateStr) return format(new Date(endDateStr), 'MMM dd, yyyy')
                    return 'N/A'
                  })()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Duration</label>
                <p className="text-base text-gray-900">
                  {request.days ? `${request.days} ${request.days === 1 ? 'day' : 'days'}` : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Employee ID</label>
                <p className="text-base text-gray-900">
                  {request.employee_id || 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Reason</label>
              <p className="text-base text-gray-900 mt-1">
                {request.reason || 'No reason provided'}
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

