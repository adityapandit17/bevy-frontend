/**
 * Utility functions for mapping leave request data between frontend and backend
 * Ensures consistent parameter naming conventions across the application
 */

export interface LeaveRequestFormData {
  type: string
  startDate: string
  endDate: string
  reason: string
  emergencyContact: string
  handoverNotes: string
  halfDay: boolean
  halfDayPeriod: string
}

export interface LeaveRequestBackendData {
  employee_id: number
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  status: string
  half_day: boolean
  half_day_period: string
  emergency_contact: string
  handover_notes: string
}

/**
 * Maps frontend form data to backend API format
 * Converts camelCase to snake_case and adds required fields
 */
export function mapLeaveRequestToBackend(
  formData: LeaveRequestFormData,
  employeeId: number,
  status: string = 'pending'
): { leave_request: LeaveRequestBackendData } {
  return {
    leave_request: {
      employee_id: employeeId,
      leave_type: formData.type,
      start_date: formData.startDate,
      end_date: formData.endDate,
      reason: formData.reason,
      status: status,
      half_day: formData.halfDay,
      half_day_period: formData.halfDayPeriod,
      emergency_contact: formData.emergencyContact,
      handover_notes: formData.handoverNotes
    }
  }
}

/**
 * Maps backend API response to frontend format
 * Converts snake_case to camelCase for consistent frontend usage
 */
export function mapLeaveRequestFromBackend(backendData: any): any {
  return {
    id: backendData.id,
    employeeId: backendData.employee_id,
    employeeName: backendData.employee_name,
    employeeEmail: backendData.employee_email,
    employeeDepartment: backendData.employee_department,
    leaveType: backendData.leave_type,
    leaveTypeLabel: backendData.leave_type_label,
    startDate: backendData.start_date,
    endDate: backendData.end_date,
    formattedStartDate: backendData.formatted_start_date,
    formattedEndDate: backendData.formatted_end_date,
    days: backendData.days,
    durationDays: backendData.duration_days,
    reason: backendData.reason,
    status: backendData.status,
    statusLabel: backendData.status_label,
    statusColor: backendData.status_color,
    isCurrent: backendData.is_current,
    isUpcoming: backendData.is_upcoming,
    isPast: backendData.is_past,
    canBeCancelled: backendData.can_be_cancelled,
    canBeModified: backendData.can_be_modified,
    halfDay: backendData.half_day,
    halfDayPeriod: backendData.half_day_period,
    halfDayPeriodLabel: backendData.half_day_period_label,
    emergencyContact: backendData.emergency_contact,
    handoverNotes: backendData.handover_notes,
    createdAt: backendData.created_at,
    updatedAt: backendData.updated_at
  }
}
