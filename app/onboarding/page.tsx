"use client"

import { useState, useEffect } from "react"
import { getApiUrl, getEndpointUrl, API_ENDPOINTS } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  Plus,
  MoreHorizontal,
  Calendar,
  UserPlus,
  AlertCircle,
  CheckSquare,
  Square,
  Download,
  Eye,
  Send,
  MessageSquare,
} from "lucide-react"

interface OnboardingTask {
  id: number
  title: string
  description: string
  category: string
  is_completed: boolean | null
  due_date: string
  assigned_to: string
  priority: "low" | "medium" | "high"
  documents?: string[]
  overdue?: boolean
  due_soon?: boolean
  created_at: string
}

interface OnboardingEmployee {
  id: number
  employee_id: number
  name: string
  email: string
  position: string
  department: string
  start_date: string
  status: "pending" | "in_progress" | "completed"
  progress: number
  tasks: OnboardingTask[]
  notes?: string
  created_at: string
  updated_at: string
}

interface Department {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface OnboardingStats {
  active_onboarding: number
  completed_this_month: number
  completed_this_week: number
  total_onboarding: number
  pending_status: number
  in_progress_status: number
  completed_total: number
  pending_tasks: number
  completed_tasks: number
  total_tasks: number
  documents_pending: number
  overdue_tasks: number
  due_soon_tasks: number
}

export default function OnboardingPage() {
  const [employees, setEmployees] = useState<OnboardingEmployee[]>([])
  const [allOnboardingEmployees, setAllOnboardingEmployees] = useState<OnboardingEmployee[]>([])
  const [allEmployees, setAllEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [stats, setStats] = useState<OnboardingStats | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<OnboardingEmployee | null>(null)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: "",
    startDate: ""
  })
  
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false)
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    category: 'HR',
    priority: 'medium',
    due_date: '',
    assigned_to: 'HR Team'
  })
  const [selectedTask, setSelectedTask] = useState<OnboardingTask | null>(null)
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false)

  useEffect(() => {
    fetchOnboardingEmployees()
    fetchStats()
    fetchDepartments()
    fetchAllEmployees()
  }, [])

  useEffect(() => {
    fetchOnboardingEmployees()
  }, [showCompleted])

  // Update selected employee when allOnboardingEmployees changes
  useEffect(() => {
    if (selectedEmployee && allOnboardingEmployees.length > 0) {
      const updatedEmployee = allOnboardingEmployees.find(emp => emp.id === selectedEmployee.id)
      if (updatedEmployee && updatedEmployee.progress !== selectedEmployee.progress) {
        setSelectedEmployee(updatedEmployee)
      }
    }
  }, [allOnboardingEmployees, selectedEmployee])

  const fetchOnboardingEmployees = async () => {
    setLoading(true)
    try {
      const response = await fetch(getEndpointUrl('ONBOARDING_EMPLOYEES'))
      const data = await response.json()
      // Store all onboarding employees for duplicate checking
      setAllOnboardingEmployees(data)
      // Filter out completed employees by default for display
      const filteredData = showCompleted ? data : data.filter((emp: OnboardingEmployee) => emp.status !== 'completed')
      setEmployees(filteredData)
    } catch (error) {
      console.error('Error fetching onboarding employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(getEndpointUrl('ONBOARDING_EMPLOYEES_STATS'))
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch(getEndpointUrl('DEPARTMENTS'))
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchAllEmployees = async () => {
    try {
      const response = await fetch(getEndpointUrl('EMPLOYEES'))
      const data = await response.json()
      setAllEmployees(data)
    } catch (error) {
      console.error('Error fetching all employees:', error)
    }
  }

  // Generate dynamic stats from real data
  const onboardingStats = stats ? [
    {
      title: "Active Onboarding",
      value: (stats.active_onboarding || 0).toString(),
      change: `${stats.pending_status} pending, ${stats.in_progress_status} in progress`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed This Month",
      value: (stats.completed_this_month || 0).toString(),
      change: `${stats.completed_this_week} this week`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Tasks",
      value: (stats.pending_tasks || 0).toString(),
      change: `${stats.overdue_tasks} overdue, ${stats.due_soon_tasks} due soon`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Total Onboarding",
      value: (stats.total_onboarding || 0).toString(),
      change: `${stats.completed_total} completed`,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ] : [
    // Fallback stats when data is not loaded yet
    {
      title: "Active Onboarding",
      value: allOnboardingEmployees.filter(emp => emp.status !== 'completed').length.toString(),
      change: "Currently in progress",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed",
      value: allOnboardingEmployees.filter(emp => emp.status === 'completed').length.toString(),
      change: "Successfully onboarded",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Onboarding",
      value: allOnboardingEmployees.length.toString(),
      change: "All time records",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Status",
      value: allOnboardingEmployees.filter(emp => emp.status === 'pending').length.toString(),
      change: "Awaiting start",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
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

  const handleTaskToggle = async (employeeId: number, taskId: number) => {
    try {
      const response = await fetch(getApiUrl(`/onboarding_tasks/${taskId}/toggle`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // Refresh the data
        await fetchOnboardingEmployees()
        await fetchStats()
      }
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const handleAddEmployee = async () => {
    if (!formData.employeeId || !formData.startDate) {
      alert('Please select an employee and start date')
      return
    }

    try {
      const response = await fetch(getEndpointUrl('ONBOARDING_EMPLOYEES'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onboarding_employee: {
            employee_id: parseInt(formData.employeeId),
            start_date: formData.startDate,
            status: 'pending',
            progress: 0
          }
        })
      })

      if (response.ok) {
        // Reset form
        setFormData({
          employeeId: "",
          startDate: ""
        })
        setShowAddEmployee(false)
        // Refresh data
        fetchOnboardingEmployees()
        fetchStats()
        alert('Employee added to onboarding successfully!')
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.errors ? errorData.errors.join(', ') : 'Unknown error'
        
        if (errorMessage.includes('already in active onboarding process')) {
          alert('This employee is already in the onboarding process. Please select a different employee.')
        } else {
          alert(`Error adding employee: ${errorMessage}`)
        }
      }
    } catch (error) {
      console.error('Error adding employee:', error)
      alert('Error adding employee. Please try again.')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTask = async () => {
    if (!selectedEmployee) return
    
    try {
      const response = await fetch(getEndpointUrl('ONBOARDING_TASKS'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskFormData.title,
          description: taskFormData.description,
          category: taskFormData.category,
          priority: taskFormData.priority,
          due_date: taskFormData.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assigned_to: taskFormData.assigned_to,
          onboarding_employee_id: selectedEmployee.id
        })
      })
      
      if (response.ok) {
        await fetchOnboardingEmployees()
        await fetchStats()
        setAddTaskDialogOpen(false)
        setTaskFormData({
          title: '',
          description: '',
          category: 'HR',
          priority: 'medium',
          due_date: '',
          assigned_to: 'HR Team'
        })
      } else {
        console.error('Failed to add task:', await response.text())
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }
  
  const handleTaskInputChange = (field: string, value: string) => {
    setTaskFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleViewTaskDetails = (task: OnboardingTask) => {
    setSelectedTask(task)
    setTaskDetailsOpen(true)
  }

  const handleSendReminder = (task: OnboardingTask) => {
    // TODO: Implement send reminder functionality
    alert(`Reminder sent for task: ${task.title}`)
  }

  const handleSendWelcomeEmail = async () => {
    if (!selectedEmployee) return

    try {
      const response = await fetch(getApiUrl(`/onboarding_employees/${selectedEmployee.id}/send_welcome_email`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        alert('Welcome email has been queued and will be sent shortly!')
      } else {
        alert(`Failed to send welcome email: ${data.message}`)
      }
    } catch (error) {
      console.error('Error sending welcome email:', error)
      alert('Error sending welcome email. Please try again.')
    }
  }

  const handleUploadDocument = (task: OnboardingTask) => {
    // TODO: Implement upload document functionality
    alert(`Upload document for task: ${task.title}`)
  }

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Employee Onboarding</h1>
          <p className="text-gray-600">Manage new employee onboarding process and checklists</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm" onClick={() => setShowAddEmployee(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
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
          onboardingStats.map((stat, index) => (
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
          ))
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Onboarding Employees
            </CardTitle>
            <CardDescription>Employees currently in onboarding process</CardDescription>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={showCompleted ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowCompleted(!showCompleted)}
                >
                  {showCompleted ? "Hide Completed" : "Show Completed"}
                </Button>
                <span className="text-sm text-gray-500">
                  {showCompleted ? "Showing all employees" : "Showing active onboarding only"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4 rounded-lg border border-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))
              ) : (
                filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedEmployee?.id === employee.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  } ${employee.status === 'completed' ? 'opacity-75 bg-green-50' : ''}`}
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${employee.status === 'completed' ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                        {employee.name}
                      </h3>
                      {employee.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{employee.position}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{employee.department}</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={employee.status === 'completed' ? 100 : employee.progress} 
                        className={`w-16 h-2 ${employee.status === 'completed' ? 'bg-green-200' : ''}`} 
                      />
                      <span className={`text-xs font-medium ${employee.status === 'completed' ? 'text-green-600' : ''}`}>
                        {employee.status === 'completed' ? '100%' : `${employee.progress}%`}
                      </span>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Onboarding Checklist
            </CardTitle>
            <CardDescription>
              {selectedEmployee ? `${selectedEmployee.name} - ${selectedEmployee.position}` : "Select an employee to view their onboarding checklist"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEmployee ? (
              <div className="space-y-6">
                {/* Completion Banner */}
                {selectedEmployee.status === 'completed' && (
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h3 className="font-medium text-green-800">Onboarding Completed!</h3>
                        <p className="text-sm text-green-700">
                          {selectedEmployee.name} has successfully completed all onboarding tasks.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Employee Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Start Date</p>
                    <p className="text-sm text-gray-900">{selectedEmployee.start_date}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Department</p>
                    <p className="text-sm text-gray-900">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-sm text-gray-900">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Progress</p>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedEmployee.progress} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{selectedEmployee.progress}%</span>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Onboarding Tasks</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAddTaskDialogOpen(true)}
                      disabled={selectedEmployee?.status === 'completed'}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedEmployee.tasks && selectedEmployee.tasks.length > 0 ? selectedEmployee.tasks.map((task) => (
                      <div key={task.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={task.is_completed === true}
                              onChange={() => handleTaskToggle(selectedEmployee.id, task.id)}
                              className="mt-1 h-4 w-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer checked:bg-blue-600 checked:border-blue-600 appearance-none"
                            />
                            {task.is_completed === true && (
                              <div className="absolute top-1 left-0.5 text-white text-xs font-bold">
                                ✓
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-medium ${task.is_completed === true ? "line-through text-gray-500" : "text-gray-900"}`}>
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge className={getPriorityColor(task.priority)}>
                                  {task.priority}
                                </Badge>
                                {task.overdue && (
                                  <Badge className="bg-red-100 text-red-800">
                                    Overdue
                                  </Badge>
                                )}
                                {task.due_soon && !task.overdue && (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    Due Soon
                                  </Badge>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleViewTaskDetails(task)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSendReminder(task)}>
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      Send Reminder
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleUploadDocument(task)}>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload Document
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <p className={`text-sm mb-2 ${task.is_completed === true ? "text-gray-500" : "text-gray-600"}`}>
                              {task.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-4">
                                <span>Category: {task.category}</span>
                                <span>Assigned to: {task.assigned_to}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                <span>Due: {task.due_date}</span>
                              </div>
                            </div>
                            {task.documents && task.documents.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs font-medium text-gray-600 mb-2">Required Documents:</p>
                                <div className="flex flex-wrap gap-2">
                                  {task.documents.map((doc, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      <FileText className="w-3 h-3 mr-1" />
                                      {doc}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No tasks available for this employee.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSendWelcomeEmail}
                    disabled={selectedEmployee?.status === 'completed'}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Welcome Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Orientation
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Employee Selected</h3>
                <p className="text-gray-600">Select an employee from the list to view their onboarding checklist</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Employee to Onboarding</DialogTitle>
            <DialogDescription>
              Add a new employee to the onboarding process. This will create their onboarding checklist.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="employeeId">Select Employee *</Label>
              <select
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an employee to add to onboarding</option>
                {allEmployees
                  .filter(emp => {
                    // Filter out employees who have ever been in onboarding (any status)
                    const hasBeenOnboarded = allOnboardingEmployees.some(oe => 
                      oe.employee_id === emp.id
                    )
                    return !hasBeenOnboarded
                  })
                  .map((emp) => {
                    const department = departments.find(dept => dept.id === emp.department_id)
                    return (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} - {emp.designation} ({department?.name || 'Unknown Department'})
                      </option>
                    )
                  })}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only employees who have never been in onboarding are shown. Once an employee completes onboarding, they cannot be added again.
              </p>
            </div>
            <div>
              <Label htmlFor="startDate">Onboarding Start Date *</Label>
              <Input 
                id="startDate" 
                type="date" 
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used to calculate task due dates
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddEmployee(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee} disabled={loading}>
              {loading ? 'Adding...' : 'Add Employee'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={addTaskDialogOpen} onOpenChange={setAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Add a new onboarding task for {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={taskFormData.title}
                onChange={(e) => handleTaskInputChange('title', e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskFormData.description}
                onChange={(e) => handleTaskInputChange('description', e.target.value)}
                placeholder="Enter task description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={taskFormData.category} onValueChange={(value) => handleTaskInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Department">Department</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={taskFormData.priority} onValueChange={(value) => handleTaskInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={taskFormData.due_date}
                onChange={(e) => handleTaskInputChange('due_date', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Input
                id="assigned_to"
                value={taskFormData.assigned_to}
                onChange={(e) => handleTaskInputChange('assigned_to', e.target.value)}
                placeholder="Enter assignee name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={!taskFormData.title.trim()}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={taskDetailsOpen} onOpenChange={setTaskDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Task Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this onboarding task
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              {/* Task Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedTask.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedTask.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={selectedTask.is_completed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {selectedTask.is_completed ? "Completed" : "Pending"}
                  </Badge>
                </div>
              </div>

              {/* Task Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Category</Label>
                    <p className="text-sm text-gray-900">{selectedTask.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Priority</Label>
                    <p className="text-sm text-gray-900 capitalize">{selectedTask.priority}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Assigned To</Label>
                    <p className="text-sm text-gray-900">{selectedTask.assigned_to}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Due Date</Label>
                    <p className="text-sm text-gray-900">{selectedTask.due_date}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="flex items-center gap-2">
                      {selectedTask.overdue && (
                        <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                      )}
                      {selectedTask.due_soon && !selectedTask.overdue && (
                        <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Created</Label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedTask.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              {selectedTask.documents && (
                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-2 block">Documents</Label>
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <p className="text-sm text-gray-600">{selectedTask.documents}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleSendReminder(selectedTask)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Reminder
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleUploadDocument(selectedTask)}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 