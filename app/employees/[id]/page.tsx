"use client"

import React, { useEffect, useMemo, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { useAuthContext } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  status: string
  avatar?: string
  manager?: string
  location: string
  salary: number
  employeeId: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

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

type EditEmployeeDraft = {
  first_name: string
  last_name: string
  email: string
  phone: string
  designation: string
}

export default function EmployeeProfilePage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string
  const { user, roles } = useAuthContext()

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
  const [employeeManagerId, setEmployeeManagerId] = useState<number | null>(null)

  // Edit profile (real save)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editDraft, setEditDraft] = useState<EditEmployeeDraft>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    designation: "",
  })

  // Attendance regularization (UI-only)
  const [regDraft, setRegDraft] = useState({
    date: "",
    issue_type: "missed_punch",
    requested_check_in: "",
    requested_check_out: "",
    reason: "",
  })

  // Appraisal (UI-only)
  const [appraisalDraft, setAppraisalDraft] = useState({
    period: "Apr 2026 – Mar 2027",
    employee_summary: "",
    employee_strengths: "",
    employee_improvements: "",
    manager_summary: "",
    manager_rating: "3",
    manager_comments: "",
    goals: [
      { title: "Improve incident response time", progress: 60, notes: "" },
      { title: "Automate asset inventory audit", progress: 35, notes: "" },
    ] as { title: string; progress: number; notes: string }[],
  })

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const data = await apiRequest<any>(getApiUrl(`employee_profiles/${employeeId}`))

        setEmployee({
          id: data.employee.id,
          name: data.employee.name,
          email: data.employee.email,
          phone: data.employee.phone,
          position: data.employee.position,
          department: data.employee.department,
          hireDate: data.employee.hire_date,
          status: data.employee.status,
          avatar: data.employee.avatar,
          manager: data.employee.manager,
          location: data.employee.location,
          salary: data.employee.salary,
          employeeId: data.employee.employee_id,
          emergencyContact: data.employee.emergency_contact
        })

        setJobDetails(data.job_details || null)
        setTimeOff(Array.isArray(data.time_off) ? data.time_off : [])
        setPayInfo(data.pay_info || null)
        setDocuments(Array.isArray(data.documents) ? data.documents : [])
        setPerformance(data.performance || null)
        setTimesheets(Array.isArray(data.timesheets) ? data.timesheets : [])
        setBenefits(Array.isArray(data.benefits) ? data.benefits : [])
        setTraining(Array.isArray(data.training) ? data.training : [])
        const assetsData = Array.isArray(data.assets?.assets) ? data.assets.assets : []
        setAssets(
          assetsData.map((asset: any) => ({
            id: asset.id,
            name: asset.name,
            assetType: asset.asset_type,
            serialNumber: asset.serial_number,
            brand: asset.brand,
            model: asset.model,
            status: asset.status,
            statusColor: asset.status_color,
            condition: asset.condition,
            location: asset.location,
            purchaseDate: asset.purchase_date,
            currentValue: asset.current_value
          }))
        )
      } catch (error) {
        console.error('Error fetching employee data:', error)
        setEmployee(null)
      }
    }

    fetchEmployeeData()
  }, [employeeId])

  const openEdit = async () => {
    setEditOpen(true)
    setEditLoading(true)
    try {
      const data = await apiRequest<any>(getApiUrl(`employees/${employeeId}`), { suppressToast: true } as any)
      setEmployeeManagerId(typeof data.manager_id === "number" ? data.manager_id : (data.manager_id ? Number(data.manager_id) : null))
      setEditDraft({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        designation: data.designation || "",
      })
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to load employee for editing",
        variant: "destructive",
      })
      setEditOpen(false)
    } finally {
      setEditLoading(false)
    }
  }

  const roleNames = useMemo(() => new Set((roles || []).map((r: any) => r.name)), [roles])
  const isAdminLike = roleNames.has("Super Admin") || roleNames.has("HR Manager")
  const currentEmployeeId = user?.employee_id ? Number(user.employee_id) : null
  const viewingEmployeeId = Number(employeeId)
  const isSelf = Boolean(currentEmployeeId && viewingEmployeeId && currentEmployeeId === viewingEmployeeId)
  const isManagerOfEmployee = Boolean(currentEmployeeId && employeeManagerId && currentEmployeeId === employeeManagerId)

  const canRegularize = isSelf || isAdminLike
  const canEditEmployeeSection = isSelf || isAdminLike
  const canEditManagerSection = isManagerOfEmployee || isAdminLike

  const saveEdit = async () => {
    setEditSaving(true)
    try {
      await apiRequest(getApiUrl(`employees/${employeeId}`), {
        method: "PATCH",
        body: JSON.stringify({ employee: editDraft }),
      })
      toast({ title: "Saved", description: "Employee profile updated" })
      setEditOpen(false)

      // Refresh the show page data
      const refreshed = await apiRequest<any>(getApiUrl(`employee_profiles/${employeeId}`), { suppressToast: true } as any)
      setEmployee({
        id: refreshed.employee.id,
        name: refreshed.employee.name,
        email: refreshed.employee.email,
        phone: refreshed.employee.phone,
        position: refreshed.employee.position,
        department: refreshed.employee.department,
        hireDate: refreshed.employee.hire_date,
        status: refreshed.employee.status,
        avatar: refreshed.employee.avatar,
        manager: refreshed.employee.manager,
        location: refreshed.employee.location,
        salary: refreshed.employee.salary,
        employeeId: refreshed.employee.employee_id,
        emergencyContact: refreshed.employee.emergency_contact,
      })
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to update employee",
        variant: "destructive",
      })
    } finally {
      setEditSaving(false)
    }
  }

  if (!employee) {
    return <div className="max-w-4xl mx-auto p-6 text-gray-600">Loading employee...</div>
  }

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
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Employee Profile</h1>
          <p className="text-gray-600">Detailed information about {employee.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Employee Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={employee.avatar} alt={employee.name} />
              <AvatarFallback className="text-2xl">{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                  <p className="text-lg text-gray-600">{employee.position}</p>
                  <p className="text-gray-500">{employee.department} • {employee.location}</p>
                </div>
                <Badge className={getStatusColor(employee.status)}>
                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">ID: {employee.employeeId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Hired: {new Date(employee.hireDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="job-details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-11">
          <TabsTrigger value="job-details">Job Details</TabsTrigger>
          <TabsTrigger value="time-off">Time Off</TabsTrigger>
          <TabsTrigger value="attendance-regularization">Regularize</TabsTrigger>
          <TabsTrigger value="pay-info">Pay Info</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="appraisals">Appraisals</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        {/* Job Details Tab */}
        <TabsContent value="job-details" className="space-y-6">
          {jobDetails && (
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
                    <p className="text-gray-900">{jobDetails.position}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Department</p>
                    <p className="text-gray-900">{jobDetails.department}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Manager</p>
                    <p className="text-gray-900">{jobDetails.manager}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Employment Type</p>
                    <p className="text-gray-900">{jobDetails.employmentType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Work Location</p>
                    <p className="text-gray-900">{jobDetails.workLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Work Schedule</p>
                    <p className="text-gray-900">{jobDetails.workSchedule}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Skills & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(jobDetails.skills || []).map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {(jobDetails.certifications || []).map((cert, index) => (
                        <Badge key={index} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
              <div className="rounded-md border">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Regularization (UI-only for now) */}
        <TabsContent value="attendance-regularization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="w-5 h-5" />
                Attendance Regularization
              </CardTitle>
              <CardDescription>
                UI-only: submit a request to correct missed/incorrect attendance entries.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!canRegularize ? (
                <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
                  You can view this form, but only the employee (self) or an admin can submit regularization.
                </div>
              ) : null}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={regDraft.date}
                    onChange={(e) => setRegDraft((p) => ({ ...p, date: e.target.value }))}
                    disabled={!canRegularize}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issue type</Label>
                  <Input
                    value={regDraft.issue_type}
                    onChange={(e) => setRegDraft((p) => ({ ...p, issue_type: e.target.value }))}
                    placeholder="missed_punch / wrong_time / wfh / etc"
                    disabled={!canRegularize}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requested check-in</Label>
                  <Input
                    type="time"
                    value={regDraft.requested_check_in}
                    onChange={(e) => setRegDraft((p) => ({ ...p, requested_check_in: e.target.value }))}
                    disabled={!canRegularize}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requested check-out</Label>
                  <Input
                    type="time"
                    value={regDraft.requested_check_out}
                    onChange={(e) => setRegDraft((p) => ({ ...p, requested_check_out: e.target.value }))}
                    disabled={!canRegularize}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    value={regDraft.reason}
                    onChange={(e) => setRegDraft((p) => ({ ...p, reason: e.target.value }))}
                    placeholder="Describe what happened and why this needs correction…"
                    rows={4}
                    disabled={!canRegularize}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setRegDraft({ date: "", issue_type: "missed_punch", requested_check_in: "", requested_check_out: "", reason: "" })
                  }
                  disabled={!canRegularize}
                >
                  Clear
                </Button>
                <Button
                  onClick={() =>
                    toast({
                      title: "Submitted (UI-only)",
                      description: "Regularization request captured in UI only for now.",
                    })
                  }
                  disabled={!canRegularize || !regDraft.date || !regDraft.reason.trim()}
                >
                  Submit request
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pay Info Tab */}
        <TabsContent value="pay-info" className="space-y-6">
          {payInfo && (
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
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
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
              <div className="rounded-md border">
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
                    <div className="flex items-center justify-between">
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
                    <div className="flex items-center justify-between">
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
                      <div className="flex items-center justify-between gap-4">
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

        {/* Appraisals (UI-only) */}
        <TabsContent value="appraisals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Appraisal Form
              </CardTitle>
              <CardDescription>
                UI-only: both employee and manager sections can be filled. Saving will be wired later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Appraisal period</Label>
                <Input
                  value={appraisalDraft.period}
                  onChange={(e) => setAppraisalDraft((p) => ({ ...p, period: e.target.value }))}
                  disabled={!isAdminLike}
                />
                {!isAdminLike ? (
                  <div className="text-xs text-gray-500">Only admin can change the period for now.</div>
                ) : null}
              </div>

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">Employee self-evaluation</div>
                    <Badge variant="outline">Employee</Badge>
                  </div>
                  {!canEditEmployeeSection ? (
                    <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
                      Only the employee (self) can fill this section.
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <Label>Summary</Label>
                    <Textarea
                      value={appraisalDraft.employee_summary}
                      onChange={(e) => setAppraisalDraft((p) => ({ ...p, employee_summary: e.target.value }))}
                      rows={4}
                      placeholder="Key achievements, impact, highlights…"
                      disabled={!canEditEmployeeSection}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Strengths</Label>
                    <Textarea
                      value={appraisalDraft.employee_strengths}
                      onChange={(e) => setAppraisalDraft((p) => ({ ...p, employee_strengths: e.target.value }))}
                      rows={3}
                      placeholder="What went well…"
                      disabled={!canEditEmployeeSection}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Areas for improvement</Label>
                    <Textarea
                      value={appraisalDraft.employee_improvements}
                      onChange={(e) => setAppraisalDraft((p) => ({ ...p, employee_improvements: e.target.value }))}
                      rows={3}
                      placeholder="What to improve next cycle…"
                      disabled={!canEditEmployeeSection}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">Manager evaluation</div>
                    <Badge variant="secondary">Manager</Badge>
                  </div>
                  {!canEditManagerSection ? (
                    <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
                      Only the assigned manager can fill this section.
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <Label>Manager summary</Label>
                    <Textarea
                      value={appraisalDraft.manager_summary}
                      onChange={(e) => setAppraisalDraft((p) => ({ ...p, manager_summary: e.target.value }))}
                      rows={4}
                      placeholder="Manager’s assessment and justification…"
                      disabled={!canEditManagerSection}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Overall rating (1–5)</Label>
                    <Input
                      value={appraisalDraft.manager_rating}
                      onChange={(e) => setAppraisalDraft((p) => ({ ...p, manager_rating: e.target.value }))}
                      placeholder="3"
                      disabled={!canEditManagerSection}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Manager comments</Label>
                    <Textarea
                      value={appraisalDraft.manager_comments}
                      onChange={(e) => setAppraisalDraft((p) => ({ ...p, manager_comments: e.target.value }))}
                      rows={3}
                      placeholder="Promotion recommendation, compensation notes, etc…"
                      disabled={!canEditManagerSection}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">Goals</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setAppraisalDraft((p) => ({
                        ...p,
                        goals: [ ...p.goals, { title: "", progress: 0, notes: "" } ],
                      }))
                    }
                    disabled={!canEditEmployeeSection && !canEditManagerSection}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add goal
                  </Button>
                </div>

                <div className="space-y-3">
                  {appraisalDraft.goals.map((g, idx) => (
                    <div key={idx} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <Label>Goal title</Label>
                          <Input
                            value={g.title}
                            onChange={(e) =>
                              setAppraisalDraft((p) => ({
                                ...p,
                                goals: p.goals.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)),
                              }))
                            }
                            placeholder="Goal…"
                            disabled={!canEditEmployeeSection && !canEditManagerSection}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setAppraisalDraft((p) => ({
                              ...p,
                              goals: p.goals.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-red-600"
                          title="Remove goal"
                          disabled={!canEditEmployeeSection && !canEditManagerSection}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Progress (%)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={g.progress}
                            onChange={(e) =>
                              setAppraisalDraft((p) => ({
                                ...p,
                                goals: p.goals.map((x, i) =>
                                  i === idx ? { ...x, progress: Number(e.target.value) || 0 } : x
                                ),
                              }))
                            }
                            disabled={!canEditEmployeeSection && !canEditManagerSection}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Input
                            value={g.notes}
                            onChange={(e) =>
                              setAppraisalDraft((p) => ({
                                ...p,
                                goals: p.goals.map((x, i) => (i === idx ? { ...x, notes: e.target.value } : x)),
                              }))
                            }
                            placeholder="Optional notes…"
                            disabled={!canEditEmployeeSection && !canEditManagerSection}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setAppraisalDraft((p) => ({
                      ...p,
                      employee_summary: "",
                      employee_strengths: "",
                      employee_improvements: "",
                      manager_summary: "",
                      manager_comments: "",
                      manager_rating: "3",
                    }))
                  }
                  disabled={!canEditEmployeeSection && !canEditManagerSection}
                >
                  Reset text
                </Button>
                <Button
                  onClick={() =>
                    toast({
                      title: "Saved (UI-only)",
                      description: "Appraisal draft saved in UI only for now.",
                    })
                  }
                  disabled={!canEditEmployeeSection && !canEditManagerSection}
                >
                  Save draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Employee Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit employee</DialogTitle>
            <DialogDescription>Updates basic employee fields.</DialogDescription>
          </DialogHeader>

          {editLoading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input
                    value={editDraft.first_name}
                    onChange={(e) => setEditDraft((p) => ({ ...p, first_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input
                    value={editDraft.last_name}
                    onChange={(e) => setEditDraft((p) => ({ ...p, last_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editDraft.email}
                    onChange={(e) => setEditDraft((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editDraft.phone}
                    onChange={(e) => setEditDraft((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Designation</Label>
                  <Input
                    value={editDraft.designation}
                    onChange={(e) => setEditDraft((p) => ({ ...p, designation: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>
                  Cancel
                </Button>
                <Button onClick={saveEdit} disabled={editSaving}>
                  {editSaving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 