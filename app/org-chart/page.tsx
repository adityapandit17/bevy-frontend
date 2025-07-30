"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Users,
  Building2,
  Eye,
  Edit,
  UserPlus,
  Mail,
  MapPin,
  Phone
} from "lucide-react"
import { OrgChart, buildOrgHierarchy } from "@/components/ui/org-chart"
import { useRouter } from "next/navigation"

// Sample organization data
const sampleEmployees = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "Chief Executive Officer",
    department: "Executive",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    location: "New York",
    status: "active" as const,
    reportsTo: undefined,
  },
  {
    id: "2",
    name: "Michael Chen",
    title: "Chief Technology Officer",
    department: "Engineering",
    email: "michael.chen@company.com",
    phone: "+1 (555) 123-4568",
    location: "San Francisco",
    status: "active" as const,
    reportsTo: "1",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    title: "Chief Marketing Officer",
    department: "Marketing",
    email: "emily.rodriguez@company.com",
    phone: "+1 (555) 123-4569",
    location: "Los Angeles",
    status: "active" as const,
    reportsTo: "1",
  },
  {
    id: "4",
    name: "David Wilson",
    title: "VP of Engineering",
    department: "Engineering",
    email: "david.wilson@company.com",
    phone: "+1 (555) 123-4570",
    location: "San Francisco",
    status: "active" as const,
    reportsTo: "2",
  },
  {
    id: "5",
    name: "Lisa Wang",
    title: "VP of Product",
    department: "Product",
    email: "lisa.wang@company.com",
    phone: "+1 (555) 123-4571",
    location: "San Francisco",
    status: "active" as const,
    reportsTo: "2",
  },
  {
    id: "6",
    name: "James Brown",
    title: "Senior Software Engineer",
    department: "Engineering",
    email: "james.brown@company.com",
    phone: "+1 (555) 123-4572",
    location: "San Francisco",
    status: "active" as const,
    reportsTo: "4",
  },
  {
    id: "7",
    name: "Priya Sharma",
    title: "Software Engineer",
    department: "Engineering",
    email: "priya.sharma@company.com",
    phone: "+1 (555) 123-4573",
    location: "Remote",
    status: "active" as const,
    reportsTo: "4",
  },
  {
    id: "8",
    name: "Alex Thompson",
    title: "Product Manager",
    department: "Product",
    email: "alex.thompson@company.com",
    phone: "+1 (555) 123-4574",
    location: "San Francisco",
    status: "active" as const,
    reportsTo: "5",
  },
  {
    id: "9",
    name: "Maria Garcia",
    title: "Marketing Director",
    department: "Marketing",
    email: "maria.garcia@company.com",
    phone: "+1 (555) 123-4575",
    location: "Los Angeles",
    status: "active" as const,
    reportsTo: "3",
  },
  {
    id: "10",
    name: "Robert Kim",
    title: "Marketing Specialist",
    department: "Marketing",
    email: "robert.kim@company.com",
    phone: "+1 (555) 123-4576",
    location: "Los Angeles",
    status: "active" as const,
    reportsTo: "9",
  },
  {
    id: "11",
    name: "Jennifer Lee",
    title: "HR Director",
    department: "Human Resources",
    email: "jennifer.lee@company.com",
    phone: "+1 (555) 123-4577",
    location: "New York",
    status: "active" as const,
    reportsTo: "1",
  },
  {
    id: "12",
    name: "Thomas Anderson",
    title: "HR Specialist",
    department: "Human Resources",
    email: "thomas.anderson@company.com",
    phone: "+1 (555) 123-4578",
    location: "New York",
    status: "active" as const,
    reportsTo: "11",
  },
]

export default function OrgChartPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const router = useRouter()

  // Build hierarchical structure
  const orgData = buildOrgHierarchy(sampleEmployees)

  // Filter employees based on search and department
  const filteredEmployees = sampleEmployees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee(employee)
  }

  const handleEditEmployee = (employee: any) => {
    // Navigate to employee edit page or open modal
    console.log("Edit employee:", employee)
  }

  const handleViewProfile = (employee: any) => {
    // Navigate to employee profile page
    router.push(`/employees/${employee.id}`)
  }

  const departmentStats = [
    { name: "Engineering", count: 4, color: "bg-blue-500" },
    { name: "Marketing", count: 3, color: "bg-green-500" },
    { name: "Product", count: 2, color: "bg-purple-500" },
    { name: "Human Resources", count: 2, color: "bg-orange-500" },
    { name: "Executive", count: 1, color: "bg-indigo-500" },
  ]

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Organization Chart</h1>
          <p className="text-gray-600">Visualize your company's hierarchical structure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

      {/* Main Content */}
      <Tabs defaultValue="chart" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart">Organization Chart</TabsTrigger>
          <TabsTrigger value="list">Employee List</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company Hierarchy
                  </CardTitle>
                  <CardDescription>
                    {sampleEmployees.length} employees • Click on cards to view details
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ZoomIn className="w-4 h-4 mr-2" />
                    Zoom In
                  </Button>
                  <Button variant="outline" size="sm">
                    <ZoomOut className="w-4 h-4 mr-2" />
                    Zoom Out
                  </Button>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t">
                <OrgChart
                  data={orgData}
                  onEmployeeClick={handleEmployeeClick}
                  onEditEmployee={handleEditEmployee}
                  onViewProfile={handleViewProfile}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Employee Directory
              </CardTitle>
              <CardDescription>
                {filteredEmployees.length} of {sampleEmployees.length} employees
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
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployees.map((employee) => (
                  <Card key={employee.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                            <p className="text-sm text-gray-600">{employee.title}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={employee.status === "active" ? "default" : "secondary"}
                          className={employee.status === "active" ? "bg-green-100 text-green-800" : ""}
                        >
                          {employee.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3" />
                          <span>{employee.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{employee.email}</span>
                        </div>
                        {employee.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{employee.location}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Employee Details */}
      {selectedEmployee && (
        <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedEmployee.name}</h3>
                <p className="text-sm text-gray-600">{selectedEmployee.title}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="h-3 w-3" />
                <span>{selectedEmployee.department}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-3 w-3" />
                <span className="truncate">{selectedEmployee.email}</span>
              </div>
              {selectedEmployee.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-3 w-3" />
                  <span>{selectedEmployee.phone}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => handleViewProfile(selectedEmployee)}>
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleEditEmployee(selectedEmployee)}>
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 