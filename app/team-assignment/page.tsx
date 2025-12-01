"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  UserPlus,
  UserMinus,
  Search,
  Filter,
  Network,
  Building2,
  UserCheck,
  ArrowRight,
  Save,
  X,
} from "lucide-react"
import { getEndpointUrl, getApiUrl, apiRequest } from "@/lib/api"
import { ResourceGuard } from "@/lib/auth/auth.guards"
import { AUTH_CONFIG } from "@/config/auth.config"

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  designation: string
  department_id: number
  department_name?: string
  manager_id?: number
  manager_name?: string
  status: string
  direct_reports_count?: number
}

interface Department {
  id: number
  name: string
}

export default function TeamAssignmentPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "teams" | "hierarchy">("list")
  
  // Dialog states
  const [showManagerDialog, setShowManagerDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedManagerId, setSelectedManagerId] = useState<string>("none")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await apiRequest<{ data: Employee[], pagination: any } | Employee[]>(`${getApiUrl('employees')}?page=1&per_page=1000`, {
        method: "GET"
      })
      // Handle paginated response or direct array
      const employees = Array.isArray(response) ? response : (response as any).data || []
      // Enrich with manager and department names
      const enriched = employees.map((emp: any) => ({
        ...emp,
        manager_name: emp.manager ? `${emp.manager.first_name} ${emp.manager.last_name}` : null,
        department_name: emp.department?.name || "",
        direct_reports_count: emp.direct_reports?.length || 0
      }))
      setEmployees(enriched)
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

  const handleAssignManager = (employee: Employee) => {
    setSelectedEmployee(employee)
    setSelectedManagerId(employee.manager_id?.toString() || "none")
    setShowManagerDialog(true)
  }

  const handleSaveManager = async () => {
    if (!selectedEmployee) return
    
    setSaving(true)
    try {
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey) || localStorage.getItem('auth_token') || localStorage.getItem('token')
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const managerId = selectedManagerId && selectedManagerId !== "none" ? parseInt(selectedManagerId) : null
      
      const response = await fetch(getApiUrl(`employees/${selectedEmployee.id}`), {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ 
          employee: { manager_id: managerId } 
        })
      })

      if (response.ok) {
        setShowManagerDialog(false)
        setSelectedEmployee(null)
        setSelectedManagerId("none")
        await fetchEmployees()
      } else {
        const error = await response.json()
        alert(error.errors?.join(', ') || 'Failed to assign manager')
      }
    } catch (err) {
      console.error('Error assigning manager:', err)
      alert('Failed to assign manager')
    } finally {
      setSaving(false)
    }
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || emp.department_id.toString() === departmentFilter
    return matchesSearch && matchesDepartment
  })

  // Group employees by manager for teams view
  const employeesByManager = filteredEmployees.reduce((acc, emp) => {
    const managerId = emp.manager_id || 0
    if (!acc[managerId]) {
      acc[managerId] = []
    }
    acc[managerId].push(emp)
    return acc
  }, {} as Record<number, Employee[]>)

  // Get manager name by ID
  const getManagerName = (managerId: number | undefined) => {
    if (!managerId) return "No Manager"
    const manager = employees.find(e => e.id === managerId)
    return manager ? `${manager.first_name} ${manager.last_name}` : "Unknown"
  }

  // Get employees without managers (potential top-level managers)
  const potentialManagers = employees.filter(emp => 
    emp.status === "active" && 
    emp.id !== selectedEmployee?.id // Don't allow self-assignment
  )

  return (
    <ResourceGuard resourceKeys={["employees"]} pageName="Team Assignment">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Team & Manager Assignment</h1>
            <p className="text-gray-600">Assign managers to employees and organize teams</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
            >
              <Users className="w-4 h-4 mr-2" />
              List View
            </Button>
            <Button
              variant={viewMode === "teams" ? "default" : "outline"}
              onClick={() => setViewMode("teams")}
            >
              <Network className="w-4 h-4 mr-2" />
              Teams View
            </Button>
            <Button
              variant={viewMode === "hierarchy" ? "default" : "outline"}
              onClick={() => setViewMode("hierarchy")}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Hierarchy
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* List View */}
        {viewMode === "list" && (
          <Card>
            <CardHeader>
              <CardTitle>Employee List</CardTitle>
              <CardDescription>Assign managers to employees</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading employees...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Direct Reports</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{employee.department_name || "N/A"}</TableCell>
                        <TableCell>{employee.designation}</TableCell>
                        <TableCell>
                          {employee.manager_name ? (
                            <Badge variant="outline">{employee.manager_name}</Badge>
                          ) : (
                            <span className="text-gray-400">No Manager</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {employee.direct_reports_count > 0 ? (
                            <Badge variant="secondary">{employee.direct_reports_count} reports</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignManager(employee)}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Assign Manager
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Teams View */}
        {viewMode === "teams" && (
          <div className="space-y-6">
            {/* Teams by Manager */}
            {Object.entries(employeesByManager).map(([managerId, teamMembers]) => {
              const manager = managerId !== "0" ? employees.find(e => e.id === parseInt(managerId)) : null
              return (
                <Card key={managerId}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="w-5 h-5" />
                      {manager ? (
                        <>
                          {manager.first_name} {manager.last_name}'s Team
                          <Badge variant="secondary" className="ml-2">
                            {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                          </Badge>
                        </>
                      ) : (
                        <>
                          Unassigned Employees
                          <Badge variant="outline" className="ml-2">
                            {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                          </Badge>
                        </>
                      )}
                    </CardTitle>
                    {manager && (
                      <CardDescription>
                        {manager.designation} • {manager.department_name}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{member.first_name} {member.last_name}</p>
                              <p className="text-sm text-gray-500">{member.designation}</p>
                              <p className="text-xs text-gray-400 mt-1">{member.department_name}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAssignManager(member)}
                            >
                              <UserCheck className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Hierarchy View */}
        {viewMode === "hierarchy" && (
          <Card>
            <CardHeader>
              <CardTitle>Organization Hierarchy</CardTitle>
              <CardDescription>View reporting structure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Top-level managers (employees without managers) */}
                {filteredEmployees
                  .filter(emp => !emp.manager_id && emp.status === "active")
                  .map((topManager) => {
                    const directReports = filteredEmployees.filter(
                      emp => emp.manager_id === topManager.id
                    )
                    return (
                      <div key={topManager.id} className="border-l-2 border-gray-200 pl-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <UserCheck className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{topManager.first_name} {topManager.last_name}</p>
                            <p className="text-sm text-gray-500">{topManager.designation}</p>
                            <p className="text-xs text-gray-400">{topManager.department_name}</p>
                          </div>
                          <Badge variant="secondary">{directReports.length} reports</Badge>
                        </div>
                        
                        {/* Direct Reports */}
                        {directReports.length > 0 && (
                          <div className="ml-8 space-y-3">
                            {directReports.map((report) => {
                              const subReports = filteredEmployees.filter(
                                emp => emp.manager_id === report.id
                              )
                              return (
                                <div key={report.id} className="border-l-2 border-gray-200 pl-4">
                                  <div className="flex items-center gap-3 mb-2">
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                      <Users className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{report.first_name} {report.last_name}</p>
                                      <p className="text-sm text-gray-500">{report.designation}</p>
                                    </div>
                                    {subReports.length > 0 && (
                                      <Badge variant="outline">{subReports.length} reports</Badge>
                                    )}
                                  </div>
                                  
                                  {/* Sub-reports (2 levels deep) */}
                                  {subReports.length > 0 && (
                                    <div className="ml-8 space-y-2">
                                      {subReports.map((subReport) => (
                                        <div key={subReport.id} className="flex items-center gap-2 text-sm">
                                          <ArrowRight className="w-3 h-3 text-gray-400" />
                                          <span className="text-gray-600">
                                            {subReport.first_name} {subReport.last_name}
                                          </span>
                                          <span className="text-gray-400">• {subReport.designation}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                
                {/* Employees without managers */}
                {filteredEmployees.filter(emp => !emp.manager_id && emp.status === "active").length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No top-level managers found. Assign managers to create a hierarchy.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assign Manager Dialog */}
        <Dialog open={showManagerDialog} onOpenChange={setShowManagerDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Manager</DialogTitle>
              <DialogDescription>
                Select a manager for {selectedEmployee?.first_name} {selectedEmployee?.last_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Manager</SelectItem>
                    {potentialManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>
                        {manager.first_name} {manager.last_name} - {manager.designation}
                        {manager.department_name && ` (${manager.department_name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedManagerId && selectedManagerId !== "none" && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Selected Manager:</strong> {
                      potentialManagers.find(m => m.id.toString() === selectedManagerId)?.first_name
                    } {
                      potentialManagers.find(m => m.id.toString() === selectedManagerId)?.last_name
                    }
                  </p>
                </div>
              )}
              {selectedManagerId === "none" && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>No Manager</strong> will be assigned to this employee.
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowManagerDialog(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveManager} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ResourceGuard>
  )
}

