"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, Download, Users, Disc3Icon as Org3 } from "lucide-react"
import { EmployeeForm } from "@/components/forms/employee-form"

const employees = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh.kumar@company.com",
    phone: "+91 98765 43210",
    designation: "Senior Software Engineer",
    department: "Engineering",
    manager: "Priya Sharma",
    joiningDate: "2022-03-15",
    status: "active",
    employeeId: "EMP001",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Anita Desai",
    email: "anita.desai@company.com",
    phone: "+91 87654 32109",
    designation: "Marketing Manager",
    department: "Marketing",
    manager: "Vikram Singh",
    joiningDate: "2021-11-20",
    status: "active",
    employeeId: "EMP002",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Suresh Patel",
    email: "suresh.patel@company.com",
    phone: "+91 76543 21098",
    designation: "Sales Representative",
    department: "Sales",
    manager: "Kavya Nair",
    joiningDate: "2023-01-10",
    status: "on leave",
    employeeId: "EMP003",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Meera Joshi",
    email: "meera.joshi@company.com",
    phone: "+91 65432 10987",
    designation: "HR Specialist",
    department: "Human Resources",
    manager: "Rohit Mehta",
    joiningDate: "2022-08-05",
    status: "active",
    employeeId: "EMP004",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Arjun Reddy",
    email: "arjun.reddy@company.com",
    phone: "+91 54321 09876",
    designation: "Financial Analyst",
    department: "Finance",
    manager: "Sneha Gupta",
    joiningDate: "2023-05-12",
    status: "active",
    employeeId: "EMP005",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const departments = [
  { name: "Engineering", count: 45, head: "Priya Sharma" },
  { name: "Marketing", count: 12, head: "Vikram Singh" },
  { name: "Sales", count: 28, head: "Kavya Nair" },
  { name: "Human Resources", count: 8, head: "Rohit Mehta" },
  { name: "Finance", count: 15, head: "Sneha Gupta" },
  { name: "Operations", count: 22, head: "Amit Verma" },
]

export function EmployeesPage() {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("list")

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your organization's workforce</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Employee List
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Org3 className="w-4 h-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="org-chart" className="flex items-center gap-2">
            <Org3 className="w-4 h-4" />
            Org Chart
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Search and Filter */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search employees by name, ID, department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200"
                  />
                </div>
                <Button variant="outline" className="border-gray-200 text-gray-600 bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Employee List */}
          <div className="grid gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={employee.avatar || "/placeholder.svg"}
                        alt={employee.name}
                        className="w-12 h-12 rounded-full bg-gray-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {employee.employeeId}
                          </Badge>
                        </div>
                        <p className="text-gray-600 font-medium">{employee.designation}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {employee.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {employee.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                      <div className="text-right">
                        <Badge
                          className={
                            employee.status === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {employee.status}
                        </Badge>
                        <div className="mt-2 text-sm text-gray-500 space-y-1">
                          <p>
                            <strong>Dept:</strong> {employee.department}
                          </p>
                          <p>
                            <strong>Manager:</strong> {employee.manager}
                          </p>
                          <p>
                            <strong>Joined:</strong> {employee.joiningDate}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={dept.name} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{dept.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Employees</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {dept.count}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Department Head</span>
                      <span className="font-medium text-gray-900">{dept.head}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4 border-gray-200 bg-transparent">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="org-chart" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Organization Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Org3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Organization Chart</h3>
                  <p className="text-gray-600 mb-4">Interactive org chart will be displayed here</p>
                  <Button className="bg-green-600 hover:bg-green-700">Generate Org Chart</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showForm && <EmployeeForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
