"use client"

import { useEffect, useMemo, useState } from "react"
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
import {
  IndianRupee,
  Search,
  Plus,
  MoreHorizontal,
  Download,
  Calculator,
  Clock,
  CheckCircle,
  Calendar as CalendarIcon,
  Receipt,
  Building2,
  User,
  CreditCard,
  Printer,
} from "lucide-react"
import { SalaryStructureForm } from "@/components/forms/salary-structure-form"
import { PayrollEditForm } from "@/components/forms/payroll-edit-form"
import { ResourceGuard } from "@/lib/auth/auth.guards"
import { useAuth } from "@/lib/auth/auth.hooks"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function PayrollPage() {
  const [searchTerm, setSearchTerm] = useState("")
  
  // Set default month filter to current month
  const getCurrentMonthFilter = () => {
    const now = new Date()
    const monthNames = ["january", "february", "march", "april", "may", "june", 
                       "july", "august", "september", "october", "november", "december"]
    const monthName = monthNames[now.getMonth()]
    const year = now.getFullYear()
    return `${monthName}-${year}`
  }
  
  const [monthFilter, setMonthFilter] = useState(getCurrentMonthFilter())
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
  const [showProcessDialog, setShowProcessDialog] = useState(false)
  const [payrollPreview, setPayrollPreview] = useState<any>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [showCalculationDialog, setShowCalculationDialog] = useState(false)
  const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null)
  const [calculationBreakdown, setCalculationBreakdown] = useState<any>(null)
  const [loadingBreakdown, setLoadingBreakdown] = useState(false)
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null)
  const [editingPayroll, setEditingPayroll] = useState<any | null>(null)
  const [showPayrollEditDialog, setShowPayrollEditDialog] = useState(false)
  const [isEditingFromReviewModal, setIsEditingFromReviewModal] = useState(false)
  const [temporaryPayrollEdits, setTemporaryPayrollEdits] = useState<Record<number, any>>({})
  const { checkPermission } = useAuth()

  // Payroll permissions
  const canPayrollIndex = checkPermission("payrolls.index")
  const canPayrollCreate = checkPermission("payrolls.create")
  const canPayrollUpdate = checkPermission("payrolls.update")
  const canPayrollDestroy = checkPermission("payrolls.destroy")
  const canPayrollShow = checkPermission("payrolls.show")
  
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

  // Auto-detect and set month filter to a month that has payroll records (only on initial load)
  const [hasAutoDetectedMonth, setHasAutoDetectedMonth] = useState(false)
  useEffect(() => {
    if (payrollRecords.length > 0 && !hasAutoDetectedMonth) {
      // Check if current month has records by comparing month filter
      const currentMonthInfo = parseMonthFilter(monthFilter)
      const hasCurrentMonthRecords = currentMonthInfo ? payrollRecords.some((record: any) => {
        if (!record.month) return false
        // Parse record month (e.g., "November 2024")
        const match = record.month.match(/(\w+)\s+(\d{4})/i)
        if (match) {
          const monthNames = ["january", "february", "march", "april", "may", "june", 
                             "july", "august", "september", "october", "november", "december"]
          const monthName = match[1].toLowerCase()
          const year = parseInt(match[2], 10)
          const monthIndex = monthNames.findIndex(m => m.startsWith(monthName))
          return monthIndex + 1 === currentMonthInfo.month && year === currentMonthInfo.year
        }
        return false
      }) : false
      
      if (!hasCurrentMonthRecords) {
        // Find the most recent month with records
        const monthNames = ["january", "february", "march", "april", "may", "june", 
                           "july", "august", "september", "october", "november", "december"]
        const monthsWithRecords = payrollRecords
          .map((record: any) => {
            if (!record.month) return null
            const match = record.month.match(/(\w+)\s+(\d{4})/i)
            if (match) {
              const monthName = match[1].toLowerCase()
              const year = parseInt(match[2], 10)
              const monthIndex = monthNames.findIndex(m => m.startsWith(monthName))
              if (monthIndex >= 0) {
                return { monthIndex, year }
              }
            }
            return null
          })
          .filter(Boolean)
          .sort((a: any, b: any) => {
            if (a.year !== b.year) return b.year - a.year
            return b.monthIndex - a.monthIndex
          })
        
        if (monthsWithRecords.length > 0) {
          const mostRecent = monthsWithRecords[0] as any
          const monthName = monthNames[mostRecent.monthIndex]
          const newFilter = `${monthName}-${mostRecent.year}`
          setMonthFilter(newFilter)
        }
      }
      setHasAutoDetectedMonth(true)
    }
  }, [payrollRecords, hasAutoDetectedMonth, monthFilter])

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
      const data = await apiRequest(getEndpointUrl('PAYROLLS'), { suppressToast: true })
      // Ensure data is an array
      setPayrollRecords(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Error fetching payroll records:", err)
      // Only surface non-permission errors to the user
      if (err && err.statusCode !== 403 && !err.toastShown) {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch payroll records",
          variant: "destructive",
        })
      }
      setPayrollRecords([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSalaryStructures = async () => {
    setLoading(true)
    try {
      const data = await apiRequest(getEndpointUrl('SALARY_STRUCTURES'), { suppressToast: true })
      // Ensure data is an array
      setSalaryStructures(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Error fetching salary structures:", err)
      if (err && err.statusCode !== 403 && !err.toastShown) {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch salary structures",
          variant: "destructive",
        })
      }
      setSalaryStructures([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const data = await apiRequest(`${getEndpointUrl('EMPLOYEES')}?per_page=500`, { suppressToast: true })
      const list = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : []
      setEmployees(list)
    } catch (err: any) {
      console.error("Error fetching employees:", err)
      if (err && err.statusCode !== 403 && !err.toastShown) {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch employees",
          variant: "destructive",
        })
      }
      setEmployees([])
    }
  }

  const fetchDepartments = async () => {
    try {
      const data = await apiRequest(getEndpointUrl('DEPARTMENTS'), { suppressToast: true })
      setDepartments(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Error fetching departments:", err)
      if (err && err.statusCode !== 403 && !err.toastShown) {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch departments",
          variant: "destructive",
        })
      }
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

  const fetchPayrollPreview = async () => {
    setLoadingPreview(true)
    setPreviewError(null)
    try {
      const data = await apiRequest(getEndpointUrl("PAYROLL_PROCESS_MONTH"), {
        method: "POST",
        body: JSON.stringify({
          month: monthFilter,
          preview: true,
        }),
      })
      setPayrollPreview(data)
    } catch (err: any) {
      const message = err?.message || "Failed to load payroll preview"
      setPreviewError(message)
      toast({
        title: "Preview failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoadingPreview(false)
    }
  }

  const processPayroll = async () => {
    setProcessingPayroll(true)
    try {
      // First, apply all temporary edits permanently
      const editPromises = Object.entries(temporaryPayrollEdits).map(async ([employeeId, editData]) => {
        if (editData.id) {
          // Update existing payroll
          return apiRequest(`${getEndpointUrl('PAYROLLS')}/${editData.id}`, {
            method: "PUT",
            body: JSON.stringify({
              payroll: {
                gross_salary: editData.gross_salary,
                net_salary: editData.net_salary,
                leave_deduction: editData.leave_deduction,
                unpaid_days: editData.unpaid_days,
                status: "processed"
              }
            })
          })
        } else {
          // Create new payroll record
          const monthInfo = parseMonthFilter(monthFilter)
          const monthLabel = monthInfo 
            ? `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][monthInfo.month - 1]} ${monthInfo.year}`
            : formatMonthDisplay(monthFilter)
          
          return apiRequest(getEndpointUrl('PAYROLLS'), {
            method: "POST",
            body: JSON.stringify({
              payroll: {
                employee_id: Number(employeeId),
                month: monthLabel,
                gross_salary: editData.gross_salary,
                net_salary: editData.net_salary,
                leave_deduction: editData.leave_deduction,
                unpaid_days: editData.unpaid_days,
                status: "processed"
              }
            })
          })
        }
      })
      
      // Apply all temporary edits
      if (editPromises.length > 0) {
        await Promise.all(editPromises)
      }
      
      // Now process the payroll
      const response = await apiRequest(getEndpointUrl("PAYROLL_PROCESS_MONTH"), {
        method: "POST",
        body: JSON.stringify({
          month: monthFilter,
          preview: false,
        }),
      })
      
      // Clear temporary edits after successful processing
      setTemporaryPayrollEdits({})
      
      toast({
        title: "Payroll processed",
        description: `Processed payroll for ${formatMonthDisplay(monthFilter)}${Object.keys(temporaryPayrollEdits).length > 0 ? ' with your edits applied' : ''}.`,
      })
      setShowProcessDialog(false)
      // Refresh payroll records after processing
      await fetchPayrollRecords()
      // Ensure month filter is set to the processed month so records are visible
      // The month filter should already be set, but we ensure it matches
      if (response?.month) {
        // Parse the response month and set filter if needed
        const processedMonth = response.month
        // The month filter should already match, but we refresh to ensure visibility
      }
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

  const handleOpenProcessDialog = () => {
    setShowProcessDialog(true)
    fetchPayrollPreview()
  }

  const handleEditSalaryForEmployee = async (employeeId: number, fromReviewModal: boolean = false) => {
    try {
      const monthInfo = parseMonthFilter(monthFilter)
      const monthLabel = monthInfo 
        ? `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][monthInfo.month - 1]} ${monthInfo.year}`
        : formatMonthDisplay(monthFilter)
      
      // Get salary structure first to calculate correct values
      let calculatedGross = 0
      let calculatedNet = 0
      let calculatedLeaveDeduction = 0
      let calculatedUnpaidDays = 0
      
      if (monthInfo) {
        const structure = getStructureForMonth(employeeId, monthInfo.year, monthInfo.month)
        if (structure) {
          const toMonthly = (val: number) => (val || 0) / 12
          const basic = toMonthly(structure.basic || 0)
          const hra = toMonthly(structure.hra || 0)
          const allowances = toMonthly(structure.allowances || 0)
          calculatedGross = basic + hra + allowances
          
          const pf = toMonthly(structure.pf || 0)
          const esi = toMonthly(structure.esi || 0)
          const professionalTax = toMonthly(structure.professional_tax || 0)
          const incomeTax = toMonthly(structure.income_tax || 0)
          const totalDeductions = pf + esi + professionalTax + incomeTax
          calculatedNet = calculatedGross - totalDeductions
        }
      }
      
      // Priority 1: Try to find existing processed payroll record from database
      let existingPayroll = payrollRecords.find((r: any) => 
        r.employee_id === employeeId && r.month === monthLabel
      )
      
      // If found but has 0 values, use calculated values from structure
      if (existingPayroll) {
        if (existingPayroll.gross_salary === 0 || existingPayroll.net_salary === 0) {
          // Use calculated values from structure if payroll has 0 values
          existingPayroll = {
            ...existingPayroll,
            gross_salary: calculatedGross || existingPayroll.gross_salary,
            net_salary: calculatedNet || existingPayroll.net_salary,
            leave_deduction: existingPayroll.leave_deduction || calculatedLeaveDeduction,
            unpaid_days: existingPayroll.unpaid_days || calculatedUnpaidDays
          }
        }
        setEditingPayroll(existingPayroll)
        setIsEditingFromReviewModal(fromReviewModal)
        setShowPayrollEditDialog(true)
        return
      }
      
      // Priority 2: Use preview data if available (from review modal)
      if (payrollPreview && Array.isArray(payrollPreview.payrolls)) {
        const previewData = payrollPreview.payrolls.find((p: any) => p.employee_id === employeeId)
        if (previewData) {
          // Check if there are temporary edits for this employee
          const tempEdit = temporaryPayrollEdits[employeeId]
          
          // If preview has 0 values, use calculated values from structure
          let payrollToEdit = (previewData.gross_salary === 0 || previewData.net_salary === 0)
            ? {
                ...previewData,
                gross_salary: calculatedGross || previewData.gross_salary,
                net_salary: calculatedNet || previewData.net_salary,
                leave_deduction: previewData.leave_deduction || calculatedLeaveDeduction,
                unpaid_days: previewData.unpaid_days || calculatedUnpaidDays
              }
            : previewData
          
          // Merge temporary edits if they exist
          if (tempEdit) {
            payrollToEdit = {
              ...payrollToEdit,
              ...tempEdit
            }
          }
          
          setEditingPayroll(payrollToEdit)
          setIsEditingFromReviewModal(fromReviewModal)
          setShowPayrollEditDialog(true)
          return
        }
      }
      
      // If editing from review modal but no preview data, still set the flag
      if (fromReviewModal) {
        setIsEditingFromReviewModal(true)
      } else {
        setIsEditingFromReviewModal(false)
      }
      
      // Priority 3: Calculate from salary structure as fallback
      if (calculatedGross > 0) {
        const calculatedPayroll = {
          employee_id: employeeId,
          month: monthLabel,
          gross_salary: calculatedGross,
          net_salary: calculatedNet,
          leave_deduction: calculatedLeaveDeduction,
          unpaid_days: calculatedUnpaidDays,
          status: "draft"
        }
        
        setEditingPayroll(calculatedPayroll)
        setIsEditingFromReviewModal(fromReviewModal)
        setShowPayrollEditDialog(true)
        return
      }
      
      toast({
        title: "No payroll data",
        description: "No payroll data found for this employee for this month.",
        variant: "destructive",
      })
    } catch (err: any) {
      toast({
        title: "Error loading payroll",
        description: err?.message || "Failed to load payroll data",
        variant: "destructive",
      })
    }
  }

  const handleSavePayrollEdit = async (updatedData: any) => {
    try {
      // If editing from review modal, store changes temporarily
      if (isEditingFromReviewModal) {
        const employeeId = updatedData.employee_id || updatedData.id
        setTemporaryPayrollEdits((prev) => ({
          ...prev,
          [employeeId]: {
            gross_salary: updatedData.gross_salary,
            net_salary: updatedData.net_salary,
            leave_deduction: updatedData.leave_deduction,
            unpaid_days: updatedData.unpaid_days,
            id: updatedData.id, // Preserve ID if it exists
            employee_id: employeeId
          }
        }))
        
        // Update the preview to reflect temporary changes
        if (payrollPreview && Array.isArray(payrollPreview.payrolls)) {
          const updatedPreview = {
            ...payrollPreview,
            payrolls: payrollPreview.payrolls.map((p: any) => {
              if (p.employee_id === employeeId) {
                return {
                  ...p,
                  gross_salary: updatedData.gross_salary,
                  net_salary: updatedData.net_salary,
                  leave_deduction: updatedData.leave_deduction,
                  unpaid_days: updatedData.unpaid_days
                }
              }
              return p
            })
          }
          setPayrollPreview(updatedPreview)
        }
        
        toast({
          title: "Changes saved temporarily",
          description: "Changes will be applied when you proceed to process payroll.",
        })
        
        setShowPayrollEditDialog(false)
        setEditingPayroll(null)
        setIsEditingFromReviewModal(false)
        return
      }
      
      // Normal edit flow - save permanently to database
      if (updatedData.id) {
        // Update existing payroll
        await apiRequest(`${getEndpointUrl('PAYROLLS')}/${updatedData.id}`, {
          method: "PUT",
          body: JSON.stringify({
            payroll: {
              gross_salary: updatedData.gross_salary,
              net_salary: updatedData.net_salary,
              leave_deduction: updatedData.leave_deduction,
              unpaid_days: updatedData.unpaid_days,
              status: updatedData.status || "processed"
            }
          })
        })
        toast({
          title: "Payroll updated",
          description: "Payroll record has been updated successfully.",
        })
      } else {
        // Create new payroll record
        const monthInfo = parseMonthFilter(monthFilter)
        const monthLabel = monthInfo 
          ? `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][monthInfo.month - 1]} ${monthInfo.year}`
          : formatMonthDisplay(monthFilter)
        
        await apiRequest(getEndpointUrl('PAYROLLS'), {
          method: "POST",
          body: JSON.stringify({
            payroll: {
              employee_id: updatedData.employee_id,
              month: monthLabel,
              gross_salary: updatedData.gross_salary,
              net_salary: updatedData.net_salary,
              status: updatedData.status || "processed"
            }
          })
        })
        toast({
          title: "Payroll created",
          description: "Payroll record has been created successfully.",
        })
      }
      
      setShowPayrollEditDialog(false)
      setEditingPayroll(null)
      setIsEditingFromReviewModal(false)
      // Refresh preview and records
      await fetchPayrollPreview()
      await fetchPayrollRecords()
    } catch (err: any) {
      toast({
        title: "Failed to save payroll",
        description: err?.message || "Please try again",
        variant: "destructive",
      })
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
        // Use both employee_id and month as the key to allow multiple records per employee (one per month)
        const month = String(record?.month || "").trim().toLowerCase()
        const key = `${record.employee_id}-${month}`
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
          annual_ctc: Number(formData.annualCtc || 0),
          monthly_ctc: Number(formData.monthlyCtc || 0),
          effective_from: formData.effective_from,
          effective_upto: formData.effective_upto || null,
          revision_type: formData.revision_type || "appraisal",
          notes: formData.notes || null,
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

  const sumNetPayroll = (records: any[]) =>
    records.reduce((sum, record) => sum + safeNumber(record.net_salary), 0)

  const sumStatutoryDeductions = (records: any[]) =>
    records.reduce((sum, record) => {
      const breakdown = record.deductions_breakdown || {}
      return (
        sum +
        safeNumber(breakdown.pf) +
        safeNumber(breakdown.esi) +
        safeNumber(breakdown.professional_tax) +
        safeNumber(breakdown.income_tax)
      )
    }, 0)

  const formatCompactInr = (amount: number) => {
    const abs = Math.abs(amount)
    if (abs >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`
    if (abs >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`
    if (abs >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`
    return formatCurrency(amount)
  }

  const getPreviousMonthFilter = (filter: string) => {
    const monthInfo = parseMonthFilter(filter)
    if (!monthInfo) return null
    let month = monthInfo.month - 1
    let year = monthInfo.year
    if (month < 1) {
      month = 12
      year -= 1
    }
    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december",
    ]
    return `${monthNames[month - 1]}-${year}`
  }

  const activeEmployeeCount = useMemo(() => {
    if (!Array.isArray(employees)) return 0
    return employees.filter((employee: any) => employee.status === "active" || !employee.status).length
  }, [employees])

  const payrollStats = useMemo(() => {
    const monthRecords = normalizedPayrollRecords.filter(isRecordInSelectedMonth)
    const totalNet = sumNetPayroll(monthRecords)
    const processedCount = monthRecords.filter(
      (record) => String(record.status || "processed").toLowerCase() === "processed"
    ).length
    const pendingInRecords = monthRecords.filter((record) => {
      const status = String(record.status || "").toLowerCase()
      return status === "pending" || status === "processing"
    }).length
    const missingPayroll = Math.max(0, activeEmployeeCount - monthRecords.length)
    const pendingApprovals = pendingInRecords > 0 ? pendingInRecords : missingPayroll
    const totalTax = sumStatutoryDeductions(monthRecords)

    const previousFilter = getPreviousMonthFilter(monthFilter)
    const previousLabel = previousFilter ? formatMonthDisplay(previousFilter) : null
    const previousRecords = previousLabel
      ? normalizedPayrollRecords.filter(
          (record) =>
            String(record?.month || "").trim().toLowerCase() === previousLabel.trim().toLowerCase()
        )
      : []
    const previousTotal = sumNetPayroll(previousRecords)
    const percentChange =
      previousTotal > 0 ? ((totalNet - previousTotal) / previousTotal) * 100 : null

    const completionPct =
      activeEmployeeCount > 0
        ? Math.round((processedCount / activeEmployeeCount) * 100)
        : monthRecords.length > 0
          ? 100
          : 0

    let payrollChange = "No payroll for this month"
    if (monthRecords.length > 0) {
      payrollChange =
        percentChange !== null
          ? `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(1)}% from last month`
          : "No prior month data"
    }

    return [
      {
        title: "Total Payroll",
        value: formatCompactInr(totalNet),
        change: payrollChange,
        icon: IndianRupee,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Employees Paid",
        value: String(processedCount),
        change:
          activeEmployeeCount > 0
            ? `${completionPct}% of ${activeEmployeeCount} active`
            : `${monthRecords.length} record${monthRecords.length === 1 ? "" : "s"}`,
        icon: CheckCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Pending Approvals",
        value: String(pendingApprovals),
        change: pendingApprovals === 0 ? "All employees processed" : "Awaiting payroll run",
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
      {
        title: "Tax Deducted",
        value: formatCompactInr(totalTax),
        change: "TDS + PF + ESI",
        icon: Calculator,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
    ]
  }, [
    normalizedPayrollRecords,
    selectedMonthLabel,
    monthFilter,
    activeEmployeeCount,
  ])

  // Build shared HTML for payslip (used for both view and PDF download)
  const buildPayslipHtml = ({
    record,
    amounts,
    departmentName,
  }: {
    record: any
    amounts: any
    departmentName: string
  }) => {
    // Get employee details
    const employee = Array.isArray(employees)
      ? employees.find((e: any) => String(e.id) === String(record.employee_id))
      : null

    const employeeName = getEmployeeName(record.employee_id)
    const employeeDesignation = employee?.designation || "N/A"
    const employeeDateOfJoining = employee?.date_of_joining
      ? new Date(employee.date_of_joining).toLocaleDateString()
      : "N/A"

    // Parse month from monthLabel or monthFilter
    const monthLabel = record.month || formatMonthDisplay(monthFilter)
    const monthInfo = parseMonthFilter(monthFilter)
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    const monthName = monthInfo ? monthNames[monthInfo.month - 1] : monthLabel.split(" ")[0]
    const year = monthInfo ? monthInfo.year : new Date().getFullYear()

    // Get deductions breakdown from record or structure
    const monthInfoForStructure = parseMonthFilter(monthFilter)
    const structure = monthInfoForStructure
      ? getStructureForMonth(record.employee_id, monthInfoForStructure.year, monthInfoForStructure.month)
      : null

    const toMonthly = (val: any) => safeNumber(val) / 12

    // Get statutory deductions from structure (annual, convert to monthly)
    const pf = toMonthly(structure?.pf ?? 0)
    const esi = toMonthly(structure?.esi ?? 0)
    const professionalTax = toMonthly(structure?.professional_tax ?? 0)
    const incomeTax = toMonthly(structure?.income_tax ?? 0)
    const leaveDeduction = amounts.deductions || 0

    // Get CTC from structure (annual, convert to monthly)
    const annualCtc = structure?.annual_ctc ?? 0
    const monthlyCtc = structure?.monthly_ctc ?? 0

    // Calculate total deductions
    const totalDeductions = pf + esi + professionalTax + incomeTax + leaveDeduction

    // Payment date - use record date or current date
    const paymentDate = record.created_at
      ? new Date(record.created_at).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })

    // Break down allowances - for display, we'll show HRA separately and other allowances combined
    const otherAllowances = amounts.allowances - amounts.hra

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Salary Slip - ${monthName} ${year}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            padding: 40px;
            background: white;
            color: #1f2937;
            line-height: 1.6;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        .header {
            border-bottom: 3px solid #374151;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        .company-details {
            font-size: 12px;
            color: #6b7280;
            line-height: 1.8;
        }
        .statement-title {
            text-align: right;
        }
        .statement-title h2 {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .statement-title p {
            font-size: 12px;
            color: #6b7280;
        }
        .employee-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 15px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 13px;
            border-bottom: 1px solid #f3f4f6;
        }
        .detail-label {
            color: #6b7280;
        }
        .detail-value {
            font-weight: 600;
            color: #1f2937;
        }
        .salary-breakdown {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .earnings, .deductions {
            border: 2px solid;
            padding: 20px;
            border-radius: 8px;
        }
        .earnings {
            border-color: #10b981;
        }
        .deductions {
            border-color: #ef4444;
        }
        .breakdown-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid;
        }
        .earnings .breakdown-title {
            color: #10b981;
            border-color: #10b981;
        }
        .deductions .breakdown-title {
            color: #ef4444;
            border-color: #ef4444;
        }
        .breakdown-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 14px;
            border-bottom: 1px solid #e5e7eb;
        }
        .breakdown-label {
            color: #374151;
        }
        .breakdown-value {
            font-weight: 600;
        }
        .earnings .breakdown-value {
            color: #10b981;
        }
        .deductions .breakdown-value {
            color: #ef4444;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            margin-top: 10px;
            border-top: 2px solid #d1d5db;
            font-size: 16px;
            font-weight: bold;
        }
        .net-salary {
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
            padding: 25px;
            border-radius: 8px;
            border: 2px solid #3b82f6;
            margin-bottom: 30px;
        }
        .net-salary-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .net-amount {
            font-size: 32px;
            font-weight: bold;
            color: #1f2937;
            margin: 10px 0;
        }
        .net-label {
            font-size: 13px;
            color: #6b7280;
        }
        .net-date {
            font-size: 11px;
            color: #9ca3af;
            margin-top: 5px;
        }
        .amount-in-words {
            background: white;
            padding: 15px;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .amount-in-words-label {
            font-size: 11px;
            color: #6b7280;
            margin-bottom: 5px;
        }
        .amount-in-words-value {
            font-size: 13px;
            font-weight: 600;
            color: #374151;
        }
        .ytd-summary {
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            margin-bottom: 30px;
        }
        .ytd-title {
            font-size: 14px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 15px;
        }
        .ytd-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }
        .ytd-item {
            background: #f9fafb;
            padding: 15px;
            border-radius: 6px;
        }
        .ytd-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
        }
        .ytd-value {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
        }
        .footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
        }
        .footer p {
            margin: 5px 0;
        }
        @media print {
            body {
                padding: 20px;
            }
            .container {
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-info">
                <div>
                    <div class="company-name">BevyHR</div>
                    <div class="company-details">
                        123 Business Park, Corporate Tower<br>
                        Mumbai, Maharashtra - 400001<br>
                        Phone: +91 22 1234 5678 | Email: hr@bevyhr.com
                    </div>
                </div>
                <div class="statement-title">
                    <h2>SALARY STATEMENT</h2>
                    <p>For the month of ${monthName} ${year}</p>
                </div>
            </div>
        </div>

        <div class="employee-section">
            <div>
                <div class="section-title">Employee Details</div>
                <div class="detail-row">
                    <span class="detail-label">Employee Name:</span>
                    <span class="detail-value">${employeeName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Employee ID:</span>
                    <span class="detail-value">${record.employee_id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Designation:</span>
                    <span class="detail-value">${employeeDesignation}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${departmentName || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date of Joining:</span>
                    <span class="detail-value">${employeeDateOfJoining}</span>
                </div>
            </div>
            <div>
                <div class="section-title">Payment Details</div>
                <div class="detail-row">
                    <span class="detail-label">Payment Date:</span>
                    <span class="detail-value">${paymentDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Month:</span>
                    <span class="detail-value">${monthName} ${year}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Bank Account:</span>
                    <span class="detail-value">****1234 (HDFC Bank)</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">PAN Number:</span>
                    <span class="detail-value">ABCDE1234F</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">${record.status || 'Paid'}</span>
                </div>
                ${annualCtc > 0 ? `
                <div class="detail-row">
                    <span class="detail-label">Annual CTC:</span>
                    <span class="detail-value">${formatCurrencySafe(annualCtc)}</span>
                </div>
                ` : ''}
                ${monthlyCtc > 0 ? `
                <div class="detail-row">
                    <span class="detail-label">Monthly CTC:</span>
                    <span class="detail-value">${formatCurrencySafe(monthlyCtc)}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="salary-breakdown">
            <div class="earnings">
                <div class="breakdown-title">Earnings</div>
                <div class="breakdown-row">
                    <span class="breakdown-label">Basic Salary</span>
                    <span class="breakdown-value">${formatCurrencySafe(amounts.basic)}</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-label">House Rent Allowance (HRA)</span>
                    <span class="breakdown-value">${formatCurrencySafe(amounts.hra)}</span>
                </div>
                ${otherAllowances > 0 ? `
                <div class="breakdown-row">
                    <span class="breakdown-label">Other Allowances</span>
                    <span class="breakdown-value">${formatCurrencySafe(otherAllowances)}</span>
                </div>
                ` : ''}
                <div class="total-row">
                    <span>Total Earnings</span>
                    <span style="color: #10b981;">${formatCurrencySafe(amounts.gross)}</span>
                </div>
            </div>
            <div class="deductions">
                <div class="breakdown-title">Deductions</div>
                ${pf > 0 ? `
                <div class="breakdown-row">
                    <span class="breakdown-label">Provident Fund (PF)</span>
                    <span class="breakdown-value">${formatCurrencySafe(pf)}</span>
                </div>
                ` : ''}
                ${professionalTax > 0 ? `
                <div class="breakdown-row">
                    <span class="breakdown-label">Professional Tax</span>
                    <span class="breakdown-value">${formatCurrencySafe(professionalTax)}</span>
                </div>
                ` : ''}
                ${incomeTax > 0 ? `
                <div class="breakdown-row">
                    <span class="breakdown-label">Income Tax (TDS)</span>
                    <span class="breakdown-value">${formatCurrencySafe(incomeTax)}</span>
                </div>
                ` : ''}
                ${esi > 0 ? `
                <div class="breakdown-row">
                    <span class="breakdown-label">Employee State Insurance (ESI)</span>
                    <span class="breakdown-value">${formatCurrencySafe(esi)}</span>
                </div>
                ` : ''}
                ${leaveDeduction > 0 ? `
                <div class="breakdown-row">
                    <span class="breakdown-label">Leave Deduction</span>
                    <span class="breakdown-value">${formatCurrencySafe(leaveDeduction)}</span>
                </div>
                ` : ''}
                <div class="total-row">
                    <span>Total Deductions</span>
                    <span style="color: #ef4444;">${formatCurrencySafe(totalDeductions)}</span>
                </div>
            </div>
        </div>

        <div class="net-salary">
            <div class="net-salary-content">
                <div>
                    <div class="net-label">Net Salary Payable</div>
                    <div class="net-amount">${formatCurrencySafe(amounts.net)}</div>
                    <div class="net-date">Paid on ${paymentDate}</div>
                </div>
                <div class="amount-in-words">
                    <div class="amount-in-words-label">In Words</div>
                    <div class="amount-in-words-value">Amount in words (system generated)</div>
                </div>
            </div>
        </div>

        <div class="ytd-summary">
            <div class="ytd-title">Year-to-Date Summary</div>
            <div class="ytd-grid">
                <div class="ytd-item">
                    <div class="ytd-label">Total Earnings (YTD)</div>
                    <div class="ytd-value">${formatCurrencySafe(amounts.gross)}</div>
                </div>
                <div class="ytd-item">
                    <div class="ytd-label">Total Deductions (YTD)</div>
                    <div class="ytd-value">${formatCurrencySafe(totalDeductions)}</div>
                </div>
                <div class="ytd-item">
                    <div class="ytd-label">Net Paid (YTD)</div>
                    <div class="ytd-value">${formatCurrencySafe(amounts.net)}</div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>This is a system generated salary slip. No signature is required.</p>
            <p>For queries, please contact HR Department at hr@bevyhr.com</p>
            <p style="margin-top: 10px; color: #9ca3af;">
                Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </p>
        </div>
    </div>
</body>
</html>
`
  }

  // Render payslip in a new tab/window for viewing
  const openPayslipWindow = ({
    record,
    amounts,
    departmentName,
  }: {
    record: any
    amounts: any
    departmentName: string
  }) => {
    if (typeof window === "undefined") return

    const slipWindow = window.open("", "_blank", "width=900,height=1100")

    if (!slipWindow) {
      toast({
        title: "Pop-up blocked",
        description: "Allow pop-ups to view the payslip.",
        variant: "destructive",
      })
      return
    }

    const html = buildPayslipHtml({ record, amounts, departmentName })
    slipWindow.document.write(html)
    slipWindow.document.close()
    slipWindow.focus()
  }

  // Download payslip as PDF using same HTML format
  const downloadPayslipPdf = async ({
    record,
    amounts,
    departmentName,
  }: {
    record: any
    amounts: any
    departmentName: string
  }) => {
    if (typeof document === "undefined") return

    const htmlContent = buildPayslipHtml({ record, amounts, departmentName })

    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = htmlContent
    tempDiv.style.position = "absolute"
    tempDiv.style.left = "-9999px"
    tempDiv.style.width = "800px"
    document.body.appendChild(tempDiv)

    try {
      const [{ jsPDF }, html2canvasModule] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ])
      const html2canvas = html2canvasModule.default

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const employeeName = String(getEmployeeName(record.employee_id) || "")
        .trim()
        .replace(/\s+/g, "_")
      const monthLabelSafe = String(record.month || formatMonthDisplay(monthFilter))
        .trim()
        .replace(/\s+/g, "_")

      pdf.save(`Salary_Slip_${employeeName}_${monthLabelSafe}.pdf`)
    } catch (error) {
      console.error("Error generating payslip PDF:", error)
      toast({
        title: "PDF generation failed",
        description: "Unable to generate payslip PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      document.body.removeChild(tempDiv)
    }
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
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-2xl sm:text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600">Manage employee salaries and compensation</p>
        </div>
        <div className="hrms-action-row w-full sm:w-auto">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Payroll
          </Button>
          {canPayrollCreate && (
            <Button size="sm" onClick={handleOpenProcessDialog}>
              <Calculator className="w-4 h-4 mr-2" />
              Process Payroll
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
        <TabsList className="hrms-tabs-scroll lg:w-auto">
          {canPayrollIndex && <TabsTrigger value="records">Payroll Records</TabsTrigger>}
          {canPayrollIndex && <TabsTrigger value="structures">Salary Structures</TabsTrigger>}
        </TabsList>

        {canPayrollIndex && (
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

              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Leave Deduction</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                      {(canPayrollShow || canPayrollUpdate || canPayrollCreate) && (
                        <TableHead className="w-12"></TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPayrollRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={(canPayrollShow || canPayrollUpdate || canPayrollCreate) ? 7 : 6} className="text-center text-gray-500 py-8">
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

                        const totalDeductionsAll = pf + esi + professionalTax + incomeTax + deductions

                        const amountsForSlip = {
                          basic,
                          hra,
                          allowances,
                          deductions,
                          gross: recordGross,
                          net,
                          pf,
                          esi,
                          professionalTax,
                          incomeTax,
                          leaveDeduction: deductions,
                          totalDeductions: totalDeductionsAll,
                        }

                        const handleViewPayslip = () => {
                          setSelectedPayslip({
                            record,
                            amounts: amountsForSlip,
                            departmentName,
                          })
                        }

                        const handleDownloadPayslipPdf = () => {
                          downloadPayslipPdf({
                            record,
                            amounts: amountsForSlip,
                            departmentName,
                          })
                        }

                        const handleReprocessPayment = async () => {
                          await processPayroll()
                        }

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
                              {(canPayrollShow || canPayrollUpdate || canPayrollCreate) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    {canPayrollShow && (
                                      <DropdownMenuItem onClick={() => handleViewCalculation(record.id)}>
                                        <Calculator className="w-4 h-4 mr-2" />
                                        View Calculation
                                      </DropdownMenuItem>
                                    )}
                                    {canPayrollShow && (
                                      <DropdownMenuItem onClick={handleViewPayslip}>View Payslip</DropdownMenuItem>
                                    )}
                                    {canPayrollUpdate && (
                                      <DropdownMenuItem onClick={() => handleEditSalaryForEmployee(record.employee_id)}>
                                        Edit Salary
                                      </DropdownMenuItem>
                                    )}
                                    {canPayrollShow && (
                                      <DropdownMenuItem onClick={handleDownloadPayslipPdf}>Download PDF</DropdownMenuItem>
                                    )}
                                    {canPayrollCreate && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleReprocessPayment}>Reprocess Payment</DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {paginatedPayrollRecords.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No payroll records found.</div>
                ) : (
                  paginatedPayrollRecords.map((record: any) => {
                    const departmentName = getEmployeeDepartmentName(record.employee_id) || getDepartmentName(record.department_id)
                    const status = record.status || "processed"
                    const basic = safeNumber(record.earnings_breakdown?.basic ?? 0)
                    const net = safeNumber(record.net_salary ?? 0)
                    const deductions = safeNumber(record.leave_deduction ?? record.deductions_breakdown?.leave_deduction ?? 0)
                    return (
                      <div key={record.id} className="border rounded-lg p-4 space-y-3 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{getEmployeeName(record.employee_id)}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {record.employee_id}{departmentName ? ` • ${departmentName}` : ""}
                            </p>
                          </div>
                          <Badge className={getStatusColor(status)}>{status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Basic</span>
                            <p className="font-medium">{formatCurrencySafe(basic)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Leave Ded.</span>
                            <p className="font-medium text-red-600">{formatCurrencySafe(deductions)}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Net Salary</span>
                            <p className="font-bold text-gray-900">{formatCurrencySafe(net)}</p>
                          </div>
                        </div>
                        {(canPayrollShow || canPayrollUpdate || canPayrollCreate) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => canPayrollShow && handleViewCalculation(record.id)}
                          >
                            View Details
                          </Button>
                        )}
                      </div>
                    )
                  })
                )}
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
        )}

        {canPayrollIndex && (
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
                              {(canPayrollUpdate || canPayrollDestroy) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    {canPayrollUpdate && (
                                      <DropdownMenuItem onClick={() => handleEditSalaryStructure(structure)}>
                                        Edit structure
                                      </DropdownMenuItem>
                                    )}
                                    {canPayrollDestroy && (
                                      <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onClick={() => handleDeleteSalaryStructure(structure.id)}
                                      >
                                        Delete structure
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
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

              {canPayrollCreate && (
                <div className="mt-6">
                  <Button onClick={() => {
                    setEditingStructure(null)
                    setShowForm(true)
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Structure
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}
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

      {/* Payslip view dialog (same layout as employee salary slip) */}
      {selectedPayslip && (
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              /* Hide dialog overlay and backdrop */
              [data-radix-dialog-overlay],
              [data-radix-dialog-content]::before {
                display: none !important;
              }
              
              /* Make dialog content full page */
              [data-radix-dialog-content] {
                position: fixed !important;
                inset: 0 !important;
                max-width: 100% !important;
                max-height: 100% !important;
                margin: 0 !important;
                padding: 20px !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                background: white !important;
                overflow: visible !important;
              }
              
              /* Hide action buttons when printing */
              .no-print {
                display: none !important;
              }
              
              /* Optimize spacing for print */
              body {
                overflow: visible !important;
              }
              
              /* Reduce spacing in payslip content */
              [data-radix-dialog-content] .space-y-6 > * + * {
                margin-top: 1rem !important;
              }
              
              /* Ensure sections don't break across pages */
              [data-radix-dialog-content] .border-b-2 {
                break-inside: avoid;
                page-break-inside: avoid;
              }
              
              /* Optimize grid layouts for print */
              [data-radix-dialog-content] .grid {
                gap: 1rem !important;
              }
              
              /* Reduce padding in sections */
              [data-radix-dialog-content] .pb-4 {
                padding-bottom: 0.75rem !important;
              }
              
              [data-radix-dialog-content] .p-6 {
                padding: 1rem !important;
              }
            }
          `
        }} />
      )}
      <Dialog
        open={!!selectedPayslip}
        onOpenChange={(open) => {
          if (!open) setSelectedPayslip(null)
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="no-print">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                {selectedPayslip?.record?.month || formatMonthDisplay(monthFilter)} Payslip
              </span>
              {selectedPayslip && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadPayslipPdf({
                        record: selectedPayslip.record,
                        amounts: selectedPayslip.amounts,
                        departmentName: selectedPayslip.departmentName,
                      })
                    }
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.print()
                    }}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedPayslip && (() => {
            const { record, amounts, departmentName } = selectedPayslip
            const employeeName = getEmployeeName(record.employee_id)
            const paymentDate = record.created_at
              ? new Date(record.created_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : new Date().toLocaleDateString()

            return (
              <div className="space-y-6">
                {/* Company Header */}
                <div className="border-b-2 border-gray-300 pb-4" style={{ breakInside: 'avoid' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Image 
                          src="/bevyhr-logo.png" 
                          alt="BevyHR Logo" 
                          width={24} 
                          height={24} 
                          className="h-6 w-6 object-contain"
                        />
                        <h2 className="text-2xl font-bold text-gray-900">BevyHR</h2>
                      </div>
                      <p className="text-sm text-gray-600">123 Business Park, Corporate Tower</p>
                      <p className="text-sm text-gray-600">Mumbai, Maharashtra - 400001</p>
                      <p className="text-sm text-gray-600">
                        Phone: +91 22 1234 5678 | Email: hr@bevyhr.com
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">SALARY STATEMENT</p>
                      <p className="text-sm text-gray-600 mt-1">
                        For the month of {record.month || formatMonthDisplay(monthFilter)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employee Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-gray-200 pb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Employee Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employee Name:</span>
                        <span className="font-medium">{employeeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employee ID:</span>
                        <span className="font-medium">{record.employee_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium">{departmentName || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Date:</span>
                        <span className="font-medium">{paymentDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Month:</span>
                        <span className="font-medium">
                          {record.month || formatMonthDisplay(monthFilter)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className="bg-green-100 text-green-800">
                          {record.status || "processed"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Salary Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Earnings */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
                      Earnings
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-700">Basic Salary</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrencySafe(amounts.basic)}
                        </span>
                      </div>
                      {amounts.hra > 0 && (
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">House Rent Allowance (HRA)</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrencySafe(amounts.hra)}
                          </span>
                        </div>
                      )}
                      {amounts.allowances - amounts.hra > 0 && (
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">Other Allowances</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrencySafe(amounts.allowances - amounts.hra)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-3 pt-4 border-t-2 border-gray-300">
                        <span className="text-lg font-semibold text-gray-900">Total Earnings</span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrencySafe(amounts.gross)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-500">
                      Deductions
                    </h3>
                    <div className="space-y-3">
                      {amounts.pf > 0 && (
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">Provident Fund (PF)</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrencySafe(amounts.pf)}
                          </span>
                        </div>
                      )}
                      {amounts.professionalTax > 0 && (
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">Professional Tax</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrencySafe(amounts.professionalTax)}
                          </span>
                        </div>
                      )}
                      {amounts.incomeTax > 0 && (
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">Income Tax (TDS)</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrencySafe(amounts.incomeTax)}
                          </span>
                        </div>
                      )}
                      {amounts.esi > 0 && (
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">Employee State Insurance (ESI)</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrencySafe(amounts.esi)}
                          </span>
                        </div>
                      )}
                      {amounts.leaveDeduction > 0 && (
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">Leave Deduction</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrencySafe(amounts.leaveDeduction)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-3 pt-4 border-t-2 border-gray-300">
                        <span className="text-lg font-semibold text-gray-900">Total Deductions</span>
                        <span className="text-xl font-bold text-red-600">
                          {formatCurrencySafe(amounts.totalDeductions)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Net Salary Payable</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {formatCurrencySafe(amounts.net)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Paid on {paymentDate}</p>
                    </div>
                    <div className="text-right">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">In Words</p>
                        <p className="text-sm font-semibold text-gray-700">
                          Amount in words (system generated)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
                  <p>This is a system generated salary slip. No signature is required.</p>
                  <p className="mt-1">
                    For queries, please contact HR Department at hr@bevyhr.com
                  </p>
                  <p className="mt-2 text-gray-400">
                    Generated on {new Date().toLocaleDateString()} at{" "}
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Payroll processing review */}
      <Dialog open={showProcessDialog} onOpenChange={(open) => {
        if (!open) {
          // Clear temporary edits when closing the dialog
          setTemporaryPayrollEdits({})
        }
        setShowProcessDialog(open)
        if (open) fetchPayrollPreview()
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review payroll for {formatMonthDisplay(monthFilter)}</DialogTitle>
            <DialogDescription>
              Confirm salaries before processing. Adjust any employee’s structure if needed, then proceed.
            </DialogDescription>
          </DialogHeader>

          {loadingPreview ? (
            <div className="py-8 text-center text-gray-600">Loading preview...</div>
          ) : previewError ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <p className="text-red-600">{previewError}</p>
              <Button variant="outline" onClick={fetchPayrollPreview}>Retry preview</Button>
            </div>
          ) : payrollPreview ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-500">Employees checked</p>
                    <p className="text-2xl font-bold">{payrollPreview.processed || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-500">New payrolls</p>
                    <p className="text-2xl font-bold text-green-600">{payrollPreview.created || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-500">Updated</p>
                    <p className="text-2xl font-bold text-blue-600">{payrollPreview.updated || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-500">Skipped</p>
                    <p className="text-2xl font-bold text-gray-700">{payrollPreview.skipped || 0}</p>
                  </CardContent>
                </Card>
              </div>

              {Array.isArray(payrollPreview.errors) && payrollPreview.errors.length > 0 && (
                <div className="text-sm text-red-600">
                  Issues detected:
                  <ul className="list-disc list-inside">
                    {payrollPreview.errors.map((err: string, idx: number) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Gross</TableHead>
                      <TableHead>Net</TableHead>
                      <TableHead>Unpaid Days</TableHead>
                      <TableHead>Leave Deduction</TableHead>
                      {canPayrollUpdate && (
                        <TableHead className="w-32 text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(payrollPreview.payrolls) && payrollPreview.payrolls.length > 0 ? (
                      payrollPreview.payrolls.map((preview: any) => {
                        // Merge temporary edits if they exist
                        const tempEdit = temporaryPayrollEdits[preview.employee_id]
                        const displayData = tempEdit ? {
                          ...preview,
                          gross_salary: tempEdit.gross_salary,
                          net_salary: tempEdit.net_salary,
                          leave_deduction: tempEdit.leave_deduction,
                          unpaid_days: tempEdit.unpaid_days
                        } : preview
                        
                        return (
                          <TableRow key={preview.employee_id || preview.id}>
                            <TableCell>
                              <div className="font-medium text-gray-900">{getEmployeeName(preview.employee_id)}</div>
                              <div className="text-sm text-gray-500">ID: {preview.employee_id}</div>
                            </TableCell>
                            <TableCell>
                              {formatCurrencySafe(displayData.gross_salary)}
                              {tempEdit && <span className="ml-2 text-xs text-blue-600">(edited)</span>}
                            </TableCell>
                            <TableCell className="font-semibold text-green-700">
                              {formatCurrencySafe(displayData.net_salary)}
                              {tempEdit && <span className="ml-2 text-xs text-blue-600">(edited)</span>}
                            </TableCell>
                            <TableCell>
                              {displayData.unpaid_days ?? "—"}
                              {tempEdit && <span className="ml-2 text-xs text-blue-600">(edited)</span>}
                            </TableCell>
                            <TableCell className="text-red-600">
                              {formatCurrencySafe(displayData.leave_deduction)}
                              {tempEdit && <span className="ml-2 text-xs text-blue-600">(edited)</span>}
                            </TableCell>
                            {canPayrollUpdate && (
                              <TableCell className="text-right">
                                <Button size="sm" variant="outline" onClick={() => handleEditSalaryForEmployee(preview.employee_id, true)}>
                                  Edit salary
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={canPayrollUpdate ? 6 : 5} className="text-center text-gray-500 py-6">
                          No employees found for this month.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setShowProcessDialog(false)}>Cancel</Button>
                <Button onClick={processPayroll} disabled={processingPayroll}>
                  {processingPayroll ? "Processing..." : "Proceed to process"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No preview data.</div>
          )}
        </DialogContent>
      </Dialog>

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

              {/* CTC Summary */}
              {(calculationBreakdown.calculation?.annual_ctc > 0 || calculationBreakdown.calculation?.monthly_ctc > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-gray-500">Monthly CTC</div>
                      <div className="text-2xl font-bold text-blue-600">{formatCurrencySafe(calculationBreakdown.calculation?.monthly_ctc || 0)}</div>
                      <div className="text-xs text-gray-400 mt-1">Gross Earnings + Statutory Deductions (excludes leave deduction)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-gray-500">Annual CTC</div>
                      <div className="text-2xl font-bold text-blue-600">{formatCurrencySafe(calculationBreakdown.calculation?.annual_ctc || 0)}</div>
                      <div className="text-xs text-gray-400 mt-1">Monthly CTC × 12</div>
                    </CardContent>
                  </Card>
                </div>
              )}

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

      {/* Payroll Edit Dialog */}
      <Dialog open={showPayrollEditDialog} onOpenChange={setShowPayrollEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Payroll for {editingPayroll ? getEmployeeName(editingPayroll.employee_id) : ""}</DialogTitle>
            <DialogDescription>
              Edit payroll details for {formatMonthDisplay(monthFilter)}
            </DialogDescription>
          </DialogHeader>
          
          {editingPayroll && (
            <PayrollEditForm
              payroll={editingPayroll}
              month={formatMonthDisplay(monthFilter)}
              onSave={handleSavePayrollEdit}
              onCancel={() => {
                setShowPayrollEditDialog(false)
                setEditingPayroll(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
    </ResourceGuard>
  )
}
