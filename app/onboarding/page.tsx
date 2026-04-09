"use client"

import React, { useState, useEffect } from "react"
import { getApiUrl, getEndpointUrl, API_ENDPOINTS, apiRequest } from "@/lib/api"
import { AUTH_CONFIG } from "@/config/auth.config"
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
import { DatePicker } from "@/components/ui/date-picker"
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
  X,
  Loader2,
  Trash2,
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
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadTask, setUploadTask] = useState<OnboardingTask | null>(null)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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
    if (selectedEmployee && Array.isArray(allOnboardingEmployees) && allOnboardingEmployees.length > 0) {
      const updatedEmployee = allOnboardingEmployees.find(emp => emp.id === selectedEmployee.id)
      if (updatedEmployee) {
        setSelectedEmployee(updatedEmployee)
      }
    }
  }, [allOnboardingEmployees])

  const fetchOnboardingEmployees = async () => {
    setLoading(true)
    try {
      const endpointUrl = getEndpointUrl('ONBOARDING_EMPLOYEES')
      console.log('Fetching onboarding employees from:', endpointUrl)
      const data = await apiRequest<OnboardingEmployee[]>(endpointUrl)
      console.log('Fetched onboarding employees data:', data)
      console.log('Data type:', typeof data, 'Is array:', Array.isArray(data))
      
      // Handle different response formats
      let employeesArray: OnboardingEmployee[] = []
      if (Array.isArray(data)) {
        employeesArray = data
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        // Handle paginated response
        employeesArray = (data as any).data
      } else if (data && typeof data === 'object') {
        // Try to extract array from object
        const keys = Object.keys(data)
        const arrayKey = keys.find(key => Array.isArray((data as any)[key]))
        if (arrayKey) {
          employeesArray = (data as any)[arrayKey]
        }
      }
      
      console.log('Processed employees array:', employeesArray, 'Length:', employeesArray.length)
      
      // Validate and clean the data
      employeesArray = employeesArray.filter((emp: any) => {
        const isValid = emp && typeof emp === 'object' && emp.id !== undefined
        if (!isValid) {
          console.warn('Invalid employee data:', emp)
        }
        return isValid
      })
      
      // Store all onboarding employees for duplicate checking
      setAllOnboardingEmployees(employeesArray)
      // Filter out completed employees by default for display
      const filteredData = showCompleted 
        ? employeesArray 
        : employeesArray.filter((emp: OnboardingEmployee) => emp.status !== 'completed')
      console.log('Filtered employees:', filteredData, 'Length:', filteredData.length)
      setEmployees(filteredData)
    } catch (error) {
      console.error('Error fetching onboarding employees:', error)
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      setAllOnboardingEmployees([])
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiRequest<OnboardingStats>(getEndpointUrl('ONBOARDING_EMPLOYEES_STATS'))
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const data = await apiRequest<Department[]>(getEndpointUrl('DEPARTMENTS'))
      setDepartments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([])
    }
  }

  const fetchAllEmployees = async () => {
    try {
      // Employees endpoint returns paginated response, so request a high per_page value
      const response = await apiRequest<any>(`${getApiUrl('employees')}?page=1&per_page=1000`, {
        method: "GET"
      })
      console.log('Fetched all employees response:', response)
      
      // Handle paginated response or direct array
      let employeesData: any[] = []
      if (Array.isArray(response)) {
        employeesData = response
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        employeesData = response.data
      } else if (response && typeof response === 'object') {
        // Try to find array in response
        const keys = Object.keys(response)
        const arrayKey = keys.find(key => Array.isArray((response as any)[key]))
        if (arrayKey) {
          employeesData = (response as any)[arrayKey]
        }
      }
      
      console.log('Processed all employees:', employeesData, 'Length:', employeesData.length)
      setAllEmployees(employeesData)
    } catch (error) {
      console.error('Error fetching all employees:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
      }
      setAllEmployees([])
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
      value: Array.isArray(allOnboardingEmployees) ? allOnboardingEmployees.filter(emp => emp.status !== 'completed').length.toString() : "0",
      change: "Currently in progress",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed",
      value: Array.isArray(allOnboardingEmployees) ? allOnboardingEmployees.filter(emp => emp.status === 'completed').length.toString() : "0",
      change: "Successfully onboarded",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Onboarding",
      value: Array.isArray(allOnboardingEmployees) ? allOnboardingEmployees.length.toString() : "0",
      change: "All time records",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Status",
      value: Array.isArray(allOnboardingEmployees) ? allOnboardingEmployees.filter(emp => emp.status === 'pending').length.toString() : "0",
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
      await apiRequest(getApiUrl(`/onboarding_tasks/${taskId}/toggle`), {
        method: 'PATCH',
      })
      
      // Refresh the data
      await fetchOnboardingEmployees()
      await fetchStats()
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
      await apiRequest(getEndpointUrl('ONBOARDING_EMPLOYEES'), {
        method: 'POST',
        body: JSON.stringify({
          onboarding_employee: {
            employee_id: parseInt(formData.employeeId),
            start_date: formData.startDate,
            status: 'pending',
            progress: 0
          }
        })
      })

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
    } catch (error: any) {
      console.error('Error adding employee:', error)
      const errorMessage = error?.message || 'Unknown error'
      
      if (errorMessage.includes('already in active onboarding process')) {
        alert('This employee is already in the onboarding process. Please select a different employee.')
      } else {
        alert(`Error adding employee: ${errorMessage}`)
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTask = async () => {
    if (!selectedEmployee) return
    
    try {
      await apiRequest(getEndpointUrl('ONBOARDING_TASKS'), {
        method: 'POST',
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
      const data = await apiRequest<any>(getApiUrl(`/onboarding_employees/${selectedEmployee.id}/send_welcome_email`), {
        method: 'POST',
      })

      if (data.success) {
        alert('Welcome email has been queued and will be sent shortly!')
      } else {
        alert(`Failed to send welcome email: ${data.message || 'Unknown error'}`)
      }
    } catch (error: any) {
      console.error('Error sending welcome email:', error)
      alert(`Error sending welcome email: ${error?.message || 'Please try again.'}`)
    }
  }

  const handleUploadDocument = (task: OnboardingTask) => {
    setUploadTask(task)
    setUploadDialogOpen(true)
  }

  const uploadFileToServer = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    // Get authorization token
    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_CONFIG.tokenKey) : null
    
    // Prepare headers - don't set Content-Type for FormData (browser will set it with boundary)
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    try {
      const response = await fetch(getEndpointUrl('UPLOAD'), {
        method: 'POST',
        headers,
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
      
      const result = await response.json()
      return result.url || result.path
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Reset input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    if (files.length === 0) return

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach((file) => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only PDF and Word documents are allowed.`)
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > maxSize) {
        errors.push(`${file.name}: File size too large. Maximum size is 5MB.`)
        return
      }
      
      validFiles.push(file)
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      setUploadFiles(prev => [...prev, ...validFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDeleteDocument = async (task: OnboardingTask, documentIndex: number) => {
    if (!task.documents || !Array.isArray(task.documents) || task.documents.length === 0) return
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      // Get current documents array
      const currentDocuments = [...task.documents]
      // Remove the document at the specified index
      currentDocuments.splice(documentIndex, 1)
      
      // Update the task with the updated documents list
      await apiRequest(getApiUrl(`/onboarding_tasks/${task.id}`), {
        method: 'PATCH',
        body: JSON.stringify({
          onboarding_task: {
            documents: currentDocuments.join(', ')
          }
        })
      })
      
      // Refresh the data
      await fetchOnboardingEmployees()
      await fetchStats()
      
      alert('Document deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting document:', error)
      alert(`Error deleting document: ${error?.message || 'Please try again.'}`)
    }
  }

  const handleConfirmUpload = async () => {
    if (!uploadTask || uploadFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress({})
    
    try {
      const uploadedUrls: string[] = []
      const errors: string[] = []

      // Upload all files
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i]
        const fileKey = `${file.name}-${i}`
        
        try {
          setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }))
          
          // Upload the file
          const documentUrl = await uploadFileToServer(file)
          uploadedUrls.push(documentUrl)
          
          setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }))
        } catch (error: any) {
          console.error(`Error uploading ${file.name}:`, error)
          errors.push(`${file.name}: ${error?.message || 'Upload failed'}`)
          setUploadProgress(prev => ({ ...prev, [fileKey]: -1 })) // -1 indicates error
        }
      }

      if (uploadedUrls.length === 0) {
        alert(`Failed to upload any documents:\n${errors.join('\n')}`)
        setIsUploading(false)
        return
      }

      // Get current documents array
      const currentDocuments = uploadTask.documents || []
      const updatedDocuments = [...currentDocuments, ...uploadedUrls]
      
      // Update the task with all new documents
      await apiRequest(getApiUrl(`/onboarding_tasks/${uploadTask.id}`), {
        method: 'PATCH',
        body: JSON.stringify({
          onboarding_task: {
            documents: updatedDocuments.join(', ')
          }
        })
      })
      
      // Refresh the data
      await fetchOnboardingEmployees()
      await fetchStats()
      
      // Reset state
      setUploadFiles([])
      setUploadTask(null)
      setUploadDialogOpen(false)
      setUploadProgress({})
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      const successMsg = uploadedUrls.length === uploadFiles.length
        ? `Successfully uploaded ${uploadedUrls.length} document(s)!`
        : `Uploaded ${uploadedUrls.length} of ${uploadFiles.length} document(s).\n\nErrors:\n${errors.join('\n')}`
      
      alert(successMsg)
    } catch (error: any) {
      console.error('Error uploading documents:', error)
      alert(`Error uploading documents: ${error?.message || 'Please try again.'}`)
    } finally {
      setIsUploading(false)
      setUploadProgress({})
    }
  }

  const filteredEmployees = Array.isArray(employees) ? employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

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
              ) : filteredEmployees.length > 0 ? (
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {searchTerm ? 'No employees found' : showCompleted ? 'No onboarding employees' : 'No active onboarding employees'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {searchTerm 
                      ? 'Try adjusting your search terms' 
                      : showCompleted 
                        ? 'No employees have been added to onboarding yet' 
                        : 'All employees have completed onboarding or no employees are in progress'}
                  </p>
                </div>
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
                              <div className="absolute top-1 left-0.5 text-white text-xs font-bold pointer-events-none">
                                ✓
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 
                                className={`font-medium cursor-pointer ${task.is_completed === true ? "line-through text-gray-500" : "text-gray-900"}`}
                                onClick={() => handleTaskToggle(selectedEmployee.id, task.id)}
                              >
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
                            {task.documents && Array.isArray(task.documents) && task.documents.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs font-medium text-gray-600 mb-2">Required Documents:</p>
                                <div className="flex flex-wrap gap-2">
                                  {task.documents.map((doc, index) => (
                                    <Badge key={index} variant="outline" className="text-xs flex items-center gap-1 pr-0.5">
                                      <FileText className="w-3 h-3" />
                                      <span className="max-w-[200px] truncate">{doc}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteDocument(task, index)
                                        }}
                                        className="h-5 w-5 p-0 hover:bg-red-50 hover:text-red-600 ml-0.5 -mr-0.5"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
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
              <Select
                value={formData.employeeId}
                onValueChange={(value) => handleInputChange('employeeId', value)}
              >
                <SelectTrigger id="employeeId" className="w-full">
                  <SelectValue placeholder="Select an employee to add to onboarding" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const availableEmployees = Array.isArray(allEmployees) 
                      ? allEmployees.filter(emp => {
                          // Filter out employees who have ever been in onboarding (any status)
                          const hasBeenOnboarded = Array.isArray(allOnboardingEmployees) && allOnboardingEmployees.some(oe => 
                            oe.employee_id === emp.id
                          )
                          return !hasBeenOnboarded
                        })
                      : []
                    
                    console.log('Available employees for dropdown:', availableEmployees.length, 'out of', Array.isArray(allEmployees) ? allEmployees.length : 0)
                    
                    if (availableEmployees.length > 0) {
                      return availableEmployees.map((emp) => {
                        const department = Array.isArray(departments) ? departments.find(dept => dept.id === emp.department_id) : null
                        const displayName = `${emp.first_name || ''} ${emp.last_name || ''} - ${emp.designation || emp.position || 'Employee'} (${department?.name || 'Unknown Department'})`
                        return (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {displayName}
                          </SelectItem>
                        )
                      })
                    } else {
                      return (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          {Array.isArray(allEmployees) && allEmployees.length === 0 
                            ? "No employees available. Please add employees first."
                            : Array.isArray(allEmployees) && allEmployees.length > 0
                            ? "All employees are already in onboarding."
                            : "Loading employees..."}
                        </div>
                      )
                    }
                  })()}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Only employees who have never been in onboarding are shown. Once an employee completes onboarding, they cannot be added again.
              </p>
            </div>
            <div>
              <Label htmlFor="startDate">Onboarding Start Date *</Label>
              <DatePicker
                value={formData.startDate}
                onChange={(v) => handleInputChange("startDate", v)}
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
              <DatePicker
                value={taskFormData.due_date}
                onChange={(v) => handleTaskInputChange("due_date", v)}
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

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Documents
            </DialogTitle>
            <DialogDescription>
              Upload one or more documents for task: <span className="font-medium">{uploadTask?.title}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="documentFile" className="text-sm font-medium mb-3 block">
                  Select Documents
                  <span className="text-xs font-normal text-gray-500 ml-1">(Multiple files allowed)</span>
                </Label>
                {uploadFiles.length > 0 ? (
                  <div className="space-y-3">
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                      {uploadFiles.map((file, index) => {
                        const fileKey = `${file.name}-${index}`
                        const progress = uploadProgress[fileKey]
                        const hasError = progress === -1
                        const isUploadingFile = progress !== undefined && progress > 0 && progress < 100
                        const isUploaded = progress === 100
                        
                        // Get file extension for icon color
                        const fileExt = file.name.split('.').pop()?.toLowerCase()
                        const isPdf = fileExt === 'pdf'
                        const isWord = ['doc', 'docx'].includes(fileExt || '')
                        
                        return (
                          <div 
                            key={fileKey} 
                            className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                              hasError 
                                ? 'bg-red-50 border-red-200' 
                                : isUploaded 
                                ? 'bg-green-50 border-green-200'
                                : isUploadingFile
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`flex-shrink-0 p-2 rounded ${
                              isPdf ? 'bg-red-100' : isWord ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <FileText className={`w-4 h-4 ${
                                isPdf ? 'text-red-600' : isWord ? 'text-blue-600' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate mb-1">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">
                                  {(file.size / 1024).toFixed(2)} KB
                                </span>
                                {isUploadingFile && (
                                  <div className="flex items-center gap-1.5">
                                    <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                                    <span className="text-xs text-blue-600">Uploading...</span>
                                  </div>
                                )}
                                {isUploaded && (
                                  <div className="flex items-center gap-1.5">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    <span className="text-xs text-green-600 font-medium">Uploaded</span>
                                  </div>
                                )}
                                {hasError && (
                                  <div className="flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3 text-red-600" />
                                    <span className="text-xs text-red-600 font-medium">Failed</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              disabled={isUploading}
                              className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                    <div className="pt-2 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add More Files
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="text-center border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-blue-100 rounded-full mb-4">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        PDF, DOC, DOCX files only
                      </p>
                      <p className="text-xs text-gray-400">
                        Maximum file size: 5MB per file
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRef.current?.click()
                        }}
                        disabled={isUploading}
                        className="mt-4"
                      >
                        Choose Files
                      </Button>
                    </div>
                  </div>
                )}
                {/* File input - always rendered but hidden */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t pt-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                if (!isUploading) {
                  setUploadDialogOpen(false)
                  setUploadFiles([])
                  setUploadTask(null)
                  setUploadProgress({})
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmUpload} 
              disabled={uploadFiles.length === 0 || isUploading}
              className="min-w-[140px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {uploadFiles.length} {uploadFiles.length === 1 ? 'file' : 'files'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 