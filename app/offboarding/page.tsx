"use client"

import React, { useState, useEffect } from "react"
import { getApiUrl, getEndpointUrl, API_ENDPOINTS, apiRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Calendar,
  User,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Laptop,
  Key,
  CreditCard,
  Shield,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Square,
  CalendarDays,
  UserMinus,
  LogOut,
  Briefcase,
  Mail,
  Phone,
} from "lucide-react"

interface OffboardingEmployee {
  id: number
  employeeId: number
  name: string
  email: string
  department: string
  position: string
  startDate: string
  lastWorkingDay: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  progress: number
  assignedTo: string
  notes: string
  daysRemaining: number
  overdue: boolean
  durationDays: number
  createdAt: string
  updatedAt: string
  tasks?: OffboardingTask[]
}

interface OffboardingTask {
  id: number
  offboardingEmployeeId: number
  title: string
  description: string
  category: string
  priority: "high" | "medium" | "low"
  dueDate: string
  assignedTo: string
  isCompleted: boolean
  completedDate?: string
  overdue: boolean
  dueSoon: boolean
  daysUntilDue: number
  statusLabel: string
  statusColor: string
  priorityColor: string
  categoryIcon: string
  priorityLabel: string
  dueDateFormatted: string
  completedDateFormatted?: string
  createdAt: string
  updatedAt: string
}

interface OffboardingStats {
  total_offboarding: number
  active_offboarding: number
  completed_offboarding: number
  pending_offboarding: number
  cancelled_offboarding: number
  avg_duration_days: number
  task_categories: Record<string, number>
  recent_activity: Array<{
    id: number
    title: string
    employeeName: string
    completedDate: string
    category: string
  }>
}

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  department?: {
    id: number
    name: string
  }
  designation: string
}

interface OffboardingFormData {
  employeeId: string
  lastWorkingDay: string
  reason: string
  assignedTo: string
  notes: string
}

export default function OffboardingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [offboardingEmployees, setOffboardingEmployees] = useState<OffboardingEmployee[]>([])
  const [allOffboardingEmployees, setAllOffboardingEmployees] = useState<OffboardingEmployee[]>([])
  const [offboardingTasks, setOffboardingTasks] = useState<OffboardingTask[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [stats, setStats] = useState<OffboardingStats | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<OffboardingEmployee | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editEmployee, setEditEmployee] = useState<OffboardingEmployee | null>(null)
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState<OffboardingFormData>({
    employeeId: "",
    lastWorkingDay: "",
    reason: "",
    assignedTo: "",
    notes: ""
  })
  const [formErrors, setFormErrors] = useState<Partial<OffboardingFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    fetchOffboardingEmployees()
    fetchOffboardingTasks()
    fetchDepartments()
    fetchStats()
    fetchEmployees()
  }, [])

  // Update selected employee when allOffboardingEmployees changes
  useEffect(() => {
    if (selectedEmployee && Array.isArray(allOffboardingEmployees) && allOffboardingEmployees.length > 0) {
      const updatedEmployee = allOffboardingEmployees.find(emp => emp.id === selectedEmployee.id)
      if (updatedEmployee && updatedEmployee.progress !== selectedEmployee.progress) {
        setSelectedEmployee(updatedEmployee)
      }
    }
  }, [allOffboardingEmployees, selectedEmployee])

  const fetchOffboardingEmployees = async () => {
    setLoading(true)
    try {
      const data = await apiRequest<any[]>(getEndpointUrl('OFFBOARDING_EMPLOYEES'))
      const employeesArray = Array.isArray(data) ? data : []
      setAllOffboardingEmployees(employeesArray)
      setOffboardingEmployees(employeesArray)
    } catch (error) {
      console.error('Error fetching offboarding employees:', error)
      setAllOffboardingEmployees([])
      setOffboardingEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const fetchOffboardingTasks = async () => {
    try {
      const data = await apiRequest<any[]>(getEndpointUrl('OFFBOARDING_TASKS'))
      setOffboardingTasks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching offboarding tasks:', error)
      setOffboardingTasks([])
    }
  }

  const fetchDepartments = async () => {
    try {
      const data = await apiRequest<any[]>(getEndpointUrl('DEPARTMENTS'))
      setDepartments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([])
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiRequest<OffboardingStats>(getEndpointUrl('OFFBOARDING_EMPLOYEES_STATS'))
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const data = await apiRequest<Employee[]>(getEndpointUrl('EMPLOYEES'))
      const employeesArray = Array.isArray(data) ? data : []
      // Filter out employees who are already in offboarding
      const offboardingEmployeeIds = Array.isArray(offboardingEmployees) ? offboardingEmployees.map(oe => oe.employeeId) : []
      const availableEmployees = employeesArray.filter((employee: Employee) => 
        !offboardingEmployeeIds.includes(employee.id)
      )
      setEmployees(availableEmployees)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    }
  }

  const handleTaskToggle = async (employeeId: number, taskId: number) => {
    try {
      await apiRequest(getApiUrl(`/offboarding_tasks/${taskId}/toggle`), {
        method: 'PATCH',
      })
      
      // Refresh the data
      await fetchOffboardingEmployees()
      await fetchOffboardingTasks()
      await fetchStats()
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  // Form handling functions
  const validateForm = (): boolean => {
    const errors: Partial<OffboardingFormData> = {}
    
    if (!editEmployee && !formData.employeeId) {
      errors.employeeId = "Employee is required"
    }
    if (!formData.lastWorkingDay) {
      errors.lastWorkingDay = "Last working day is required"
    }
    if (!editEmployee && !formData.reason) {
      errors.reason = "Reason is required"
    }
    if (!formData.assignedTo) {
      errors.assignedTo = "Assigned to is required"
    }
    
    // Validate last working day is in the future (only for new entries, allow past dates for edits)
    if (!editEmployee && formData.lastWorkingDay && new Date(formData.lastWorkingDay) <= new Date()) {
      errors.lastWorkingDay = "Last working day must be in the future"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof OffboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitError(null) // Clear any previous errors
    
    try {
      const newOffboardingEmployee = await apiRequest(getEndpointUrl('OFFBOARDING_EMPLOYEES'), {
        method: 'POST',
        body: JSON.stringify({
          offboarding_employee: {
            employee_id: parseInt(formData.employeeId),
            last_working_day: formData.lastWorkingDay,
            status: 'pending',
            assigned_to: formData.assignedTo,
            notes: formData.notes
          }
        })
      })
      
      // Reset form
      setFormData({
        employeeId: "",
        lastWorkingDay: "",
        reason: "",
        assignedTo: "",
        notes: ""
      })
      setFormErrors({})
      setShowAddDialog(false)
      
      // Refresh data to get updated lists
      await fetchOffboardingEmployees()
      await fetchOffboardingTasks()
      await fetchStats()
      await fetchEmployees() // Refresh available employees list
      
      // Small delay to ensure backend has processed task creation
      setTimeout(async () => {
        await fetchOffboardingTasks()
      }, 500)
      
      // Show success message (you could add a toast notification here)
      console.log('Offboarding process started successfully', newOffboardingEmployee)
    } catch (error: any) {
      console.error('Error submitting form:', error)
      // Display user-friendly error messages
      if (error?.message) {
        setSubmitError(error.message)
      } else {
        setSubmitError('Network error. Please check your connection and try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      employeeId: "",
      lastWorkingDay: "",
      reason: "",
      assignedTo: "",
      notes: ""
    })
    setFormErrors({})
    setSubmitError(null)
    setEditEmployee(null)
    setShowAddDialog(false)
  }

  // Generate dynamic stats from real data
  const offboardingStats = stats ? [
    {
      title: "Active Offboarding",
      value: (stats.active_offboarding || 0).toString(),
      change: `${stats.pending_offboarding || 0} pending`,
      icon: UserMinus,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completed",
      value: (stats.completed_offboarding || 0).toString(),
      change: `${stats.cancelled_offboarding || 0} cancelled`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending",
      value: (stats.pending_offboarding || 0).toString(),
      change: "This month",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Avg. Duration",
      value: `${stats.avg_duration_days || 0} days`,
      change: "Average completion time",
      icon: CalendarDays,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ] : [
    // Fallback stats when data is not loaded yet
    {
      title: "Active Offboarding",
      value: Array.isArray(allOffboardingEmployees) ? allOffboardingEmployees.filter(emp => emp.status !== 'completed').length.toString() : "0",
      change: "Currently in progress",
      icon: UserMinus,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completed",
      value: Array.isArray(allOffboardingEmployees) ? allOffboardingEmployees.filter(emp => emp.status === 'completed').length.toString() : "0",
      change: "Successfully offboarded",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending",
      value: Array.isArray(allOffboardingEmployees) ? allOffboardingEmployees.filter(emp => emp.status === 'pending').length.toString() : "0",
      change: "Awaiting start",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Total Offboarding",
      value: Array.isArray(allOffboardingEmployees) ? allOffboardingEmployees.length.toString() : "0",
      change: "All time records",
      icon: CalendarDays,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  // Generate dynamic task categories from real data
  const taskCategories = Array.isArray(offboardingTasks) && offboardingTasks.length > 0 ? [
    {
      category: "Equipment",
      icon: Laptop,
      color: "bg-blue-100 text-blue-600",
      count: offboardingTasks.filter(task => task.category.toLowerCase() === 'equipment').length,
    },
    {
      category: "HR",
      icon: Users,
      color: "bg-green-100 text-green-600",
      count: offboardingTasks.filter(task => task.category.toLowerCase() === 'hr').length,
    },
    {
      category: "Knowledge Transfer",
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
      count: offboardingTasks.filter(task => task.category.toLowerCase() === 'knowledge transfer').length,
    },
    {
      category: "Benefits",
      icon: Shield,
      color: "bg-orange-100 text-orange-600",
      count: offboardingTasks.filter(task => task.category.toLowerCase() === 'benefits').length,
    },
  ] : [
    // Fallback categories when data is not loaded yet
    {
      category: "Equipment",
      icon: Laptop,
      color: "bg-blue-100 text-blue-600",
      count: 0,
    },
    {
      category: "HR",
      icon: Users,
      color: "bg-green-100 text-green-600",
      count: 0,
    },
    {
      category: "Knowledge Transfer",
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
      count: 0,
    },
    {
      category: "Benefits",
      icon: Shield,
      color: "bg-orange-100 text-orange-600",
      count: 0,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredEmployees = Array.isArray(offboardingEmployees) ? offboardingEmployees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || employee.status === filterStatus
    const matchesDepartment = filterDepartment === "all" || employee.department === filterDepartment
    return matchesSearch && matchesStatus && matchesDepartment
  }) : []

  const getEmployeeTasks = (employeeId: number) => {
    return Array.isArray(offboardingTasks) ? offboardingTasks.filter(task => task.offboardingEmployeeId === employeeId) : []
  }

  const handleViewDetails = async (employee: OffboardingEmployee) => {
    setSelectedEmployee(employee)
    // Ensure we have the latest tasks for this employee
    await fetchOffboardingTasks()
  }

  const handleEdit = (employee: OffboardingEmployee) => {
    setEditEmployee(employee)
    setFormData({
      employeeId: employee.employeeId.toString(),
      lastWorkingDay: employee.lastWorkingDay.split('T')[0], // Format date for input
      reason: "",
      assignedTo: employee.assignedTo || "",
      notes: employee.notes || ""
    })
    setFormErrors({})
    setSubmitError(null)
    setShowAddDialog(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editEmployee) return
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      await apiRequest(`${getEndpointUrl('OFFBOARDING_EMPLOYEES')}/${editEmployee.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          offboarding_employee: {
            last_working_day: formData.lastWorkingDay,
            assigned_to: formData.assignedTo,
            notes: formData.notes
          }
        })
      })
      
      // Reset form and close dialog
      setFormData({
        employeeId: "",
        lastWorkingDay: "",
        reason: "",
        assignedTo: "",
        notes: ""
      })
      setFormErrors({})
      setEditEmployee(null)
      setShowAddDialog(false)
      
      // Refresh data
      await fetchOffboardingEmployees()
      await fetchOffboardingTasks()
      await fetchStats()
    } catch (error: any) {
      console.error('Error updating form:', error)
      if (error?.message) {
        setSubmitError(error.message)
      } else {
        setSubmitError('Network error. Please check your connection and try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Employee Offboarding</h1>
          <p className="text-gray-600">Manage employee exit process and ensure smooth transitions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open)
            if (!open) {
              setEditEmployee(null)
              setFormData({
                employeeId: "",
                lastWorkingDay: "",
                reason: "",
                assignedTo: "",
                notes: ""
              })
              setFormErrors({})
              setSubmitError(null)
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => {
                setEditEmployee(null)
                setShowAddDialog(true)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Start Offboarding
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editEmployee ? 'Edit Offboarding Employee' : 'Start Employee Offboarding'}</DialogTitle>
                <DialogDescription>
                  {editEmployee ? 'Update the offboarding details for this employee.' : 'Initiate the offboarding process for an employee.'}
                </DialogDescription>
              </DialogHeader>
              
              {/* Error Display */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={editEmployee ? handleUpdate : handleSubmit} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="employee" className="text-right text-sm font-medium">
                      Employee *
                    </label>
                    <div className="col-span-3">
                      <Select
                        value={formData.employeeId}
                        onValueChange={(value) => handleInputChange('employeeId', value)}
                        disabled={!!editEmployee}
                      >
                        <SelectTrigger className={formErrors.employeeId ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.length > 0 ? (
                            employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.first_name} {employee.last_name} - {employee.email}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-gray-500 text-center">
                              No employees available for offboarding
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {formErrors.employeeId && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.employeeId}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="last-working-day" className="text-right text-sm font-medium">
                      Last Working Day *
                    </label>
                    <div className="col-span-3">
                      <Input
                        id="last-working-day"
                        type="date"
                        value={formData.lastWorkingDay}
                        onChange={(e) => handleInputChange('lastWorkingDay', e.target.value)}
                        className={formErrors.lastWorkingDay ? 'border-red-500' : ''}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {formErrors.lastWorkingDay && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.lastWorkingDay}</p>
                      )}
                    </div>
                  </div>
                  
                  {!editEmployee && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="reason" className="text-right text-sm font-medium">
                        Reason *
                      </label>
                      <div className="col-span-3">
                        <Select
                          value={formData.reason}
                          onValueChange={(value) => handleInputChange('reason', value)}
                        >
                          <SelectTrigger className={formErrors.reason ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="resignation">Resignation</SelectItem>
                            <SelectItem value="termination">Termination</SelectItem>
                            <SelectItem value="retirement">Retirement</SelectItem>
                            <SelectItem value="contract-end">Contract End</SelectItem>
                            <SelectItem value="personal">Personal Reasons</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.reason && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.reason}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="assigned-to" className="text-right text-sm font-medium">
                      Assigned To *
                    </label>
                    <div className="col-span-3">
                      <Select
                        value={formData.assignedTo}
                        onValueChange={(value) => handleInputChange('assignedTo', value)}
                      >
                        <SelectTrigger className={formErrors.assignedTo ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hr">HR Manager</SelectItem>
                          <SelectItem value="manager">Direct Manager</SelectItem>
                          <SelectItem value="it">IT Department</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.assignedTo && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.assignedTo}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="notes" className="text-right text-sm font-medium">
                      Notes
                    </label>
                    <div className="col-span-3">
                      <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Additional notes or special instructions"
                        className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? (editEmployee ? 'Updating...' : 'Starting...') 
                      : (editEmployee ? 'Update Offboarding' : 'Start Offboarding')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          offboardingStats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Task Categories Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          taskCategories.map((category) => (
            <Card key={category.category} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <category.icon className="w-4 h-4" />
                  </div>
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{category.count}</span>
                  <span className="text-sm text-gray-500">tasks</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserMinus className="w-5 h-5" />
            Offboarding Employees
          </CardTitle>
          <CardDescription>
            Total {offboardingEmployees.length} employees • {filteredEmployees.length} showing
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <Building className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {Array.isArray(departments) && departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employees Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Last Working Day</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-2 bg-gray-200 rounded w-full"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-8 bg-gray-200 rounded w-8"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {employee.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{employee.name}</p>
                            <p className="text-sm text-gray-600">{employee.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{employee.department}</p>
                          <p className="text-sm text-gray-600">{employee.position}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(employee.lastWorkingDay).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{employee.progress}%</span>
                            <span className="text-gray-600">
                              {getEmployeeTasks(employee.id).filter(t => t.isCompleted).length}/{getEmployeeTasks(employee.id).length}
                            </span>
                          </div>
                          <Progress value={employee.progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{employee.assignedTo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(employee)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(employee)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Cancel Offboarding
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

      {/* Employee Details Dialog */}
      {selectedEmployee && (
        <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserMinus className="w-5 h-5" />
                Offboarding Details - {selectedEmployee.name}
              </DialogTitle>
              <DialogDescription>
                Manage offboarding tasks and progress for {selectedEmployee.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Employee Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employee Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Employee ID</p>
                      <p className="text-gray-900">{selectedEmployee.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Department</p>
                      <p className="text-gray-900">{selectedEmployee.department}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Position</p>
                      <p className="text-gray-900">{selectedEmployee.position}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Working Day</p>
                      <p className="text-gray-900">{new Date(selectedEmployee.lastWorkingDay).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Assigned To</p>
                      <p className="text-gray-900">{selectedEmployee.assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <Badge className={getStatusColor(selectedEmployee.status)}>
                        {selectedEmployee.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  {selectedEmployee.notes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600">Notes</p>
                      <p className="text-gray-900">{selectedEmployee.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                      <span className="text-2xl font-bold text-gray-900">{selectedEmployee.progress}%</span>
                    </div>
                    <Progress value={selectedEmployee.progress} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{getEmployeeTasks(selectedEmployee.id).filter(t => t.isCompleted).length} completed</span>
                      <span>{getEmployeeTasks(selectedEmployee.id).length} total tasks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Offboarding Tasks</CardTitle>
                  <CardDescription>
                    Complete all required tasks for a smooth offboarding process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getEmployeeTasks(selectedEmployee.id).map((task) => (
                      <div key={task.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTaskToggle(selectedEmployee.id, task.id)}
                          className="mt-1"
                        >
                          {task.isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className={`font-medium ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                {task.title}
                              </h4>
                              <p className={`text-sm mt-1 ${task.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                                {task.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <Badge variant="outline">{task.category}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Due: {task.dueDateFormatted}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{task.assignedTo}</span>
                              </div>
                            </div>
                            {task.isCompleted && task.completedDateFormatted && (
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Completed {task.completedDateFormatted}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}