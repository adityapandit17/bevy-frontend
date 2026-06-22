"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, FileText, IndianRupee, Receipt, TrendingUp, Download, Printer, Building2, User, CreditCard } from "lucide-react"
import { getApiUrl, getEndpointUrl, apiRequest } from "@/lib/api"
import Image from "next/image"

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
}

interface Department {
  id: number
  name: string
}

interface SalaryStructure {
  id: number
  employee_id: number
  basic: number
  hra: number
  allowances: number
  bonus: number
  pf: number
  esi: number
  professional_tax: number
  income_tax: number
  effective_from: string
  effective_upto: string | null
}

interface PayrollRecord {
  id: number
  employee_id: number
  month: string
  gross_salary: number
  net_salary: number
  status: string
  created_at: string
  earnings_breakdown?: any
  deductions_breakdown?: any
}

export default function EmployeePayrollPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([])
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlip, setSelectedSlip] = useState<{ month: string; year: string; amount: string; status: string; date: string } | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  useEffect(() => {
    fetchEmployee()
    fetchDepartments()
    fetchSalaryStructures()
    fetchPayrollRecords()
  }, [employeeId])

  // Update selected year when payroll records are loaded
  useEffect(() => {
    if (payrollRecords.length > 0) {
      const availableYears = getAvailableYears()
      if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
        setSelectedYear(availableYears[0])
      }
    }
  }, [payrollRecords])

  const fetchEmployee = async () => {
    try {
      const data = await apiRequest<Employee>(`${getApiUrl('employees')}/${employeeId}`, {
        method: "GET"
      })
      setEmployee(data)
    } catch (err) {
      console.error('Error fetching employee:', err)
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

  const fetchSalaryStructures = async () => {
    try {
      const data = await apiRequest<SalaryStructure[]>(getEndpointUrl('SALARY_STRUCTURES'), {
        method: "GET"
      })
      // Filter structures for this employee
      const employeeStructures = Array.isArray(data) 
        ? data.filter((s: SalaryStructure) => String(s.employee_id) === employeeId)
        : []
      setSalaryStructures(employeeStructures)
    } catch (err) {
      console.error('Error fetching salary structures:', err)
      setSalaryStructures([])
    }
  }

  const fetchPayrollRecords = async () => {
    try {
      const data = await apiRequest<PayrollRecord[]>(getEndpointUrl('PAYROLLS'), {
        method: "GET"
      })
      // Filter payroll records for this employee
      const employeePayrolls = Array.isArray(data)
        ? data.filter((p: PayrollRecord) => String(p.employee_id) === employeeId)
        : []
      setPayrollRecords(employeePayrolls)
    } catch (err) {
      console.error('Error fetching payroll records:', err)
      setPayrollRecords([])
    }
  }

  // Get current salary structure (for current month)
  const getCurrentSalaryStructure = (): SalaryStructure | null => {
    if (!Array.isArray(salaryStructures) || salaryStructures.length === 0) return null
    
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    return getStructureForMonth(Number(employeeId), currentYear, currentMonth)
  }

  // Get salary structure for a specific month
  const getStructureForMonth = (employeeId: number, year: number, month: number): SalaryStructure | null => {
    if (!Array.isArray(salaryStructures) || salaryStructures.length === 0) return null
    
    // Filter structures for this employee with valid effective_from dates
    const employeeStructures = salaryStructures.filter(
      (s: SalaryStructure) => s.employee_id === employeeId && s.effective_from
    )
    
    if (employeeStructures.length === 0) return null
    
    // Target month date (first day of the month)
    const targetDate = new Date(year, month - 1, 1)
    const targetMonthKey = `${year}-${String(month).padStart(2, '0')}`
    
    // First, group structures by their effective month and resolve duplicates
    const structuresByMonth: Record<string, SalaryStructure> = {}
    employeeStructures.forEach((structure: SalaryStructure) => {
      const effectiveDate = new Date(structure.effective_from)
      const monthKey = `${effectiveDate.getFullYear()}-${String(effectiveDate.getMonth() + 1).padStart(2, '0')}`
      
      if (!structuresByMonth[monthKey] || 
          new Date(structure.effective_from) > new Date(structuresByMonth[monthKey].effective_from)) {
        structuresByMonth[monthKey] = structure
      }
    })
    
    // Return structure for the exact target month if it exists
    if (structuresByMonth[targetMonthKey]) {
      return structuresByMonth[targetMonthKey]
    }
    
    // If no exact match, find the latest structure that is effective on or before the target month
    let latestStructure: SalaryStructure | null = null
    let latestDate: Date | null = null
    
    Object.values(structuresByMonth).forEach((structure: SalaryStructure) => {
      const structDate = new Date(structure.effective_from)
      if (structDate <= targetDate) {
        if (!latestDate || structDate > latestDate) {
          latestDate = structDate
          latestStructure = structure
        }
      }
    })
    
    return latestStructure
  }

  // Convert annual to monthly
  const toMonthly = (annual: number) => {
    const num = Number(annual) || 0
    return num / 12
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate salary breakdown from structure
  const calculateSalaryBreakdown = () => {
    const structure = getCurrentSalaryStructure()
    if (!structure) {
      return {
        basic: 0,
        hra: 0,
        allowances: 0,
        pf: 0,
        esi: 0,
        professionalTax: 0,
        incomeTax: 0,
        gross: 0,
        totalDeductions: 0,
        net: 0,
      }
    }

    const basic = toMonthly(structure.basic)
    const hra = toMonthly(structure.hra)
    const allowances = toMonthly(structure.allowances)
    const pf = toMonthly(structure.pf)
    const esi = toMonthly(structure.esi)
    const professionalTax = toMonthly(structure.professional_tax)
    const incomeTax = toMonthly(structure.income_tax)
    const annualCtc = structure.annual_ctc || 0
    const monthlyCtc = structure.monthly_ctc || 0

    const gross = basic + hra + allowances
    const totalDeductions = pf + esi + professionalTax + incomeTax
    const net = gross - totalDeductions

    return {
      basic,
      hra,
      allowances,
      pf,
      esi,
      professionalTax,
      incomeTax,
      gross,
      totalDeductions,
      net,
      annualCtc,
      monthlyCtc,
    }
  }

  // Calculate total paid this year
  const calculateTotalPaidThisYear = () => {
    const currentYear = new Date().getFullYear()
    const yearPayrolls = payrollRecords.filter((p) => {
      if (!p.month) return false
      // Parse month string (e.g., "November 2024")
      const monthMatch = p.month.match(/(\w+)\s+(\d{4})/)
      if (!monthMatch) return false
      const year = parseInt(monthMatch[2], 10)
      return year === currentYear
    })
    
    return yearPayrolls.reduce((sum, p) => sum + (Number(p.net_salary) || 0), 0)
  }

  // Get number of salary slips
  const getSalarySlipsCount = () => {
    return payrollRecords.length
  }

  // Convert payroll records to salary slips format
  const convertPayrollToSalarySlips = () => {
    return payrollRecords.map((record) => {
      // Parse month string (e.g., "November 2024")
      const monthMatch = record.month?.match(/(\w+)\s+(\d{4})/)
      const month = monthMatch ? monthMatch[1] : 'Unknown'
      const year = monthMatch ? monthMatch[2] : new Date(record.created_at).getFullYear().toString()
      const date = record.created_at || new Date().toISOString()
      
      return {
        month,
        year,
        amount: formatCurrency(record.net_salary || 0),
        status: record.status || 'Paid',
        date: date.split('T')[0], // Get date part only
      }
    }).sort((a, b) => {
      // Sort by year and month (newest first)
      if (a.year !== b.year) return b.year.localeCompare(a.year)
      const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December']
      return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month)
    })
  }

  // Get available years from payroll records
  const getAvailableYears = () => {
    const years = new Set<string>()
    payrollRecords.forEach((record) => {
      const monthMatch = record.month?.match(/(\w+)\s+(\d{4})/)
      if (monthMatch) {
        years.add(monthMatch[2])
      } else if (record.created_at) {
        years.add(new Date(record.created_at).getFullYear().toString())
      }
    })
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  }

  const downloadSalarySlip = async (slip: { month: string; year: string; amount: string; status: string; date: string }) => {
    if (!employee) return

    const departmentName = departments.find(d => d.id === employee.department_id)?.name || 'N/A'
    const paymentDate = new Date(slip.date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    // Generate HTML content for the salary slip
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Salary Slip - ${slip.month} ${slip.year}</title>
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
                    <p>For the month of ${slip.month} ${slip.year}</p>
                </div>
            </div>
        </div>

        <div class="employee-section">
            <div>
                <div class="section-title">Employee Details</div>
                <div class="detail-row">
                    <span class="detail-label">Employee Name:</span>
                    <span class="detail-value">${employee.first_name} ${employee.last_name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Employee ID:</span>
                    <span class="detail-value">${employee.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Designation:</span>
                    <span class="detail-value">${employee.designation}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${departmentName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date of Joining:</span>
                    <span class="detail-value">${employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>
            <div>
                <div class="section-title">Payment Details</div>
                <div class="detail-row">
                    <span class="detail-label">Payment Date:</span>
                    <span class="detail-value">${new Date(slip.date).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Month:</span>
                    <span class="detail-value">${slip.month} ${slip.year}</span>
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
                    <span class="detail-value">${slip.status}</span>
                </div>
            </div>
        </div>

        <div class="salary-breakdown">
            <div class="earnings">
                <div class="breakdown-title">Earnings</div>
                <div class="breakdown-row">
                    <span class="breakdown-label">Basic Salary</span>
                    <span class="breakdown-value">₹45,000</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-label">House Rent Allowance (HRA)</span>
                    <span class="breakdown-value">₹18,000</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-label">Transport Allowance</span>
                    <span class="breakdown-value">₹5,000</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-label">Medical Allowance</span>
                    <span class="breakdown-value">₹3,000</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-label">Special Allowance</span>
                    <span class="breakdown-value">₹4,000</span>
                </div>
                <div class="total-row">
                    <span>Total Earnings</span>
                    <span style="color: #10b981;">₹75,000</span>
                </div>
            </div>
            <div class="deductions">
                <div class="breakdown-title">Deductions</div>
                <div class="breakdown-row">
                    <span class="breakdown-label">Provident Fund (PF)</span>
                    <span class="breakdown-value">₹5,400</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-label">Professional Tax</span>
                    <span class="breakdown-value">₹200</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-label">Income Tax (TDS)</span>
                    <span class="breakdown-value">₹4,400</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-label">Employee State Insurance (ESI)</span>
                    <span class="breakdown-value">₹0</span>
                </div>
                <div class="breakdown-row">
                    <span class="breakdown-label">Other Deductions</span>
                    <span class="breakdown-value">₹0</span>
                </div>
                <div class="total-row">
                    <span>Total Deductions</span>
                    <span style="color: #ef4444;">₹10,000</span>
                </div>
            </div>
        </div>

        <div class="net-salary">
            <div class="net-salary-content">
                <div>
                    <div class="net-label">Net Salary Payable</div>
                    <div class="net-amount">${slip.amount}</div>
                    <div class="net-date">Paid on ${paymentDate}</div>
                </div>
                <div class="amount-in-words">
                    <div class="amount-in-words-label">In Words</div>
                    <div class="amount-in-words-value">Seventy Five Thousand Only</div>
                </div>
            </div>
        </div>

        <div class="ytd-summary">
            <div class="ytd-title">Year-to-Date Summary</div>
            <div class="ytd-grid">
                <div class="ytd-item">
                    <div class="ytd-label">Total Earnings (YTD)</div>
                    <div class="ytd-value">₹9,00,000</div>
                </div>
                <div class="ytd-item">
                    <div class="ytd-label">Total Deductions (YTD)</div>
                    <div class="ytd-value">₹1,20,000</div>
                </div>
                <div class="ytd-item">
                    <div class="ytd-label">Net Paid (YTD)</div>
                    <div class="ytd-value">₹7,80,000</div>
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

    // Create a temporary div with the HTML content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = '800px'
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
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`Salary_Slip_${employee.first_name}_${employee.last_name}_${slip.month}_${slip.year}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      document.body.removeChild(tempDiv)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Employee not found</p>
          <Button onClick={() => router.push('/employees')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Employees
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/employees')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <IndianRupee className="w-6 h-6" />
            Payroll Information
          </h1>
          <p className="text-gray-600">
            {employee.first_name} {employee.last_name} - Payroll History & Salary Slips
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="salary-slips">Salary Slips</TabsTrigger>
          <TabsTrigger value="history">Payroll History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {(() => {
            const breakdown = calculateSalaryBreakdown()
            const totalPaid = calculateTotalPaidThisYear()
            const slipsCount = getSalarySlipsCount()
            
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Current Salary</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {formatCurrency(breakdown.net)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Monthly</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <IndianRupee className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Paid</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {formatCurrency(totalPaid)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">This Year</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Salary Slips</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{slipsCount}</p>
                          <p className="text-xs text-gray-500 mt-1">Available</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Salary Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Salary Structure</CardTitle>
                    <CardDescription>Monthly salary breakdown for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getCurrentSalaryStructure() ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">Basic Salary</span>
                          <span className="font-semibold">{formatCurrency(breakdown.basic)}</span>
                        </div>
                        {breakdown.hra > 0 && (
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">House Rent Allowance (HRA)</span>
                            <span className="font-semibold text-green-600">{formatCurrency(breakdown.hra)}</span>
                          </div>
                        )}
                        {breakdown.allowances > 0 && (
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Other Allowances</span>
                            <span className="font-semibold text-green-600">{formatCurrency(breakdown.allowances)}</span>
                          </div>
                        )}
                        {breakdown.pf > 0 && (
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Provident Fund (PF)</span>
                            <span className="font-semibold text-red-600">-{formatCurrency(breakdown.pf)}</span>
                          </div>
                        )}
                        {breakdown.professionalTax > 0 && (
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Professional Tax</span>
                            <span className="font-semibold text-red-600">-{formatCurrency(breakdown.professionalTax)}</span>
                          </div>
                        )}
                        {breakdown.incomeTax > 0 && (
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Income Tax (TDS)</span>
                            <span className="font-semibold text-red-600">-{formatCurrency(breakdown.incomeTax)}</span>
                          </div>
                        )}
                        {breakdown.esi > 0 && (
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Employee State Insurance (ESI)</span>
                            <span className="font-semibold text-red-600">-{formatCurrency(breakdown.esi)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-3 pt-4 border-t-2 border-gray-300">
                          <span className="text-lg font-semibold">Net Salary</span>
                          <span className="text-xl font-bold text-gray-900">{formatCurrency(breakdown.net)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No salary structure found for this employee.</p>
                        <p className="text-sm mt-2">Please add a salary structure in the Payroll section.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )
          })()}

          {/* Employee Info */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium">{employee.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">
                    {departments.find(d => d.id === employee.department_id)?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-medium">{employee.designation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Joining</p>
                  <p className="font-medium">
                    {employee.date_of_joining 
                      ? new Date(employee.date_of_joining).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bank Account</p>
                  <p className="font-medium">****1234 (HDFC Bank)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">PAN Number</p>
                  <p className="font-medium">ABCDE1234F</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Slips Tab */}
        <TabsContent value="salary-slips" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Salary Slips</h3>
              <p className="text-sm text-gray-600">Download or view past salary slips</p>
            </div>
            {(() => {
              const availableYears = getAvailableYears()
              const defaultYear = availableYears.length > 0 ? availableYears[0] : new Date().getFullYear().toString()
              
              // Set default year if not set or if current selection is not available
              if (!selectedYear || !availableYears.includes(selectedYear)) {
                if (availableYears.length > 0) {
                  setSelectedYear(defaultYear)
                }
              }
              
              return (
                <Select value={selectedYear || defaultYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.length > 0 ? (
                      availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value={new Date().getFullYear().toString()}>
                        {new Date().getFullYear()}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )
            })()}
          </div>

          <div className="space-y-3">
            {(() => {
              const allSalarySlips = convertPayrollToSalarySlips()
              const filteredSlips = allSalarySlips.filter(slip => slip.year === selectedYear)
              
              if (filteredSlips.length === 0) {
                return (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No salary slips found for {selectedYear}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {payrollRecords.length === 0 
                        ? "No payroll records available for this employee"
                        : "Try selecting a different year"}
                    </p>
                  </div>
                )
              }
              
              return (
                <>
                  <p className="text-sm text-gray-600 mb-2">
                    Showing {filteredSlips.length} salary slip{filteredSlips.length !== 1 ? 's' : ''} for {selectedYear}
                  </p>
                  {filteredSlips.map((slip, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <Receipt className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                Salary Slip - {slip.month} {slip.year}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-sm text-gray-600">
                                  Amount: <span className="font-medium text-gray-900">{slip.amount}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                  Paid on: <span className="font-medium">{new Date(slip.date).toLocaleDateString()}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">{slip.status}</Badge>
                            <Button variant="outline" size="sm" onClick={() => setSelectedSlip(slip)}>
                              <FileText className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => downloadSalarySlip(slip)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )
            })()}
          </div>
        </TabsContent>

        {/* Payroll History Tab */}
        <TabsContent value="history" className="space-y-4 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Payroll History</h3>
            <p className="text-sm text-gray-600">Complete payroll transaction history</p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      No payroll records found for this employee.
                    </TableCell>
                  </TableRow>
                ) : (
                  payrollRecords
                    .sort((a, b) => {
                      // Sort by date (newest first)
                      const dateA = new Date(a.created_at || a.month || 0).getTime()
                      const dateB = new Date(b.created_at || b.month || 0).getTime()
                      return dateB - dateA
                    })
                    .map((record) => {
                      // Parse month to get period
                      const monthMatch = record.month?.match(/(\w+)\s+(\d{4})/)
                      const period = monthMatch 
                        ? `${monthMatch[1].substring(0, 3)} ${monthMatch[2]}`
                        : record.month || 'Unknown'
                      
                      // Get structure for this month to calculate breakdown
                      let basic = 0
                      let allowances = 0
                      let deductions = 0
                      
                      if (monthMatch) {
                        const year = parseInt(monthMatch[2], 10)
                        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                          'July', 'August', 'September', 'October', 'November', 'December']
                        const monthIndex = monthNames.findIndex(m => m.startsWith(monthMatch[1]))
                        if (monthIndex >= 0) {
                          const structure = getStructureForMonth(Number(employeeId), year, monthIndex + 1)
                          if (structure) {
                            basic = toMonthly(structure.basic)
                            allowances = toMonthly(structure.hra + structure.allowances)
                            deductions = toMonthly(structure.pf + structure.esi + structure.professional_tax + structure.income_tax)
                          }
                        }
                      }
                      
                      // Use earnings_breakdown if available
                      if (record.earnings_breakdown && typeof record.earnings_breakdown === 'object') {
                        basic = Number((record.earnings_breakdown as any).basic ?? basic)
                        const hra = Number((record.earnings_breakdown as any).hra ?? 0)
                        const otherAllowances = Number((record.earnings_breakdown as any).allowances ?? 0)
                        allowances = hra + otherAllowances
                      }
                      
                      // Use deductions_breakdown if available
                      if (record.deductions_breakdown && typeof record.deductions_breakdown === 'object') {
                        const pf = Number((record.deductions_breakdown as any).pf ?? 0)
                        const esi = Number((record.deductions_breakdown as any).esi ?? 0)
                        const professionalTax = Number((record.deductions_breakdown as any).professional_tax ?? 0)
                        const incomeTax = Number((record.deductions_breakdown as any).income_tax ?? 0)
                        const leaveDeduction = Number((record.deductions_breakdown as any).leave_deduction ?? 0)
                        deductions = pf + esi + professionalTax + incomeTax + leaveDeduction
                      }
                      
                      const paymentDate = record.created_at 
                        ? new Date(record.created_at).toLocaleDateString()
                        : 'N/A'
                      
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{period}</TableCell>
                          <TableCell>{formatCurrency(basic)}</TableCell>
                          <TableCell className="text-green-600">{formatCurrency(allowances)}</TableCell>
                          <TableCell className="text-red-600">{formatCurrency(deductions)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(record.net_salary || 0)}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">{record.status || 'Paid'}</Badge>
                          </TableCell>
                          <TableCell>{paymentDate}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Salary Slip View Dialog */}
      <Dialog open={!!selectedSlip} onOpenChange={() => setSelectedSlip(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Salary Slip - {selectedSlip?.month} {selectedSlip?.year}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm" onClick={() => selectedSlip && downloadSalarySlip(selectedSlip)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedSlip && employee && (
            <div className="space-y-6 print:space-y-4">
              {/* Company Header */}
              <div className="border-b-2 border-gray-300 pb-4">
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
                    <p className="text-sm text-gray-600">Phone: +91 22 1234 5678 | Email: hr@bevyhr.com</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">SALARY STATEMENT</p>
                    <p className="text-sm text-gray-600 mt-1">
                      For the month of {selectedSlip.month} {selectedSlip.year}
                    </p>
                  </div>
                </div>
              </div>

              {/* Employee Details */}
              <div className="grid grid-cols-2 gap-6 border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Employee Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employee Name:</span>
                      <span className="font-medium">{employee.first_name} {employee.last_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employee ID:</span>
                      <span className="font-medium">{employee.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Designation:</span>
                      <span className="font-medium">{employee.designation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">
                        {departments.find(d => d.id === employee.department_id)?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date of Joining:</span>
                      <span className="font-medium">
                        {employee.date_of_joining 
                          ? new Date(employee.date_of_joining).toLocaleDateString()
                          : 'N/A'}
                      </span>
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
                      <span className="font-medium">{new Date(selectedSlip.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Month:</span>
                      <span className="font-medium">{selectedSlip.month} {selectedSlip.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank Account:</span>
                      <span className="font-medium">****1234 (HDFC Bank)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PAN Number:</span>
                      <span className="font-medium">ABCDE1234F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className="bg-green-100 text-green-800">{selectedSlip.status}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="grid grid-cols-2 gap-6">
                {/* Earnings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
                    Earnings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Basic Salary</span>
                      <span className="font-semibold text-gray-900">₹45,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">House Rent Allowance (HRA)</span>
                      <span className="font-semibold text-green-600">₹18,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Transport Allowance</span>
                      <span className="font-semibold text-green-600">₹5,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Medical Allowance</span>
                      <span className="font-semibold text-green-600">₹3,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Special Allowance</span>
                      <span className="font-semibold text-green-600">₹4,000</span>
                    </div>
                    <div className="flex justify-between items-center py-3 pt-4 border-t-2 border-gray-300">
                      <span className="text-lg font-semibold text-gray-900">Total Earnings</span>
                      <span className="text-xl font-bold text-green-600">₹75,000</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-red-500">
                    Deductions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Provident Fund (PF)</span>
                      <span className="font-semibold text-red-600">₹5,400</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Professional Tax</span>
                      <span className="font-semibold text-red-600">₹200</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Income Tax (TDS)</span>
                      <span className="font-semibold text-red-600">₹4,400</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Employee State Insurance (ESI)</span>
                      <span className="font-semibold text-red-600">₹0</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Other Deductions</span>
                      <span className="font-semibold text-red-600">₹0</span>
                    </div>
                    <div className="flex justify-between items-center py-3 pt-4 border-t-2 border-gray-300">
                      <span className="text-lg font-semibold text-gray-900">Total Deductions</span>
                      <span className="text-xl font-bold text-red-600">₹10,000</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Net Salary Payable</p>
                    <p className="text-3xl font-bold text-gray-900">{selectedSlip.amount}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Paid on {new Date(selectedSlip.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">In Words</p>
                      <p className="text-sm font-semibold text-gray-700">
                        Seventy Five Thousand Only
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Year-to-Date Summary */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Year-to-Date Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-600">Total Earnings (YTD)</p>
                    <p className="text-lg font-bold text-gray-900">₹9,00,000</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-600">Total Deductions (YTD)</p>
                    <p className="text-lg font-bold text-gray-900">₹1,20,000</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-600">Net Paid (YTD)</p>
                    <p className="text-lg font-bold text-gray-900">₹7,80,000</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
                <p>This is a system generated salary slip. No signature is required.</p>
                <p className="mt-1">For queries, please contact HR Department at hr@bevyhr.com</p>
                <p className="mt-2 text-gray-400">
                  Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

