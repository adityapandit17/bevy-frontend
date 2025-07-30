"use client"

import { useState } from "react"
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
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  File,
  Image,
  FileSpreadsheet,
  Calendar,
  User,
  Building2,
  Shield,
  Signature,
  Bell,
  Archive
} from "lucide-react"

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Sample data for policy documents
  const policyDocuments = [
    {
      id: 1,
      title: "Employee Handbook 2024",
      category: "HR Policies",
      version: "v2.1",
      lastUpdated: "2024-01-15",
      expiryDate: "2025-01-15",
      status: "active",
      downloads: 156,
      size: "2.4 MB",
      type: "pdf",
      requiresSignature: true,
      signedBy: 89
    },
    {
      id: 2,
      title: "Code of Conduct",
      category: "Compliance",
      version: "v1.5",
      lastUpdated: "2024-01-10",
      expiryDate: "2025-01-10",
      status: "active",
      downloads: 203,
      size: "1.8 MB",
      type: "pdf",
      requiresSignature: true,
      signedBy: 156
    },
    {
      id: 3,
      title: "Data Protection Policy",
      category: "Security",
      version: "v3.0",
      lastUpdated: "2024-01-20",
      expiryDate: "2025-01-20",
      status: "active",
      downloads: 98,
      size: "3.1 MB",
      type: "pdf",
      requiresSignature: true,
      signedBy: 67
    },
    {
      id: 4,
      title: "Leave Policy",
      category: "HR Policies",
      version: "v1.2",
      lastUpdated: "2023-12-01",
      expiryDate: "2024-12-01",
      status: "expiring",
      downloads: 134,
      size: "1.5 MB",
      type: "pdf",
      requiresSignature: false,
      signedBy: 0
    }
  ]

  // Sample data for employee documents
  const employeeDocuments = [
    {
      id: 1,
      employeeName: "Sarah Johnson",
      documentType: "KYC Documents",
      title: "Aadhaar Card",
      uploadDate: "2024-01-15",
      expiryDate: "2030-01-15",
      status: "verified",
      size: "1.2 MB",
      type: "image",
      verifiedBy: "HR Team",
      verificationDate: "2024-01-16"
    },
    {
      id: 2,
      employeeName: "Michael Chen",
      documentType: "Medical Certificate",
      title: "Health Checkup Report",
      uploadDate: "2024-01-10",
      expiryDate: "2024-07-10",
      status: "pending",
      size: "2.8 MB",
      type: "pdf",
      verifiedBy: null,
      verificationDate: null
    },
    {
      id: 3,
      employeeName: "Emily Rodriguez",
      documentType: "KYC Documents",
      title: "PAN Card",
      uploadDate: "2024-01-12",
      expiryDate: "2029-01-12",
      status: "verified",
      size: "0.8 MB",
      type: "image",
      verifiedBy: "HR Team",
      verificationDate: "2024-01-13"
    },
    {
      id: 4,
      employeeName: "David Wilson",
      documentType: "Medical Certificate",
      title: "Fitness Certificate",
      uploadDate: "2024-01-08",
      expiryDate: "2024-04-08",
      status: "expiring",
      size: "1.5 MB",
      type: "pdf",
      verifiedBy: "HR Team",
      verificationDate: "2024-01-09"
    }
  ]

  // Sample data for digital signatures
  const digitalSignatures = [
    {
      id: 1,
      documentTitle: "Employee Handbook 2024",
      employeeName: "Sarah Johnson",
      signedDate: "2024-01-16",
      status: "signed",
      signatureType: "electronic",
      ipAddress: "192.168.1.100",
      deviceInfo: "Chrome on Windows"
    },
    {
      id: 2,
      documentTitle: "Code of Conduct",
      employeeName: "Michael Chen",
      signedDate: "2024-01-17",
      status: "pending",
      signatureType: "pending",
      ipAddress: null,
      deviceInfo: null
    },
    {
      id: 3,
      documentTitle: "Data Protection Policy",
      employeeName: "Emily Rodriguez",
      signedDate: "2024-01-18",
      status: "signed",
      signatureType: "electronic",
      ipAddress: "192.168.1.105",
      deviceInfo: "Safari on Mac"
    }
  ]

  // Sample data for expiry alerts
  const expiryAlerts = [
    {
      id: 1,
      documentTitle: "Leave Policy",
      documentType: "Policy Document",
      expiryDate: "2024-12-01",
      daysUntilExpiry: 45,
      priority: "medium",
      assignedTo: "HR Manager",
      status: "pending"
    },
    {
      id: 2,
      documentTitle: "Fitness Certificate - David Wilson",
      documentType: "Employee Document",
      expiryDate: "2024-04-08",
      daysUntilExpiry: 12,
      priority: "high",
      assignedTo: "HR Team",
      status: "in-progress"
    },
    {
      id: 3,
      documentTitle: "Health Checkup Report - Michael Chen",
      documentType: "Employee Document",
      expiryDate: "2024-07-10",
      daysUntilExpiry: 90,
      priority: "low",
      assignedTo: "HR Team",
      status: "pending"
    }
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />
      case 'image': return <Image className="w-4 h-4 text-green-500" />
      case 'doc': return <FileText className="w-4 h-4 text-blue-500" />
      case 'spreadsheet': return <FileSpreadsheet className="w-4 h-4 text-green-600" />
      default: return <File className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'expiring':
        return <Badge className="bg-orange-100 text-orange-800">Expiring Soon</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'signed':
        return <Badge className="bg-green-100 text-green-800">Signed</Badge>
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800">Medium</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600">Manage policy documents, employee files, and digital signatures</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Signatures</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Signature className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">2.4 GB</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Archive className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="policies">Policy Documents</TabsTrigger>
          <TabsTrigger value="employee">Employee Documents</TabsTrigger>
          <TabsTrigger value="signatures">Digital Signatures</TabsTrigger>
          <TabsTrigger value="alerts">Expiry Alerts</TabsTrigger>
        </TabsList>

        {/* Policy Documents */}
        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Policy Documents
                  </CardTitle>
                  <CardDescription>
                    Manage company policies and procedures
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search policies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="HR Policies">HR Policies</SelectItem>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Signatures</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policyDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.type)}
                          <div>
                            <p className="font-medium text-gray-900">{doc.title}</p>
                            <p className="text-sm text-gray-500">{doc.size}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doc.category}</TableCell>
                      <TableCell>{doc.version}</TableCell>
                      <TableCell>{new Date(doc.lastUpdated).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(doc.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>{doc.downloads}</TableCell>
                      <TableCell>
                        {doc.requiresSignature ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{doc.signedBy}/156</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not required</span>
                        )}
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Documents */}
        <TabsContent value="employee" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Employee Documents
                  </CardTitle>
                  <CardDescription>
                    KYC documents, medical certificates, and other employee files
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search documents..."
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expiring">Expiring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified By</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {doc.employeeName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-gray-900">{doc.employeeName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{doc.documentType}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(doc.type)}
                          <span>{doc.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(doc.uploadDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(doc.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        {doc.verifiedBy ? (
                          <div>
                            <p className="text-sm font-medium">{doc.verifiedBy}</p>
                            <p className="text-xs text-gray-500">
                              {doc.verificationDate && new Date(doc.verificationDate).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not verified</span>
                        )}
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Verify
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Digital Signatures */}
        <TabsContent value="signatures" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Signature className="w-5 h-5" />
                    Digital Signatures
                  </CardTitle>
                  <CardDescription>
                    Track document signatures and compliance
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Bell className="w-4 h-4 mr-2" />
                    Send Reminders
                  </Button>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Signed Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Signature Type</TableHead>
                    <TableHead>Device Info</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {digitalSignatures.map((sig) => (
                    <TableRow key={sig.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{sig.documentTitle}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                            {sig.employeeName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span>{sig.employeeName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {sig.signedDate ? new Date(sig.signedDate).toLocaleDateString() : 'Pending'}
                      </TableCell>
                      <TableCell>{getStatusBadge(sig.status)}</TableCell>
                      <TableCell>
                        {sig.signatureType === 'electronic' ? (
                          <Badge className="bg-green-100 text-green-800">Electronic</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {sig.deviceInfo ? (
                          <span className="text-sm text-gray-600">{sig.deviceInfo}</span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Signature
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Bell className="mr-2 h-4 w-4" />
                              Send Reminder
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiry Alerts */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Expiry Alerts
                  </CardTitle>
                  <CardDescription>
                    Documents expiring soon that require attention
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    View All Alerts
                  </Button>
                  <Button>
                    <Bell className="w-4 h-4 mr-2" />
                    Configure Alerts
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiryAlerts.map((alert) => (
                    <TableRow key={alert.id} className={alert.priority === 'high' ? 'bg-red-50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="font-medium">{alert.documentTitle}</span>
                        </div>
                      </TableCell>
                      <TableCell>{alert.documentType}</TableCell>
                      <TableCell>{new Date(alert.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className={alert.daysUntilExpiry <= 30 ? 'text-red-600 font-medium' : ''}>
                            {alert.daysUntilExpiry} days
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(alert.priority)}</TableCell>
                      <TableCell>{alert.assignedTo}</TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Document
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Update Document
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Bell className="mr-2 h-4 w-4" />
                              Send Notification
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Resolved
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 