"use client"

import { useEffect, useState } from "react"
import { getApiUrl, getEndpointUrl, apiRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IndianRupee, Search, Plus, MoreHorizontal, Download, Calculator, Clock, CheckCircle } from "lucide-react"
import { SalaryStructureForm } from "@/components/forms/salary-structure-form"
import { ResourceGuard } from "@/lib/auth/auth.guards"

export default function PayrollPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [monthFilter, setMonthFilter] = useState("november-2024")
  const [payrollRecords, setPayrollRecords] = useState([])
  const [salaryStructures, setSalaryStructures] = useState([])
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  useEffect(() => {
    fetchPayrollRecords()
    fetchSalaryStructures()
    fetchEmployees()
    fetchDepartments()
  }, [])

  const fetchPayrollRecords = async () => {
    setLoading(true)
    try {
      const data = await apiRequest(getEndpointUrl('PAYROLLS'))
      // Ensure data is an array
      setPayrollRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching payroll records:", err)
      setPayrollRecords([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSalaryStructures = async () => {
    setLoading(true)
    try {
      const data = await apiRequest(getEndpointUrl('SALARY_STRUCTURES'))
      // Ensure data is an array
      setSalaryStructures(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching salary structures:", err)
      setSalaryStructures([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const data = await apiRequest(getEndpointUrl('EMPLOYEES'))
      setEmployees(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching employees:", err)
      setEmployees([])
    }
  }

  const fetchDepartments = async () => {
    try {
      const data = await apiRequest(getEndpointUrl('DEPARTMENTS'))
      setDepartments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching departments:", err)
      setDepartments([])
    }
  }

  const getEmployeeName = (id) => {
    if (!Array.isArray(employees)) return id
    const emp = employees.find(e => String(e.id) === String(id))
    return emp ? `${emp.first_name} ${emp.last_name}` : id
  }

  const getDepartmentName = (id) => {
    if (!Array.isArray(departments)) return id
    const dept = departments.find(d => String(d.id) === String(id))
    return dept ? dept.name : id
  }

  // Filter payroll records by search term (employee name or ID)
  const filteredPayrollRecords = Array.isArray(payrollRecords)
    ? payrollRecords.filter((record: any) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        const employeeName = String(getEmployeeName(record.employee_id) || "").toLowerCase()
        const employeeId = String(record.employee_id || "").toLowerCase()
        return employeeName.includes(term) || employeeId.includes(term)
      })
    : []

  // Pagination calculations for payroll records
  const totalPages = Math.max(1, Math.ceil(filteredPayrollRecords.length / pageSize))
  const currentPageSafe = Math.min(currentPage, totalPages)
  const pageStartIndex = (currentPageSafe - 1) * pageSize
  const pageEndIndex = pageStartIndex + pageSize
  const paginatedPayrollRecords = filteredPayrollRecords.slice(pageStartIndex, pageEndIndex)

  const handlePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(nextPage)
  }

  // Reset pagination when filters, data, or page size change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, monthFilter, payrollRecords, pageSize])

  const handleAddSalaryStructure = async (formData) => {
    try {
      const res = await fetch(getEndpointUrl('SALARY_STRUCTURES'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salary_structure: formData })
      })
      if (res.ok) {
        fetchSalaryStructures()
        setShowForm(false)
      } else {
        // handle error
      }
    } catch (err) {
      // handle error
    }
  }

  const payrollStats = [
    {
      title: "Total Payroll",
      value: "₹45.2L",
      change: "+8.2% from last month",
      icon: IndianRupee,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Employees Paid",
      value: "248",
      change: "100% completion",
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Approvals",
      value: "5",
      change: "Overtime claims",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Tax Deducted",
      value: "₹8.4L",
      change: "TDS + PF + ESI",
      icon: Calculator,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Processing":
        return "bg-yellow-100 text-yellow-800"
      case "Pending":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <ResourceGuard resourceKeys={["payrolls", "salary_structures"]} pageName="Payroll">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600">Manage employee salaries and compensation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Payroll
          </Button>
          <Button size="sm">
            <Calculator className="w-4 h-4 mr-2" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {payrollStats.map((stat, index) => (
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

      {/* Tabs for Payroll Records and Salary Structures */}
      <Tabs defaultValue="records" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-96">
          <TabsTrigger value="records">Payroll Records</TabsTrigger>
          <TabsTrigger value="structures">Salary Structures</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Payroll Records
              </CardTitle>
              <CardDescription>Monthly salary processing and payment records</CardDescription>
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
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="november-2024">November 2024</SelectItem>
                    <SelectItem value="october-2024">October 2024</SelectItem>
                    <SelectItem value="september-2024">September 2024</SelectItem>
                    <SelectItem value="august-2024">August 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPayrollRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          No payroll records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPayrollRecords.map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{getEmployeeName(record.employee_id)}</p>
                              <p className="text-sm text-gray-500">
                                {record.employee_id} • {getDepartmentName(record.department_id)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{formatCurrency(record.basicSalary)}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600">{formatCurrency(record.allowances)}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-red-600">{formatCurrency(record.deductions)}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-gray-900">{formatCurrency(record.netSalary)}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
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
                                <DropdownMenuItem>View Payslip</DropdownMenuItem>
                                <DropdownMenuItem>Edit Salary</DropdownMenuItem>
                                <DropdownMenuItem>Download PDF</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Reprocess Payment</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls matching other pages */}
              {filteredPayrollRecords.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 text-sm text-gray-600">
                  {/* Showing text */}
                  <div>
                    {filteredPayrollRecords.length === 0 ? (
                      <span>Showing 0 results</span>
                    ) : (
                      <span>
                        Showing {pageStartIndex + 1} to{" "}
                        {Math.min(pageEndIndex, filteredPayrollRecords.length)} of{" "}
                        {filteredPayrollRecords.length} payroll records
                      </span>
                    )}
                  </div>

                  {/* Per-page selector + numbered pagination */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span>Per page:</span>
                      <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                          setPageSize(Number(value))
                        }}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPageSafe - 1)}
                        disabled={currentPageSafe === 1}
                      >
                        ‹ Previous
                      </Button>

                      {Array.from({ length: totalPages }, (_, index) => {
                        const page = index + 1
                        return (
                          <Button
                            key={page}
                            variant={page === currentPageSafe ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        )
                      })}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPageSafe + 1)}
                        disabled={currentPageSafe === totalPages}
                      >
                        Next ›
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Salary Structures
              </CardTitle>
              <CardDescription>Define compensation packages for different roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {Array.isArray(salaryStructures) && salaryStructures.map((structure) => (
                  <Card key={structure.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{structure.title}</h3>
                          <p className="text-sm text-gray-500">{structure.employees} employees</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Structure</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem>View Employees</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Basic Salary</p>
                          <p className="font-medium text-gray-900">{structure.basicSalary}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">HRA</p>
                          <p className="font-medium text-gray-900">{structure.hra}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Transport</p>
                          <p className="font-medium text-gray-900">{structure.transport}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Medical</p>
                          <p className="font-medium text-gray-900">{structure.medical}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">PF</p>
                          <p className="font-medium text-gray-900">{structure.pf}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">ESI</p>
                          <p className="font-medium text-gray-900">{structure.esi}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6">
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Structure
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {showForm && <SalaryStructureForm onClose={() => setShowForm(false)} onSubmit={handleAddSalaryStructure} />}
    </div>
    </ResourceGuard>
  )
}
