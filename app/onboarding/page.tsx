"use client"

import { useState, useEffect } from "react"
import { getApiUrl, getEndpointUrl } from "@/lib/api"
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
  id: string
  title: string
  description: string
  category: string
  isCompleted: boolean
  dueDate: string
  assignedTo: string
  priority: "low" | "medium" | "high"
  documents?: string[]
}

interface OnboardingEmployee {
  id: string
  name: string
  email: string
  position: string
  department: string
  startDate: string
  status: "pending" | "in_progress" | "completed"
  progress: number
  tasks: OnboardingTask[]
}

export default function OnboardingPage() {
  const [employees, setEmployees] = useState<OnboardingEmployee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<OnboardingEmployee | null>(null)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchOnboardingEmployees()
    fetchStats()
  }, [])

  const fetchOnboardingEmployees = async () => {
    try {
      const response = await fetch(getEndpointUrl('ONBOARDING_EMPLOYEES'))
      const data = await response.json()
      setEmployees(data)
    } catch (error) {
      console.error('Error fetching onboarding employees:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(getApiUrl('onboarding_employees/stats'))
      const data = await response.json()
      // Update stats if needed
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const onboardingStats = [
    {
      title: "Active Onboarding",
      value: "8",
      change: "+2 this week",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed This Month",
      value: "12",
      change: "100% success rate",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Tasks",
      value: "24",
      change: "Across 8 employees",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Documents Pending",
      value: "15",
      change: "Requires attention",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
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

  const handleTaskToggle = async (employeeId: string, taskId: string) => {
    try {
      const response = await fetch(getApiUrl(`onboarding_tasks/${taskId}/toggle`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // Refresh the data
        fetchOnboardingEmployees()
      }
    } catch (error) {
      console.error('Error toggling task:', error)
    }
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
        {onboardingStats.map((stat, index) => (
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
        ))}
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
            <div className="relative">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedEmployee?.id === employee.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{employee.name}</h3>
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{employee.position}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{employee.department}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={employee.progress} className="w-16 h-2" />
                      <span className="text-xs font-medium">{employee.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
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
                {/* Employee Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Start Date</p>
                    <p className="text-sm text-gray-900">{selectedEmployee.startDate}</p>
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
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedEmployee.tasks.map((task) => (
                      <div key={task.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={task.isCompleted}
                            onCheckedChange={() => handleTaskToggle(selectedEmployee.id, task.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-medium ${task.isCompleted ? "line-through text-gray-500" : "text-gray-900"}`}>
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge className={getPriorityColor(task.priority)}>
                                  {task.priority}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      Send Reminder
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload Document
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <p className={`text-sm mb-2 ${task.isCompleted ? "text-gray-500" : "text-gray-600"}`}>
                              {task.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-4">
                                <span>Category: {task.category}</span>
                                <span>Assigned to: {task.assignedTo}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                <span>Due: {task.dueDate}</span>
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
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter email address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Position</Label>
                <Input id="position" placeholder="Enter job title" />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" placeholder="Enter department" />
              </div>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddEmployee(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddEmployee(false)}>
              Add Employee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 