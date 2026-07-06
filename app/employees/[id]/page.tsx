"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getApiUrl, apiRequest } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { EmployeeForm } from "@/components/forms/employee-form"
import { ResourceGuard } from "@/lib/auth/auth.guards"
import { useAuth } from "@/lib/auth/auth.hooks"
import { toast } from "@/hooks/use-toast"
import {
  mapEmployeeHeader,
  mapJobDetails,
  mapTimeOff,
  mapPayInfo,
  mapDocuments,
  mapPerformance,
  mapTimesheets,
  mapBenefits,
  mapTraining,
  mapAssets,
  PROFILE_TAB_ENDPOINTS,
  type EmployeeHeader,
} from "@/lib/employee-profile"
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
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Download,
  Eye,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  User,
  Package,
  GraduationCap,
  Heart,
  MapPin,
  Phone,
  Mail,
  Building,
  CalendarDays,
  Award,
  Star,
  CheckCircle,
  AlertCircle,
  Clock3,
  FileCheck,
  Users,
  Settings,
  Plus,
  Trash2,
  ExternalLink,
  Download as DownloadIcon,
  Upload,
  Eye as EyeIcon,
  Edit as EditIcon,
  Star as StarIcon,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Shield,
  CreditCard,
  Gift,
  BookOpen,
  Certificate,
  Laptop,
  Monitor,
  Smartphone,
  Printer,
} from "lucide-react"

interface Employee extends EmployeeHeader {}

interface JobDetails {
  position: string
  department: string
  manager: string
  hireDate: string
  employmentType: string
  workLocation: string
  workSchedule: string
  probationEndDate?: string
  contractEndDate?: string
  reportingTo: string
  subordinates: string[]
  skills: string[]
  certifications: string[]
}

interface TimeOff {
  id: string
  type: string
  startDate: string
  endDate: string
  days: number
  status: string
  reason: string
  approvedBy?: string
  approvedDate?: string
}

interface PayInfo {
  basicSalary: number
  allowances: {
    housing: number
    transport: number
    meal: number
    other: number
  }
  deductions: {
    tax: number
    insurance: number
    pension: number
    other: number
  }
  netSalary: number
  bankDetails: {
    bankName: string
    accountNumber: string
    ifscCode: string
  }
  paySchedule: string
  lastPayDate: string
  nextPayDate: string
}

interface Document {
  id: string
  name: string
  type: string
  uploadDate: string
  expiryDate?: string
  status: string
  size: string
  uploadedBy: string
}

interface Performance {
  id: string
  period: string
  rating: number
  goals: {
    id: string
    title: string
    description: string
    target: string
    progress: number
    status: string
  }[]
  reviews: {
    id: string
    reviewer: string
    date: string
    rating: number
    comments: string
  }[]
  achievements: string[]
  areasForImprovement: string[]
}

interface Timesheet {
  id: string
  date: string
  hours: number
  project: string
  task: string
  status: string
  approvedBy?: string
  notes?: string
}

interface Benefit {
  id: string
  name: string
  type: string
  provider: string
  coverage: string
  startDate: string
  endDate?: string
  status: string
  cost: number
}

interface Training {
  id: string
  name: string
  type: string
  provider: string
  startDate: string
  endDate: string
  status: string
  progress: number
  certificate?: string
  cost: number
  skills: string[]
}

interface Asset {
  id: string
  name: string
  assetType: string
  serialNumber: string
  brand: string
  model: string
  status: string
  statusColor?: string
  condition: string
  location: string
  purchaseDate?: string
  currentValue?: number
}

export default function EmployeeProfilePage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string
  const { checkPermission } = useAuth()
  const canUpdate = checkPermission("employees.update")

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null)
  const [timeOff, setTimeOff] = useState<TimeOff[]>([])
  const [payInfo, setPayInfo] = useState<PayInfo | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [performance, setPerformance] = useState<Performance | null>(null)
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [training, setTraining] = useState<Training[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [activeTab, setActiveTab] = useState("job-details")
  const [headerLoading, setHeaderLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState<Record<string, boolean>>({})
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set())
  const [showEditForm, setShowEditForm] = useState(false)
  const [editEmployee, setEditEmployee] = useState<Record<string, unknown> | null>(null)

  const applyTabData = useCallback((tab: string, data: Record<string, unknown>) => {
    switch (tab) {
      case "job-details":
        setJobDetails(mapJobDetails({ ...data, manager: employee?.manager }))
        break
      case "time-off":
        setTimeOff(mapTimeOff(data))
        break
      case "pay-info":
        setPayInfo(mapPayInfo(data))
        break
      case "documents":
        setDocuments(mapDocuments(data))
        break
      case "performance":
        setPerformance(mapPerformance(data))
        break
      case "timesheets":
        setTimesheets(mapTimesheets(data))
        break
      case "benefits":
        setBenefits(mapBenefits(data))
        break
      case "training":
        setTraining(mapTraining(data))
        break
      case "assets":
        setAssets(mapAssets(data))
        break
    }
  }, [employee?.manager])

  const loadTab = useCallback(async (tab: string, managerName?: string) => {
    const endpoint = PROFILE_TAB_ENDPOINTS[tab]
    if (!endpoint) return

    setTabLoading((prev) => ({ ...prev, [tab]: true }))
    try {
      const data = await apiRequest<Record<string, unknown>>(
        getApiUrl(`employee_profiles/${employeeId}/${endpoint}`)
      )
      if (tab === "job-details") {
        applyTabData(tab, { ...data, manager: managerName })
      } else {
        applyTabData(tab, data)
      }
      setLoadedTabs((prev) => new Set(prev).add(tab))
    } catch (error) {
      console.error(`Error loading ${tab}:`, error)
      toast({
        title: "Could not load tab",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setTabLoading((prev) => ({ ...prev, [tab]: false }))
    }
  }, [employeeId, applyTabData])

  useEffect(() => {
    const fetchHeader = async () => {
      setHeaderLoading(true)
      try {
        const data = await apiRequest<Record<string, unknown>>(getApiUrl(`employee_profiles/${employeeId}`))
        const header = mapEmployeeHeader(data)
        setEmployee(header)
        if (data.job_details) {
          setJobDetails(mapJobDetails({ ...(data.job_details as Record<string, unknown>), manager: header.manager }))
          setLoadedTabs(new Set(["job-details"]))
        }
      } catch (error) {
        console.error("Error fetching employee:", error)
        setEmployee(null)
      } finally {
        setHeaderLoading(false)
      }
    }

    fetchHeader()
    setLoadedTabs(new Set())
  }, [employeeId])

  useEffect(() => {
    if (!employee || loadedTabs.has(activeTab)) return
    loadTab(activeTab, employee.manager)
  }, [activeTab, employee, loadedTabs, loadTab])

  const handleUpdateEmployee = async (formData: Record<string, unknown>) => {
    await apiRequest(getApiUrl(`employees/${employeeId}`), {
      method: "PATCH",
      body: JSON.stringify({ employee: formData }),
    })
    toast({ title: "Profile updated", description: "Employee details saved." })
    setShowEditForm(false)
    setLoadedTabs(new Set())
    const data = await apiRequest<Record<string, unknown>>(getApiUrl(`employee_profiles/${employeeId}`))
    const header = mapEmployeeHeader(data)
    setEmployee(header)
    await loadTab(activeTab, header.manager)
  }

  const openEditForm = async () => {
    try {
      const data = await apiRequest<Record<string, unknown>>(getApiUrl(`employees/${employeeId}`))
      setEditEmployee(data)
      setShowEditForm(true)
    } catch {
      toast({ title: "Could not open editor", variant: "destructive" })
    }
  }

  if (headerLoading) {
    return <div className="max-w-4xl mx-auto p-4 lg:p-6 text-gray-600 overflow-x-hidden">Loading employee...</div>
  }

  if (!employee) {
    return <div className="max-w-4xl mx-auto p-4 lg:p-6 text-gray-600 overflow-x-hidden">Employee not found.</div>
  }

  const tabBusy = tabLoading[activeTab]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800"
      case "available":
        return "bg-green-100 text-green-800"
      case "assigned":
        return "bg-blue-100 text-blue-800"
      case "maintenance":
        return "bg-orange-100 text-orange-800"
      case "retired":
        return "bg-gray-100 text-gray-800"
      case "lost":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 60) return "bg-blue-500"
    if (progress >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <ResourceGuard resource="employees" action="show">
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-2xl sm:text-3xl font-bold text-gray-900">Employee Profile</h1>
            <p className="text-gray-600">Detailed information about {employee.name}</p>
          </div>
          <div className="hrms-action-row">
            {canUpdate && (
              <Button variant="outline" size="sm" onClick={openEditForm}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
            <Button size="sm" onClick={() => router.push("/data-exports")}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Employee Overview Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
              <AvatarImage src={employee.avatar} alt={employee.name} />
              <AvatarFallback className="text-2xl">{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{employee.name}</h2>
                  <p className="text-base sm:text-lg text-gray-600">{employee.position}</p>
                  <p className="text-gray-500 text-sm sm:text-base">{employee.department}{employee.manager ? ` • Reports to ${employee.manager}` : ""}</p>
                </div>
                <Badge className={`${getStatusColor(employee.status)} w-fit`}>
                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600">ID: {employee.employeeId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600">Hired: {employee.hireDate || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="hrms-tabs-scroll">
          <TabsTrigger value="job-details">Job Details</TabsTrigger>
          <TabsTrigger value="time-off">Time Off</TabsTrigger>
          <TabsTrigger value="pay-info">Pay Info</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        {/* Job Details Tab */}
        <TabsContent value="job-details" className="space-y-6">
          {tabBusy && !jobDetails ? (
            <p className="text-sm text-gray-500">Loading job details...</p>
          ) : jobDetails ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Employment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Position</p>
                    <p className="text-gray-900">{jobDetails.position || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Department</p>
                    <p className="text-gray-900">{jobDetails.department || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Manager</p>
                    <p className="text-gray-900">{jobDetails.manager || jobDetails.reportingTo || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-gray-900">{jobDetails.employmentType || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hire Date</p>
                    <p className="text-gray-900">{jobDetails.hireDate || "—"}</p>
                  </div>
                  {"tenure" in jobDetails && (jobDetails as JobDetails & { tenure?: string }).tenure && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tenure</p>
                      <p className="text-gray-900">{(jobDetails as JobDetails & { tenure?: string }).tenure}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900">{(jobDetails as JobDetails & { email?: string }).email || employee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-gray-900">{(jobDetails as JobDetails & { phone?: string }).phone || employee.phone}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No job details available.</p>
          )}
        </TabsContent>

        {/* Time Off Tab */}
        <TabsContent value="time-off" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Leave History
              </CardTitle>
              <CardDescription>All approved and pending leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              {tabBusy ? (
                <p className="text-sm text-gray-500 py-4">Loading leave history...</p>
              ) : timeOff.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No leave requests found.</p>
              ) : (
              <>
              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approved By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(timeOff || []).map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>{leave.type}</TableCell>
                        <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{leave.days}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(leave.status)}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{leave.approvedBy || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden space-y-3">
                {timeOff.map((leave) => (
                  <div key={leave.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{leave.type}</p>
                      <Badge className={getStatusColor(leave.status)}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Start</span>
                        <p className="font-medium">{new Date(leave.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">End</span>
                        <p className="font-medium">{new Date(leave.endDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Days</span>
                        <p className="font-medium">{leave.days}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Approved By</span>
                        <p className="font-medium">{leave.approvedBy || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pay Info Tab */}
        <TabsContent value="pay-info" className="space-y-6">
          {tabBusy && !payInfo ? (
            <p className="text-sm text-gray-500">Loading pay information...</p>
          ) : payInfo ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Salary Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Basic Salary</p>
                    <p className="text-2xl font-bold text-gray-900">₹{payInfo?.basicSalary?.toLocaleString?.() || 0}</p>
                  </div>
                  
                  <Separator />

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Allowances</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Housing</span>
                        <span className="text-sm font-medium">₹{payInfo?.allowances?.housing?.toLocaleString?.() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Transport</span>
                        <span className="text-sm font-medium">₹{payInfo?.allowances?.transport?.toLocaleString?.() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Meal</span>
                        <span className="text-sm font-medium">₹{payInfo?.allowances?.meal?.toLocaleString?.() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Other</span>
                        <span className="text-sm font-medium">₹{payInfo?.allowances?.other?.toLocaleString?.() || 0}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Deductions</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tax</span>
                        <span className="text-sm font-medium text-red-600">-₹{payInfo?.deductions?.tax?.toLocaleString?.() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Insurance</span>
                        <span className="text-sm font-medium text-red-600">-₹{payInfo?.deductions?.insurance?.toLocaleString?.() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pension</span>
                        <span className="text-sm font-medium text-red-600">-₹{payInfo?.deductions?.pension?.toLocaleString?.() || 0}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Salary</p>
                    <p className="text-2xl font-bold text-green-600">₹{payInfo?.netSalary?.toLocaleString?.() || 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Bank Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bank Name</p>
                    <p className="text-gray-900">{payInfo?.bankDetails?.bankName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Account Number</p>
                    <p className="text-gray-900">{payInfo?.bankDetails?.accountNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">IFSC Code</p>
                    <p className="text-gray-900">{payInfo?.bankDetails?.ifscCode || '-'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pay Schedule</p>
                    <p className="text-gray-900">{payInfo?.paySchedule || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Next Pay Date</p>
                    <p className="text-gray-900">{payInfo?.nextPayDate ? new Date(payInfo.nextPayDate).toLocaleDateString() : '-'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No pay information available.</p>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Employee Documents
              </CardTitle>
              <CardDescription>All uploaded documents and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                    {(documents || []).map((doc) => (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
                        <p className="text-xs text-gray-500">Uploaded by {doc.uploadedBy} on {new Date(doc.uploadDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Update
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {performance && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Current Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{performance.rating}</div>
                    <div className="flex justify-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.floor(performance.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Period: {performance.period}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Goals & Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(performance?.goals || []).map((goal) => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{goal.title}</h4>
                          <Badge className={getStatusColor(goal.status)}>
                            {goal.status.replace('_', ' ').charAt(0).toUpperCase() + goal.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Timesheets Tab */}
        <TabsContent value="timesheets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timesheet History
              </CardTitle>
              <CardDescription>Track work hours and project time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approved By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(timesheets || []).map((timesheet) => (
                      <TableRow key={timesheet.id}>
                        <TableCell>{new Date(timesheet.date).toLocaleDateString()}</TableCell>
                        <TableCell>{timesheet.hours}</TableCell>
                        <TableCell>{timesheet.project}</TableCell>
                        <TableCell>{timesheet.task}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(timesheet.status)}>
                            {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{timesheet.approvedBy || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden space-y-3">
                {(timesheets || []).map((timesheet) => (
                  <div key={timesheet.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{new Date(timesheet.date).toLocaleDateString()}</p>
                      <Badge className={getStatusColor(timesheet.status)}>
                        {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Hours</span>
                        <p className="font-medium">{timesheet.hours}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Project</span>
                        <p className="font-medium truncate">{timesheet.project}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Task</span>
                        <p className="font-medium">{timesheet.task}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Approved By</span>
                        <p className="font-medium">{timesheet.approvedBy || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {(timesheets || []).length === 0 && (
                  <p className="text-center text-gray-500 py-8">No timesheets found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Employee Benefits
              </CardTitle>
              <CardDescription>All active benefits and coverage details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(benefits || []).map((benefit) => (
                  <div key={benefit.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Heart className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{benefit.name}</h4>
                          <p className="text-sm text-gray-600">{benefit.type} • {benefit.provider}</p>
                          <p className="text-sm text-gray-500">{benefit.coverage}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(benefit.status)}>
                          {benefit.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">₹{benefit.cost?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Training Programs
              </CardTitle>
              <CardDescription>All training programs and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(training || []).map((program) => (
                  <div key={program.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{program.name}</h4>
                          <p className="text-sm text-gray-600">{program.type} • {program.provider}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(program.status)}>
                          {program.status.replace('_', ' ')}
                        </Badge>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{program.progress}%</span>
                          </div>
                          <Progress value={program.progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Assigned Assets
              </CardTitle>
              <CardDescription>All company assets assigned to this employee</CardDescription>
            </CardHeader>
            <CardContent>
              {assets.length === 0 ? (
                <p className="text-sm text-gray-500">No assets assigned to this employee.</p>
              ) : (
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Package className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{asset.name}</h4>
                            <p className="text-sm text-gray-600">
                              {asset.assetType} • {asset.brand} {asset.model}
                            </p>
                            <p className="text-xs text-gray-500">Serial: {asset.serialNumber}</p>
                            {asset.purchaseDate && (
                              <p className="text-xs text-gray-500">
                                Purchased: {asset.purchaseDate}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge className={getStatusColor(asset.status)}>
                            {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                          </Badge>
                          <p className="text-sm text-gray-600">Condition: {asset.condition}</p>
                          <p className="text-sm text-gray-600">Location: {asset.location}</p>
                          {asset.currentValue !== undefined && (
                            <p className="text-xs text-gray-500">Value: ₹{asset.currentValue}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <EmployeeForm
        open={showEditForm}
        onClose={() => { setShowEditForm(false); setEditEmployee(null) }}
        onSubmit={handleUpdateEmployee}
        initialData={editEmployee}
      />
    </div>
    </ResourceGuard>
  )
}