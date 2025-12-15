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
import { IndianRupee, Search, Plus, MoreHorizontal, Download, Calculator, Clock, CheckCircle, Calendar as CalendarIcon } from "lucide-react"
import { SalaryStructureForm } from "@/components/forms/salary-structure-form"
import { ResourceGuard } from "@/lib/auth/auth.guards"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function PayrollPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [monthFilter, setMonthFilter] = useState("november-2024")
  const [payrollRecords, setPayrollRecords] = useState([])
  const [salaryStructures, setSalaryStructures] = useState([])
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingStructure, setEditingStructure] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [processingPayroll, setProcessingPayroll] = useState(false)
  const [showCalculationDialog, setShowCalculationDialog] = useState(false)
  const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null)
  const [calculationBreakdown, setCalculationBreakdown] = useState<any>(null)
  const [loadingBreakdown, setLoadingBreakdown] = useState(false)
  
  // Parse month filter (e.g., "october-2024") to get year and month
  const parseMonthFilter = (filter: string) => {
    const parts = filter.split("-")
    if (parts.length !== 2) return null
    
    const monthNames = ["january", "february", "march", "april", "may", "june", 
                       "july", "august", "september", "october", "november", "december"]
    const monthName = parts[0].toLowerCase()
    const monthIndex = monthNames.indexOf(monthName)
    const year = parseInt(parts[1], 10)
    
    if (monthIndex === -1 || isNaN(year)) return null
    return { year, month: monthIndex + 1 }
  }

  // Parse monthFilter to get date for calendar
  const getDateFromMonthFilter = () => {
    const monthInfo = parseMonthFilter(monthFilter)
    if (monthInfo) {
      return new Date(monthInfo.year, monthInfo.month - 1, 1)
    }
    return new Date()
  }
  
  const [selectedDate, setSelectedDate] = useState<Date>(getDateFromMonthFilter())
  const [selectedYear, setSelectedYear] = useState<number>(getDateFromMonthFilter().getFullYear())
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(getDateFromMonthFilter().getMonth())
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthIndex = now.getMonth()
  const { toast } = useToast()

  useEffect(() => {
    fetchPayrollRecords()
    fetchSalaryStructures()
    fetchEmployees()
    fetchDepartments()
  }, [])

  // Sync selectedDate with monthFilter changes
  useEffect(() => {
    const newDate = getDateFromMonthFilter()
    setSelectedDate(newDate)
    setSelectedYear(newDate.getFullYear())
    setSelectedMonthIndex(newDate.getMonth())
  }, [monthFilter])

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
      const data = await apiRequest(`${getEndpointUrl('EMPLOYEES')}?per_page=500`)
      const list = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : []
      setEmployees(list)
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

  const fetchCalculationBreakdown = async (payrollId: number) => {
    setLoadingBreakdown(true)
    try {
      const data = await apiRequest(`${getEndpointUrl('PAYROLLS')}/${payrollId}/calculation_breakdown`)
      setCalculationBreakdown(data)
      setShowCalculationDialog(true)
    } catch (err: any) {
      console.error("Error fetching calculation breakdown:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to fetch calculation breakdown",
        variant: "destructive",
      })
    } finally {
      setLoadingBreakdown(false)
    }
  }

  const handleViewCalculation = (payrollId: number) => {
    setSelectedPayrollId(payrollId)
    fetchCalculationBreakdown(payrollId)
  }

  const processPayroll = async () => {
    setProcessingPayroll(true)
    try {
      await apiRequest(getEndpointUrl("PAYROLL_PROCESS_MONTH"), {
        method: "POST",
        body: JSON.stringify({
          month: monthFilter,
          preview: false,
        }),
      })
      toast({
        title: "Payroll processed",
        description: `Processed payroll for ${formatMonthDisplay(monthFilter)}`,
      })
      fetchPayrollRecords()
    } catch (err: any) {
      toast({
        title: "Failed to process payroll",
        description: err?.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setProcessingPayroll(false)
    }
  }

  const getEmployeeName = (id) => {
    if (!Array.isArray(employees)) return id
    const emp = employees.find(e => String(e.id) === String(id))
    return emp ? `${emp.first_name} ${emp.last_name}` : id
  }

  const getEmployeeDepartmentName = (employeeId) => {
    if (!Array.isArray(employees)) return ""
    const emp = employees.find(e => String(e.id) === String(employeeId))
    const deptName = emp?.department?.name || emp?.department_name
    return deptName || ""
  }

  const getDepartmentName = (id) => {
    if (!Array.isArray(departments)) return id
    const dept = departments.find(d => String(d.id) === String(id))
    return dept ? dept.name : id
  }

  const dedupePayrollRecords = (records: any[]) => {
    if (!Array.isArray(records)) return []
    return Object.values(
      records.reduce((acc, record) => {
        const key = String(record.employee_id)
        const existing = acc[key]

        const existingCreated = existing?.created_at ? new Date(existing.created_at).getTime() : 0
        const currentCreated = record?.created_at ? new Date(record.created_at).getTime() : 0
        const existingUpdated = existing?.updated_at ? new Date(existing.updated_at).getTime() : 0
        const currentUpdated = record?.updated_at ? new Date(record.updated_at).getTime() : 0

        // Prefer newest by updated_at, then created_at, then higher id
        const shouldReplace =
          currentUpdated > existingUpdated ||
          (currentUpdated === existingUpdated && currentCreated > existingCreated) ||
          (currentUpdated === existingUpdated && currentCreated === existingCreated && Number(record.id) > Number(existing?.id || 0))

        if (!existing || shouldReplace) {
          acc[key] = record
        }
        return acc
      }, {} as Record<string, any>)
    )
  }

  const normalizedPayrollRecords = dedupePayrollRecords(payrollRecords)

  const selectedMonthLabel = formatMonthDisplay(monthFilter)

  const isRecordInSelectedMonth = (record: any) => {
    if (!selectedMonthLabel || selectedMonthLabel === "Select Month") return true
    const recordMonth = String(record?.month || "").trim().toLowerCase()
    return recordMonth === selectedMonthLabel.trim().toLowerCase()
  }

  // Filter payroll records by search term (employee name or ID)
  const filteredPayrollRecords = normalizedPayrollRecords.filter((record: any) => {
    if (!isRecordInSelectedMonth(record)) return false
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const employeeName = String(getEmployeeName(record.employee_id) || "").toLowerCase()
    const employeeId = String(record.employee_id || "").toLowerCase()
    return employeeName.includes(term) || employeeId.includes(term)
  })

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
      // Combine annual bonus + other allowances into total allowances
      const otherAllowances = Number(formData.allowances || 0)
      const bonus = Number(formData.bonus || 0)
      const totalAllowances = otherAllowances + bonus

      const payload = {
        salary_structure: {
          employee_id: Number(formData.employee_id),
          department_id: formData.department_id ? Number(formData.department_id) : null,
          level: formData.level || null,
          basic: Number(formData.baseSalary),
          hra: Number(formData.hra || 0),
          allowances: totalAllowances,
          bonus: 0, // Bonus is now included in allowances
          deductions: Number(formData.pf || 0) + Number(formData.esi || 0) + Number(formData.professionalTax || 0) + Number(formData.incomeTax || 0),
          pf: Number(formData.pf || 0),
          esi: Number(formData.esi || 0),
          professional_tax: Number(formData.professionalTax || 0),
          income_tax: Number(formData.incomeTax || 0),
          effective_from: formData.effective_from,
          effective_upto: formData.effective_upto || null,
        }
      }

      if (editingStructure) {
        // Update existing structure
        await apiRequest(`${getEndpointUrl('SALARY_STRUCTURES')}/${editingStructure.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        })
      } else {
        // Create new structure
        await apiRequest(getEndpointUrl('SALARY_STRUCTURES'), {
          method: "POST",
          body: JSON.stringify(payload)
        })
      }

      fetchSalaryStructures()
      setShowForm(false)
      setEditingStructure(null)
    } catch (err: any) {
      console.error(`Error ${editingStructure ? 'updating' : 'creating'} salary structure:`, err)
      // Re-throw error so form can handle it
      if (err?.errors) {
        throw { errors: Array.isArray(err.errors) ? err.errors : [err.errors] }
      } else if (err?.message) {
        throw { message: err.message }
      }
      throw err
    }
  }

  const handleDeleteSalaryStructure = async (structureId: number | string) => {
    if (!structureId) return
    const confirmed = typeof window !== "undefined" ? window.confirm("Delete this salary structure?") : false
    if (!confirmed) return

    try {
      await apiRequest(`${getEndpointUrl('SALARY_STRUCTURES')}/${structureId}`, { method: "DELETE" })
      fetchSalaryStructures()
    } catch (err) {
      console.error("Error deleting salary structure:", err)
    }
  }

  const handleEditSalaryStructure = (structure: any) => {
    setEditingStructure(structure)
    setShowForm(true)
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

  const formatCurrencySafe = (value: any) => {
    const num = Number(value)
    if (!Number.isFinite(num)) return "—"
    return formatCurrency(num)
  }

  const safeNumber = (value: any) => {
    const num = Number(value)
    return Number.isFinite(num) ? num : 0
  }

  // Convert date to month filter format
  const dateToMonthFilter = (date: Date) => {
    const monthNames = ["january", "february", "march", "april", "may", "june", 
                       "july", "august", "september", "october", "november", "december"]
    const monthName = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${monthName}-${year}`
  }

  // Handle calendar date selection
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      const newFilter = dateToMonthFilter(date)
      setMonthFilter(newFilter)
      setCalendarOpen(false)
    }
  }

  // Month/year pickers (without showing dates)
  const handleMonthChange = (monthIndex: number) => {
    // If current year, don't allow selecting future months
    if (selectedYear === currentYear && monthIndex > currentMonthIndex) {
      monthIndex = currentMonthIndex
    }
    const date = new Date(selectedYear, monthIndex, 1)
    handleCalendarSelect(date)
    setSelectedMonthIndex(monthIndex)
  }

  const handleYearChange = (year: number) => {
    let monthIndex = selectedMonthIndex
    if (year === currentYear && monthIndex > currentMonthIndex) {
      monthIndex = currentMonthIndex
    }
    const date = new Date(year, monthIndex, 1)
    handleCalendarSelect(date)
    setSelectedYear(year)
    setSelectedMonthIndex(monthIndex)
  }

  // Format month display (hoisted)
  function formatMonthDisplay(filter: string) {
    const monthInfo = parseMonthFilter(filter)
    if (monthInfo) {
      const monthNames = ["January", "February", "March", "April", "May", "June", 
                         "July", "August", "September", "October", "November", "December"]
      return `${monthNames[monthInfo.month - 1]} ${monthInfo.year}`
    }
    return "Select Month"
  }

  // Get salary structure for a specific employee and month
  // Returns the structure that is effective for the given month
  // (the structure with effective_from <= target month, and is the latest)
  const getStructureForMonth = (employeeId: number, year: number, month: number) => {
    if (!Array.isArray(salaryStructures) || salaryStructures.length === 0) return null
    
    // Filter structures for this employee with valid effective_from dates
    const employeeStructures = salaryStructures.filter(
      (s: any) => s.employee_id === employeeId && s.effective_from
    )
    
    if (employeeStructures.length === 0) return null
    
    // Target month date (first day of the month)
    const targetDate = new Date(year, month - 1, 1)
    const targetMonthKey = `${year}-${String(month).padStart(2, '0')}`
    
    // First, group structures by their effective month and resolve duplicates
    // (keep only the latest created structure for each month)
    const structuresByMonth: Record<string, any> = {}
    employeeStructures.forEach((structure: any) => {
      const effectiveDate = new Date(structure.effective_from)
      const monthKey = `${effectiveDate.getFullYear()}-${String(effectiveDate.getMonth() + 1).padStart(2, '0')}`
      
      if (!structuresByMonth[monthKey] || 
          new Date(structure.created_at) > new Date(structuresByMonth[monthKey].created_at)) {
        structuresByMonth[monthKey] = structure
      }
    })
    
    // Return structure for the exact target month if it exists
    if (structuresByMonth[targetMonthKey]) {
      return structuresByMonth[targetMonthKey]
    }
    
    // If no exact match, find the latest structure that is effective on or before the target month
    // This handles cases where a structure is effective from an earlier month and continues
    let latestStructure: any = null
    let latestDate: Date | null = null
    
    Object.values(structuresByMonth).forEach((structure: any) => {
      const structDate = new Date(structure.effective_from)
      // Structure must be effective on or before the target month
      if (structDate <= targetDate) {
        // Among valid structures, pick the one with the latest effective_from date
        if (!latestDate || structDate > latestDate) {
          latestDate = structDate
          latestStructure = structure
        } else if (structDate.getTime() === latestDate.getTime()) {
          // If same date, prefer the one created later
          if (new Date(structure.created_at) > new Date(latestStructure.created_at)) {
            latestStructure = structure
          }
        }
      }
    })
    
    return latestStructure
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
            <Button size="sm" onClick={processPayroll} disabled={processingPayroll}>
            <Calculator className="w-4 h-4 mr-2" />
              {processingPayroll ? "Processing..." : "Process Payroll"}
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
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-48 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatMonthDisplay(monthFilter)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="start">
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-900">Select month & year</div>
                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          value={String(selectedMonthIndex)}
                          onValueChange={(val) => handleMonthChange(Number(val))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {["January","February","March","April","May","June","July","August","September","October","November","December"]
                              .filter((_, idx) => selectedYear === currentYear ? idx <= currentMonthIndex : true)
                              .map((m, idx) => (
                                <SelectItem key={m} value={String(idx)}>
                                  {m}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={String(selectedYear)}
                          onValueChange={(val) => handleYearChange(Number(val))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 6 }, (_, i) => currentYear - 5 + i)
                              .filter((year) => year <= currentYear)
                              .map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                  {year}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
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
                      paginatedPayrollRecords.map((record: any) => {
                        // Parse month filter to get year and month
                        const monthInfo = parseMonthFilter(monthFilter)
                        const structure = monthInfo 
                          ? getStructureForMonth(record.employee_id, monthInfo.year, monthInfo.month)
                          : null
                        
                        // Convert annual structure numbers to monthly for display (structure is annual)
                        const toMonthly = (val: any) => safeNumber(val) / 12

                        // Use earnings_breakdown from processed payroll if available, otherwise use structure
                        let basic = 0
                        let hra = 0
                        let allowancesFromStructure = 0
                        
                        if (record.earnings_breakdown && typeof record.earnings_breakdown === 'object') {
                          // Use values from processed payroll (already monthly)
                          basic = safeNumber(record.earnings_breakdown.basic ?? 0)
                          hra = safeNumber(record.earnings_breakdown.hra ?? 0)
                          allowancesFromStructure = safeNumber(record.earnings_breakdown.allowances ?? 0)
                        } else {
                          // Fallback: calculate from structure (annual, convert to monthly)
                          const basicAnnual = safeNumber(structure?.basic ?? 0)
                          const hraAnnual = safeNumber(structure?.hra ?? 0)
                          // Allowances already includes annual bonus + other allowances from backend
                          const allowancesAnnual = safeNumber(structure?.allowances ?? 0)
                          
                          basic = toMonthly(basicAnnual)
                          hra = toMonthly(hraAnnual)
                          allowancesFromStructure = toMonthly(allowancesAnnual)
                        }
                        
                        // Calculate gross salary (monthly) from structure as fallback
                        const grossFromStructure = basic + hra + allowancesFromStructure
                        
                        // Calculate deductions monthly from structure as fallback
                        const pf = toMonthly(structure?.pf ?? 0)
                        const esi = toMonthly(structure?.esi ?? 0)
                        const professionalTax = toMonthly(structure?.professional_tax ?? 0)
                        const incomeTax = toMonthly(structure?.income_tax ?? 0)
                        const totalDeductionsFromStructure = pf + esi + professionalTax + incomeTax
                        
                        // Prefer processed payroll values when present (includes leave deductions)
                        const recordGross = safeNumber(record.gross_salary ?? grossFromStructure)
                        const recordNet = safeNumber(record.net_salary ?? (recordGross - totalDeductionsFromStructure))
                        
                        // Only show leave deductions in the list (exclude statutory components)
                        let deductions = 0
                        if (record.deductions_breakdown && typeof record.deductions_breakdown === 'object') {
                          deductions = safeNumber((record.deductions_breakdown as any).leave_deduction ?? 0)
                        } else if (record.leave_deduction !== undefined && record.leave_deduction !== null) {
                          deductions = safeNumber(record.leave_deduction)
                        }
                        
                        const net = recordNet
                        
                        // For display: allowances = hra + total allowances (which includes bonus + other allowances)
                        const allowances = hra + allowancesFromStructure
                        const departmentName = getEmployeeDepartmentName(record.employee_id) || getDepartmentName(record.department_id)
                        const status = record.status || "processed"

                        return (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900">{getEmployeeName(record.employee_id)}</p>
                                <p className="text-sm text-gray-500">
                                  {record.employee_id} {departmentName ? `• ${departmentName}` : ""}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{formatCurrencySafe(basic)}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-green-600">{formatCurrencySafe(allowances)}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-red-600">{formatCurrencySafe(deductions)}</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-gray-900">{formatCurrencySafe(net)}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(status)}>{status}</Badge>
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
                                  <DropdownMenuItem onClick={() => handleViewCalculation(record.id)}>
                                    <Calculator className="w-4 h-4 mr-2" />
                                    View Calculation
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>View Payslip</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Salary</DropdownMenuItem>
                                  <DropdownMenuItem>Download PDF</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Reprocess Payment</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
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
                {Array.isArray(salaryStructures) && salaryStructures.length > 0 ? (
                  salaryStructures.map((structure) => {
                    const basic = Number(structure.basic || 0)
                    const hra = Number(structure.hra || 0)
                    // Combine allowances and bonus for display (for backward compatibility with old data)
                    // New data will have bonus = 0, so allowances already contains the total
                    const dbAllowances = Number(structure.allowances || 0)
                    const dbBonus = Number(structure.bonus || 0)
                    const allowances = dbAllowances + dbBonus // Total allowances (other allowances + annual bonus)
                    
                    // Calculate deductions: statutory deductions + other deductions (matching PayrollBreakdown logic)
                    const pf = Number(structure.pf || 0)
                    const esi = Number(structure.esi || 0)
                    const professionalTax = Number(structure.professional_tax || 0)
                    const incomeTax = Number(structure.income_tax || 0)
                    const statutory = pf + esi + professionalTax + incomeTax
                    const otherDeductions = Number(structure.deductions || 0)
                    // Note: If deductions field already includes statutory (from old data), this might double-count
                    // But matching PayrollBreakdown logic which adds deductions + statutory
                    const totalDeductions = otherDeductions + statutory
                    
                    const gross = basic + hra + allowances
                    const net = gross - totalDeductions

                    return (
                      <Card key={structure.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{getEmployeeName(structure.employee_id)}</h3>
                              <p className="text-sm text-gray-500">
                                Employee ID: {structure.employee_id} • Effective from {structure.effective_from || "N/A"}
                                {structure.effective_upto && ` • Effective upto ${structure.effective_upto}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-sm">
                                Net: {formatCurrency(net)}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleEditSalaryStructure(structure)}>
                                    Edit structure
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => handleDeleteSalaryStructure(structure.id)}
                                  >
                                    Delete structure
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Basic Salary</p>
                              <p className="font-medium text-gray-900">{formatCurrency(basic)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">HRA</p>
                              <p className="font-medium text-gray-900">{formatCurrency(hra)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Allowances</p>
                              <p className="font-medium text-gray-900">{formatCurrency(allowances)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Deductions</p>
                              <p className="font-medium text-gray-900 text-red-600">{formatCurrency(totalDeductions)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Gross</p>
                              <p className="font-medium text-gray-900">{formatCurrency(gross)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Net</p>
                              <p className="font-medium text-gray-900">{formatCurrency(net)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <div className="text-center text-gray-500">No salary structures found.</div>
                )}
              </div>

              <div className="mt-6">
                <Button onClick={() => {
                  setEditingStructure(null)
                  setShowForm(true)
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Structure
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {showForm && (
        <SalaryStructureForm
          onClose={() => {
            setShowForm(false)
            setEditingStructure(null)
          }}
          onSubmit={handleAddSalaryStructure}
          employees={employees}
          departments={departments}
          initialData={editingStructure}
        />
      )}

      {/* Payroll Calculation Breakdown Dialog */}
      <Dialog open={showCalculationDialog} onOpenChange={setShowCalculationDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payroll Calculation Breakdown</DialogTitle>
            <DialogDescription>
              Detailed calculation for {calculationBreakdown?.employee?.name || ""} - {calculationBreakdown?.payroll?.month || ""}
            </DialogDescription>
          </DialogHeader>
          
          {loadingBreakdown ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading calculation breakdown...</div>
            </div>
          ) : calculationBreakdown ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-gray-500">Total Days</div>
                    <div className="text-2xl font-bold">{calculationBreakdown.calculation?.total_days || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-gray-500">Payable Days</div>
                    <div className="text-2xl font-bold text-green-600">{calculationBreakdown.calculation?.payable_days || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-gray-500">Unpaid Days</div>
                    <div className="text-2xl font-bold text-red-600">{calculationBreakdown.calculation?.unpaid_days || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-gray-500">Per Day Rate</div>
                    <div className="text-2xl font-bold">{formatCurrencySafe(calculationBreakdown.calculation?.per_day_rate || 0)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {calculationBreakdown.earnings_breakdown && Object.entries(calculationBreakdown.earnings_breakdown).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                        <span className="font-medium">{formatCurrencySafe(value)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Deductions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {calculationBreakdown.deductions_breakdown && Object.entries(calculationBreakdown.deductions_breakdown).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                        <span className="font-medium text-red-600">{formatCurrencySafe(value)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Present</div>
                      <div className="text-lg font-semibold text-green-600">{calculationBreakdown.attendance_summary?.present || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Half Day</div>
                      <div className="text-lg font-semibold text-yellow-600">{calculationBreakdown.attendance_summary?.half_day || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Absent</div>
                      <div className="text-lg font-semibold text-red-600">{calculationBreakdown.attendance_summary?.absent || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">No Record</div>
                      <div className="text-lg font-semibold text-gray-600">{calculationBreakdown.attendance_summary?.no_record || 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Day-by-Day Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Day-by-Day Breakdown</CardTitle>
                  <CardDescription>Daily attendance and deduction details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Day</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead className="text-right">Deduction</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calculationBreakdown.day_breakdown?.map((day: any, index: number) => (
                          <TableRow key={index} className={day.is_weekend ? "bg-gray-50" : ""}>
                            <TableCell>{format(new Date(day.date), "MMM dd, yyyy")}</TableCell>
                            <TableCell>
                              <span className={day.is_weekend ? "text-gray-500" : ""}>{day.day_name}</span>
                            </TableCell>
                            <TableCell>
                              {day.attendance_label ? (
                                <Badge className={
                                  day.attendance_status === "present" || day.attendance_status === "late" || day.attendance_status === "work_from_home" || day.attendance_status === "early_departure"
                                    ? "bg-green-100 text-green-800"
                                    : day.attendance_status === "half_day"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }>
                                  {day.attendance_label}
                                </Badge>
                              ) : day.leave_type ? (
                                <Badge className={day.leave_type === "unpaid" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>
                                  {day.leave_type === "unpaid" ? "Unpaid Leave" : "Paid Leave"}
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">
                                  {day.is_weekend ? "Weekend" : "Present"}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{day.reason}</TableCell>
                            <TableCell className="text-right">
                              {day.deduction > 0 ? (
                                <span className="text-red-600 font-medium">-{day.deduction} day{day.deduction !== 1 ? 's' : ''}</span>
                              ) : (
                                <span className="text-green-600">No deduction</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Final Calculation */}
              <Card>
                <CardHeader>
                  <CardTitle>Final Calculation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Gross Salary:</span>
                    <span className="font-bold">{formatCurrencySafe(calculationBreakdown.payroll?.gross_salary || 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg text-red-600">
                    <span>Total Deductions:</span>
                    <span className="font-bold">-{formatCurrencySafe(calculationBreakdown.calculation?.total_deduction_amount || 0)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-xl">
                    <span className="font-bold">Net Salary:</span>
                    <span className="font-bold text-green-600">{formatCurrencySafe(calculationBreakdown.payroll?.net_salary || 0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No calculation data available</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </ResourceGuard>
  )
}
