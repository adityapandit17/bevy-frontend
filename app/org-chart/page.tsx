"use client"

import { useState, useEffect } from "react"
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
  Phone,
  UserCheck,
  RefreshCw
} from "lucide-react"
import { OrgChart, buildOrgHierarchy } from "@/components/ui/org-chart"
import { useRouter } from "next/navigation"
import { getApiUrl, getEndpointUrl, apiRequest } from "@/lib/api"
import { ResourceGuard } from "@/lib/auth/auth.guards"

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  designation: string
  department_id: number
  department?: { id: number; name: string }
  manager_id?: number
  manager?: { id: number; first_name: string; last_name: string }
  status: string
  direct_reports?: Array<{ id: number; first_name: string; last_name: string }>
}

interface Department {
  id: number
  name: string
}

// Transform backend employee to org-chart format
const transformEmployeeForOrgChart = (emp: Employee) => ({
  id: emp.id.toString(),
  name: `${emp.first_name} ${emp.last_name}`,
  title: emp.designation,
  department: emp.department?.name || "Unknown",
  email: emp.email,
  phone: emp.phone,
  status: emp.status === "active" ? "active" as const : "inactive" as const,
  reportsTo: emp.manager_id?.toString(),
  location: undefined // Add if available in backend
})

export default function OrgChartPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const data = await apiRequest<Employee[]>(getApiUrl('employees'), {
        method: "GET"
      })
      setEmployees(data)
    } catch (err) {
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const data = await apiRequest<Department[]>(getEndpointUrl('DEPARTMENTS'), {
        method: "GET"
      })
      setDepartments(data)
    } catch (err) {
      console.error('Error fetching departments:', err)
    }
  }

  // Transform employees for org chart
  const transformedEmployees = employees.map(transformEmployeeForOrgChart)

  // Build hierarchical structure
  const orgData = buildOrgHierarchy(transformedEmployees)

  // Filter employees based on search and department
  const filteredEmployees = transformedEmployees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  // Calculate department stats dynamically
  const departmentStats = departments.map(dept => {
    const count = employees.filter(emp => emp.department_id === dept.id).length
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", 
      "bg-orange-500", "bg-pink-500", "bg-indigo-500", 
      "bg-red-500", "bg-yellow-500"
    ]
    return {
      name: dept.name,
      count: count,
      color: colors[dept.id % colors.length]
    }
  }).filter(dept => dept.count > 0) // Only show departments with employees

  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee(employee)
  }

  const handleEditEmployee = (employee: any) => {
    // Navigate to employee edit page
    router.push(`/employees/${employee.id}`)
  }

  const handleViewProfile = (employee: any) => {
    // Navigate to employee profile page
    router.push(`/employees/${employee.id}`)
  }

  return (
    <ResourceGuard resourceKeys={["employees"]} pageName="Organization Chart">
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Organization Chart</h1>
          <p className="text-gray-600">Visualize your company's hierarchical structure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/team-assignment')} className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <UserCheck className="w-4 h-4 mr-2" />
            Team Management
          </Button>
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
                    {employees.length} employees • Click on cards to view details
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchEmployees}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
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
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading organization chart...</span>
                  </div>
                ) : orgData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Building2 className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">No organization structure found</p>
                    <p className="text-sm text-gray-500 mb-4">Assign managers to employees to build the organization chart</p>
                    <Button onClick={() => router.push('/team-assignment')} variant="outline">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Go to Team Management
                    </Button>
                  </div>
                ) : (
                  <OrgChart
                    data={orgData}
                    onEmployeeClick={handleEmployeeClick}
                    onEditEmployee={handleEditEmployee}
                    onViewProfile={handleViewProfile}
                  />
                )}
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
                {filteredEmployees.length} of {employees.length} employees
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
    </ResourceGuard>
  )
} 