"use client"

import React, { useState, useEffect } from "react"
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
  id: string
  employeeId: string
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
  tasks: OffboardingTask[]
}

interface OffboardingTask {
  id: string
  title: string
  description: string
  category: string
  priority: "high" | "medium" | "low"
  dueDate: string
  assignedTo: string
  isCompleted: boolean
  completedDate?: string
  documents?: string[]
}

export default function OffboardingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [offboardingEmployees, setOffboardingEmployees] = useState<OffboardingEmployee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<OffboardingEmployee | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    setOffboardingEmployees([
      {
        id: "1",
        employeeId: "EMP001",
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        department: "Engineering",
        position: "Senior Developer",
        startDate: "2022-03-15",
        lastWorkingDay: "2024-01-31",
        status: "in_progress",
        progress: 65,
        assignedTo: "Mike Chen",
        notes: "Moving to another company",
        tasks: [
          {
            id: "1",
            title: "Return Company Laptop",
            description: "Return all company equipment including laptop, charger, and accessories",
            category: "Equipment",
            priority: "high",
            dueDate: "2024-01-30",
            assignedTo: "IT Department",
            isCompleted: true,
            completedDate: "2024-01-28",
          },
          {
            id: "2",
            title: "Exit Interview",
            description: "Conduct exit interview with HR manager",
            category: "HR",
            priority: "high",
            dueDate: "2024-01-29",
            assignedTo: "Lisa Wang",
            isCompleted: true,
            completedDate: "2024-01-29",
          },
          {
            id: "3",
            title: "Knowledge Transfer",
            description: "Transfer knowledge and handover ongoing projects",
            category: "Knowledge Transfer",
            priority: "medium",
            dueDate: "2024-01-31",
            assignedTo: "David Kim",
            isCompleted: false,
          },
          {
            id: "4",
            title: "Cancel Benefits",
            description: "Cancel health insurance and other benefits",
            category: "Benefits",
            priority: "medium",
            dueDate: "2024-01-31",
            assignedTo: "HR Department",
            isCompleted: false,
          },
        ],
      },
      {
        id: "2",
        employeeId: "EMP002",
        name: "David Kim",
        email: "david.kim@company.com",
        department: "Product",
        position: "Product Manager",
        startDate: "2021-08-10",
        lastWorkingDay: "2024-02-15",
        status: "pending",
        progress: 0,
        assignedTo: "Lisa Wang",
        notes: "Personal reasons",
        tasks: [
          {
            id: "5",
            title: "Return Company Laptop",
            description: "Return all company equipment",
            category: "Equipment",
            priority: "high",
            dueDate: "2024-02-14",
            assignedTo: "IT Department",
            isCompleted: false,
          },
          {
            id: "6",
            title: "Exit Interview",
            description: "Conduct exit interview",
            category: "HR",
            priority: "high",
            dueDate: "2024-02-13",
            assignedTo: "Lisa Wang",
            isCompleted: false,
          },
        ],
      },
      {
        id: "3",
        employeeId: "EMP003",
        name: "Mike Chen",
        email: "mike.chen@company.com",
        department: "Engineering",
        position: "Team Lead",
        startDate: "2020-11-20",
        lastWorkingDay: "2024-01-20",
        status: "completed",
        progress: 100,
        assignedTo: "John Smith",
        notes: "Completed successfully",
        tasks: [
          {
            id: "7",
            title: "Return Company Laptop",
            description: "Return all company equipment",
            category: "Equipment",
            priority: "high",
            dueDate: "2024-01-19",
            assignedTo: "IT Department",
            isCompleted: true,
            completedDate: "2024-01-18",
          },
          {
            id: "8",
            title: "Exit Interview",
            description: "Conduct exit interview",
            category: "HR",
            priority: "high",
            dueDate: "2024-01-19",
            assignedTo: "John Smith",
            isCompleted: true,
            completedDate: "2024-01-19",
          },
        ],
      },
    ])
  }, [])

  const offboardingStats = [
    {
      title: "Active Offboarding",
      value: "2",
      change: "This month",
      icon: UserMinus,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completed",
      value: "1",
      change: "This month",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending",
      value: "1",
      change: "This month",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Avg. Duration",
      value: "5 days",
      change: "Last month: 7 days",
      icon: CalendarDays,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  const taskCategories = [
    {
      category: "Equipment",
      icon: Laptop,
      color: "bg-blue-100 text-blue-600",
      count: 3,
    },
    {
      category: "HR",
      icon: Users,
      color: "bg-green-100 text-green-600",
      count: 3,
    },
    {
      category: "Knowledge Transfer",
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
      count: 1,
    },
    {
      category: "Benefits",
      icon: Shield,
      color: "bg-orange-100 text-orange-600",
      count: 1,
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

  const filteredEmployees = offboardingEmployees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || employee.status === filterStatus
    const matchesDepartment = filterDepartment === "all" || employee.department === filterDepartment
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const handleTaskToggle = (employeeId: string, taskId: string) => {
    setOffboardingEmployees(prev => 
      prev.map(employee => {
        if (employee.id === employeeId) {
          const updatedTasks = employee.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                isCompleted: !task.isCompleted,
                completedDate: !task.isCompleted ? new Date().toISOString().split('T')[0] : undefined
              }
            }
            return task
          })
          
          const completedTasks = updatedTasks.filter(task => task.isCompleted).length
          const progress = Math.round((completedTasks / updatedTasks.length) * 100)
          
          return {
            ...employee,
            tasks: updatedTasks,
            progress,
            status: progress === 100 ? "completed" : progress > 0 ? "in_progress" : "pending"
          }
        }
        return employee
      })
    )
  }

  const handleViewDetails = (employee: OffboardingEmployee) => {
    setSelectedEmployee(employee)
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
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Start Offboarding
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Start Employee Offboarding</DialogTitle>
                <DialogDescription>
                  Initiate the offboarding process for an employee.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="employee" className="text-right">
                    Employee
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee1">John Doe</SelectItem>
                      <SelectItem value="employee2">Jane Smith</SelectItem>
                      <SelectItem value="employee3">Bob Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="last-working-day" className="text-right">
                    Last Working Day
                  </label>
                  <Input
                    id="last-working-day"
                    type="date"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="reason" className="text-right">
                    Reason
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
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
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="assigned-to" className="text-right">
                    Assigned To
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr">HR Manager</SelectItem>
                      <SelectItem value="manager">Direct Manager</SelectItem>
                      <SelectItem value="it">IT Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="notes" className="text-right">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    placeholder="Additional notes or special instructions"
                    className="col-span-3 min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowAddDialog(false)}>
                  Start Offboarding
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {offboardingStats.map((stat) => (
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
        ))}
      </div>

      {/* Task Categories Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {taskCategories.map((category) => (
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
        ))}
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
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
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
                {filteredEmployees.map((employee) => (
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
                            {employee.tasks.filter(t => t.isCompleted).length}/{employee.tasks.length}
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
                          <DropdownMenuItem>
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
                ))}
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
                      <span>{selectedEmployee.tasks.filter(t => t.isCompleted).length} completed</span>
                      <span>{selectedEmployee.tasks.length} total tasks</span>
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
                    {selectedEmployee.tasks.map((task) => (
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
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{task.assignedTo}</span>
                              </div>
                            </div>
                            {task.isCompleted && task.completedDate && (
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Completed {new Date(task.completedDate).toLocaleDateString()}</span>
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