"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Filter, Plus, MoreHorizontal, Mail, Phone, MapPin, Calendar, Download, UserPlus, UserMinus } from "lucide-react"
import { EmployeeForm } from "@/components/forms/employee-form"
import { useRouter } from "next/navigation"
import { getEndpointUrl, getApiUrl } from "@/lib/api"

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  department_id: number
  designation: string
  date_of_joining: string
  status: string
  created_at: string
  updated_at: string
  date_of_birth?: string
  location?: string
}

interface Department {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null)
  const router = useRouter()

  // Fetch employees and departments from backend
  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const res = await fetch(getApiUrl('employees'), {
        method: "GET",
        headers: { "Content-Type": "application/json", "Accept": "application/json" }
      })
      const data = await res.json()
      setEmployees(data)
    } catch (err) {
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await fetch(getEndpointUrl('DEPARTMENTS'), {
        method: "GET",
        headers: { "Content-Type": "application/json", "Accept": "application/json" }
      })
      const data = await res.json()
      setDepartments(data)
    } catch (err) {
      console.error('Error fetching departments:', err)
    }
  }

  const handleAddEmployee = async (formData: any) => {
    try {
      const res = await fetch(getApiUrl('employees'), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ employee: formData })
      })
      if (res.ok) {
        fetchEmployees()
        setShowForm(false)
      } else {
        console.error('Error adding employee')
      }
    } catch (err) {
      console.error('Error adding employee:', err)
    }
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditEmployee(employee)
    setShowForm(true)
  }

  const handleUpdateEmployee = async (formData: any) => {
    try {
      const res = await fetch(`${getApiUrl('employees')}/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ employee: formData })
      })
      if (res.ok) {
        fetchEmployees()
        setShowForm(false)
        setEditEmployee(null)
      } else {
        console.error('Error updating employee')
      }
    } catch (err) {
      console.error('Error updating employee:', err)
    }
  }

  const handleDeactivateEmployee = async (employee: Employee) => {
    try {
      const res = await fetch(`${getApiUrl('employees')}/${employee.id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json" }
      })
      if (res.ok) {
        fetchEmployees()
      } else {
        console.error('Error deactivating employee')
      }
    } catch (err) {
      console.error('Error deactivating employee:', err)
    }
  }

  // Generate dynamic department stats from real data
  const departmentStats = departments.map((dept, index) => {
    const count = employees.filter(emp => emp.department_id === dept.id).length
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", 
      "bg-orange-500", "bg-pink-500", "bg-indigo-500", 
      "bg-red-500", "bg-yellow-500"
    ]
    return {
      name: dept.name,
      count: count,
      color: colors[index % colors.length]
    }
  })

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      (employee.first_name?.toLowerCase() + ' ' + employee.last_name?.toLowerCase()).includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = departmentFilter === "all" || 
      (() => {
        const department = departments.find(dept => dept.id === employee.department_id)
        return department && department.name === departmentFilter
      })()
    
    return matchesSearch && matchesDepartment
  })

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage your organization's workforce</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/onboarding')} className="border-green-200 text-green-700 hover:bg-green-50">
              <UserPlus className="w-4 h-4 mr-2" />
              Onboarding
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/offboarding')} className="border-red-200 text-red-700 hover:bg-red-50">
              <UserMinus className="w-4 h-4 mr-2" />
              Offboarding
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
          <p className="text-xs text-gray-500">Manage new employee onboarding process and checklists</p>
        </div>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {departmentStats.map((dept, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                  <p className="text-lg font-bold text-gray-700">{dept.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Employee Directory
          </CardTitle>
          <CardDescription>
            Total {employees.length} employees • {filteredEmployees.length} showing
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
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employee Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {employee.first_name?.[0]}{employee.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employee.first_name} {employee.last_name}</p>
                          <p className="text-sm text-gray-500">{employee.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {(() => {
                            const department = departments.find(dept => dept.id === employee.department_id)
                            return department ? department.name : `Department ${employee.department_id}`
                          })()}
                        </p>
                        <p className="text-sm text-gray-500">{employee.designation}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{employee.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{employee.location || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={employee.status === "active" ? "default" : "secondary"}
                        className={employee.status === "active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>Edit Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/employees/${employee.id}`)}>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>View Payroll</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeactivateEmployee(employee)}>Deactivate</DropdownMenuItem>
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
      {showForm && (
        <EmployeeForm onClose={() => { setShowForm(false); setEditEmployee(null); }} onSubmit={editEmployee ? handleUpdateEmployee : handleAddEmployee} initialData={editEmployee} />
      )}
    </div>
  )
}
