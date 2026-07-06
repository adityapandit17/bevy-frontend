"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  Archive,
  Loader2
} from "lucide-react"
import { useAuth } from "@/lib/auth/auth.hooks"
import { apiRequest, getApiUrl, getDocumentUrl, getEndpointUrl } from "@/lib/api"
import { DocumentPreview } from "@/components/ui/document-preview"
import { DocumentSignDialog } from "@/components/documents/document-sign-dialog"
import { toast } from "@/hooks/use-toast"
import { AUTH_CONFIG } from "@/config/auth.config"

interface PolicyDocument {
  id: number
  title: string
  category: string
  version: string
  lastUpdated: string
  expiryDate: string
  status: string
  downloads: number
  size: string
  type: string
  requiresSignature: boolean
  filePath?: string
  signedBy?: number
  signaturesPending?: number
  signaturesTotal?: number
}

interface EmployeeDocument {
  id: number
  employee_id: number
  employee_name?: string
  name: string
  document_type: string
  upload_date: string
  expiry_date: string | null
  status: string
  file_size: string
  uploaded_by: string
  file_path?: string
}

export default function DocumentsPage() {
  const { checkRole, roles, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [policyDocuments, setPolicyDocuments] = useState<PolicyDocument[]>([])
  const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingEmployeeDocs, setIsLoadingEmployeeDocs] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<PolicyDocument | null>(null)
  const [selectedEmployeeDoc, setSelectedEmployeeDoc] = useState<EmployeeDocument | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadFormData, setUploadFormData] = useState({
    employeeId: "",
    documentType: "id_proof",
    name: "",
    expiryDate: "",
  })
  const [employees, setEmployees] = useState<any[]>([])
  const employeeFileInputRef = useRef<HTMLInputElement>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEmployeeDocViewDialog, setShowEmployeeDocViewDialog] = useState(false)
  const [showEmployeeDocDeleteDialog, setShowEmployeeDocDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingEmployeeDoc, setIsDeletingEmployeeDoc] = useState(false)
  const [isVerifyingEmployeeDoc, setIsVerifyingEmployeeDoc] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editFormData, setEditFormData] = useState({
    title: "",
    category: "",
    version: "",
    expiryDate: "",
    status: "active",
    requiresSignature: false
  })
  const [createFormData, setCreateFormData] = useState({
    title: "",
    category: "",
    version: "",
    expiryDate: "",
    status: "active",
    requiresSignature: false
  })

  // Check if user is Super Admin or HR Manager (can edit/delete)
  // Handle both string and object formats for roles
  const isSuperAdmin = checkRole("Super Admin") || 
    roles?.some((r: any) => {
      if (typeof r === 'string') return r === "Super Admin";
      return r?.name === "Super Admin";
    })
  const isHRManager = checkRole("HR Manager") || 
    roles?.some((r: any) => {
      if (typeof r === 'string') return r === "HR Manager";
      return r?.name === "HR Manager";
    })
  const canEditPolicyDocuments = isSuperAdmin || isHRManager

  interface DigitalSignatureRow {
    id: number
    documentTitle: string
    employeeName: string
    employeeId?: number
    policyDocumentId?: number
    signedDate: string | null
    status: string
    signatureType: string
    ipAddress: string | null
    deviceInfo: string | null
    hasSignatureImage?: boolean
    signatureImage?: string | null
  }

  interface SignatureStats {
    total: number
    pending: number
    signed: number
    rejected: number
  }

  interface ExpiryAlertRow {
    id: string
    documentTitle: string
    documentType: string
    expiryDate: string | null
    daysUntilExpiry: number | null
    priority: string
    assignedTo: string
    status: string
    employeeName?: string
  }

  const [digitalSignatures, setDigitalSignatures] = useState<DigitalSignatureRow[]>([])
  const [pendingSignatures, setPendingSignatures] = useState<DigitalSignatureRow[]>([])
  const [signatureStats, setSignatureStats] = useState<SignatureStats>({ total: 0, pending: 0, signed: 0, rejected: 0 })
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlertRow[]>([])
  const [isLoadingSignatures, setIsLoadingSignatures] = useState(false)
  const [isLoadingExpiryAlerts, setIsLoadingExpiryAlerts] = useState(false)
  const [signDialogOpen, setSignDialogOpen] = useState(false)
  const [signatureToSign, setSignatureToSign] = useState<DigitalSignatureRow | null>(null)
  const [viewSignatureOpen, setViewSignatureOpen] = useState(false)
  const [selectedSignature, setSelectedSignature] = useState<DigitalSignatureRow | null>(null)
  const [isSendingReminders, setIsSendingReminders] = useState(false)
  const [isRequestingSignatures, setIsRequestingSignatures] = useState(false)

  // Fetch policy documents from API
  useEffect(() => {
    fetchPolicyDocuments()
    fetchEmployeeDocuments()
    fetchEmployees()
    fetchDigitalSignatures()
    fetchPendingSignatures()
    fetchSignatureStats()
    fetchExpiryAlerts()
  }, [])

  const fetchEmployees = async () => {
    try {
      // Use the shared EMPLOYEES endpoint helper and handle paginated response
      const response = await apiRequest<any>(`${getApiUrl('/employees')}?per_page=1000`)
      const employeesData = Array.isArray(response) ? response : response?.data
      setEmployees(Array.isArray(employeesData) ? employeesData : [])
    } catch (error) {
      console.error("Error fetching employees:", error)
      // On error, ensure we reset employees to an empty array so the Select still works
      setEmployees([])
    }
  }

  const fetchPolicyDocuments = async () => {
    try {
      setIsLoading(true)
      const data = await apiRequest<PolicyDocument[]>(getEndpointUrl("POLICY_DOCUMENTS"))
      setPolicyDocuments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching policy documents:", error)
      setPolicyDocuments([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDigitalSignatures = async () => {
    try {
      setIsLoadingSignatures(true)
      const data = await apiRequest<DigitalSignatureRow[]>(getEndpointUrl("DIGITAL_SIGNATURES"))
      setDigitalSignatures(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching digital signatures:", error)
      setDigitalSignatures([])
    } finally {
      setIsLoadingSignatures(false)
    }
  }

  const fetchPendingSignatures = async () => {
    try {
      const data = await apiRequest<DigitalSignatureRow[]>(
        getEndpointUrl("DIGITAL_SIGNATURES_MY_PENDING"),
        { suppressToast: true }
      )
      setPendingSignatures(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching pending signatures:", error)
      setPendingSignatures([])
    }
  }

  const fetchSignatureStats = async () => {
    try {
      const data = await apiRequest<SignatureStats>(getEndpointUrl("DIGITAL_SIGNATURES_STATS"))
      setSignatureStats(data)
    } catch (error) {
      console.error("Error fetching signature stats:", error)
    }
  }

  const refreshSignatureData = () => {
    fetchDigitalSignatures()
    fetchPendingSignatures()
    fetchSignatureStats()
    fetchPolicyDocuments()
  }

  const handleOpenSignDialog = (sig: DigitalSignatureRow) => {
    setSignatureToSign(sig)
    setSignDialogOpen(true)
  }

  const handleViewSignature = (sig: DigitalSignatureRow) => {
    setSelectedSignature(sig)
    setViewSignatureOpen(true)
  }

  const handleSendReminders = async () => {
    try {
      setIsSendingReminders(true)
      const result = await apiRequest<{ message: string; count: number }>(
        getEndpointUrl("DIGITAL_SIGNATURES_SEND_REMINDERS"),
        { method: "POST", body: JSON.stringify({}) }
      )
      toast({
        title: "Reminders sent",
        description: result.message || `Reminders queued for ${result.count} employee(s)`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to send reminders",
        variant: "destructive",
      })
    } finally {
      setIsSendingReminders(false)
    }
  }

  const handleRequestSignatures = async (doc: PolicyDocument) => {
    try {
      setIsRequestingSignatures(true)
      const result = await apiRequest<{ message: string; created_count: number }>(
        getApiUrl(`policy_documents/${doc.id}/request_signatures`),
        { method: "POST", body: JSON.stringify({}) }
      )
      toast({
        title: "Signature requests sent",
        description: result.message || `Created ${result.created_count} new request(s)`,
      })
      refreshSignatureData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to request signatures",
        variant: "destructive",
      })
    } finally {
      setIsRequestingSignatures(false)
    }
  }

  const handleDownloadSignature = (sig: DigitalSignatureRow) => {
    if (!sig.signatureImage) {
      toast({
        title: "No signature",
        description: "This record does not have a captured signature image",
        variant: "destructive",
      })
      return
    }

    const link = document.createElement("a")
    link.href = sig.signatureImage
    link.download = `signature-${sig.documentTitle.replace(/\s+/g, "-")}-${sig.employeeName.replace(/\s+/g, "-")}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const documentStats = useMemo(() => {
    const totalDocs = policyDocuments.length + employeeDocuments.length
    const expiringSoon = expiryAlerts.filter((a) => (a.daysUntilExpiry ?? 999) <= 30).length
    return { totalDocs, expiringSoon }
  }, [policyDocuments.length, employeeDocuments.length, expiryAlerts])

  const fetchExpiryAlerts = async () => {
    try {
      setIsLoadingExpiryAlerts(true)
      const data = await apiRequest<ExpiryAlertRow[]>(getEndpointUrl("EXPIRY_ALERTS"))
      setExpiryAlerts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching expiry alerts:", error)
      setExpiryAlerts([])
    } finally {
      setIsLoadingExpiryAlerts(false)
    }
  }

  const fetchEmployeeDocuments = async () => {
    try {
      setIsLoadingEmployeeDocs(true)
      const url = getApiUrl("employee_documents")
      console.log("Fetching employee documents from:", url)
      const data = await apiRequest<EmployeeDocument[]>(url)
      if (data && Array.isArray(data)) {
        setEmployeeDocuments(data)
        console.log("Successfully fetched employee documents:", data.length)
      } else {
        console.warn("Employee documents data is not an array:", data)
        setEmployeeDocuments([])
      }
    } catch (error: any) {
      console.error("Error fetching employee documents:", error)
      // Error toast is already shown by apiRequest, so we don't need to show another one
      // Set empty array to prevent UI issues
      setEmployeeDocuments([])
    } finally {
      setIsLoadingEmployeeDocs(false)
    }
  }

  // Handle View action
  const handleView = (doc: PolicyDocument) => {
    setSelectedDocument(doc)
    setShowViewDialog(true)
  }

  // Handle Download action
  const handleDownload = async (doc: PolicyDocument) => {
    try {
      const downloadUrl = getApiUrl(`policy_documents/${doc.id}/download`)
      
      // Get token from localStorage
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
      if (!token) {
        throw new Error("No authentication token found. Please login again.")
      }
      
      const response = await fetch(downloadUrl, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Download failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = doc.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      })

      // Refresh documents to update download count
      fetchPolicyDocuments()
    } catch (error: any) {
      console.error("Error downloading document:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to download document",
        variant: "destructive",
      })
    }
  }

  // Handle Edit action
  const handleEdit = (doc: PolicyDocument) => {
    setSelectedDocument(doc)
    setEditFormData({
      title: doc.title,
      category: doc.category,
      version: doc.version || "",
      expiryDate: doc.expiryDate ? doc.expiryDate.split("T")[0] : "",
      status: doc.status,
      requiresSignature: doc.requiresSignature || false
    })
    setShowEditDialog(true)
  }

  // Handle Save Edit
  const handleSaveEdit = async () => {
    if (!selectedDocument) return

    try {
      setIsSaving(true)
      
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
      if (!token) {
        throw new Error("No authentication token found. Please login again.")
      }

      const response = await fetch(getApiUrl(`policy_documents/${selectedDocument.id}.json`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          policy_document: {
            title: editFormData.title,
            category: editFormData.category,
            version: editFormData.version,
            expiry_date: editFormData.expiryDate || null,
            status: editFormData.status,
            requires_signature: editFormData.requiresSignature,
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Request failed" }))
        throw new Error(errorData.error || errorData.message || "Failed to update policy document")
      }

      await response.json()

      toast({
        title: "Success",
        description: "Policy document updated successfully",
      })

      setShowEditDialog(false)
      setSelectedDocument(null)
      fetchPolicyDocuments()
    } catch (error: any) {
      console.error("Error updating document:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update policy document",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Delete action
  const handleDelete = async () => {
    if (!selectedDocument) return

    try {
      setIsDeleting(true)
      
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
      if (!token) {
        throw new Error("No authentication token found. Please login again.")
      }

      const response = await fetch(getApiUrl(`policy_documents/${selectedDocument.id}.json`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Request failed" }))
        throw new Error(errorData.error || errorData.message || "Failed to delete policy document")
      }

      toast({
        title: "Success",
        description: "Policy document deleted successfully",
      })

      setShowDeleteDialog(false)
      setSelectedDocument(null)
      fetchPolicyDocuments()
    } catch (error: any) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to delete policy document",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle View Employee Document
  const handleViewEmployeeDoc = (doc: EmployeeDocument) => {
    if (!doc.file_path) {
      toast({
        title: "Error",
        description: "Document file path is missing. Cannot view document.",
        variant: "destructive",
      })
      return
    }
    setSelectedEmployeeDoc(doc)
    setShowEmployeeDocViewDialog(true)
  }

  // Handle Download Employee Document
  const handleDownloadEmployeeDoc = async (doc: EmployeeDocument) => {
    try {
      if (!doc.file_path) {
        toast({
          title: "Error",
          description: "Document file path not found",
          variant: "destructive",
        })
        return
      }

      const downloadUrl = getDocumentUrl(doc.file_path, true)
      
      // Get token from localStorage
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
      if (!token) {
        throw new Error("No authentication token found. Please login again.")
      }
      
      const response = await fetch(downloadUrl, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        let errorMessage = "Download failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = doc.name || "document"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      })
    } catch (error: any) {
      console.error("Error downloading document:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to download document",
        variant: "destructive",
      })
    }
  }

  // Handle Verify Employee Document
  const handleVerifyEmployeeDoc = async (doc: EmployeeDocument) => {
    try {
      setIsVerifyingEmployeeDoc(true)
      
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
      if (!token) {
        throw new Error("No authentication token found. Please login again.")
      }

      const response = await fetch(getApiUrl(`employee_documents/${doc.id}.json`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_document: {
            status: "active",
            uploaded_by: user?.name || user?.first_name || "HR Manager",
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Request failed" }))
        throw new Error(errorData.error || errorData.message || "Failed to verify document")
      }

      toast({
        title: "Success",
        description: "Document verified successfully",
      })

      fetchEmployeeDocuments()
    } catch (error: any) {
      console.error("Error verifying document:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to verify document",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingEmployeeDoc(false)
    }
  }

  // Handle Delete Employee Document
  const handleDeleteEmployeeDoc = async () => {
    if (!selectedEmployeeDoc) return

    try {
      setIsDeletingEmployeeDoc(true)
      
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
      if (!token) {
        throw new Error("No authentication token found. Please login again.")
      }

      const response = await fetch(getApiUrl(`employee_documents/${selectedEmployeeDoc.id}.json`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Request failed" }))
        throw new Error(errorData.error || errorData.message || "Failed to delete employee document")
      }

      toast({
        title: "Success",
        description: "Employee document deleted successfully",
      })

      setShowEmployeeDocDeleteDialog(false)
      setSelectedEmployeeDoc(null)
      fetchEmployeeDocuments()
    } catch (error: any) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to delete employee document",
        variant: "destructive",
      })
    } finally {
      setIsDeletingEmployeeDoc(false)
    }
  }

  // Handle Create New Policy
  const handleCreateNew = () => {
    setCreateFormData({
      title: "",
      category: "",
      version: "",
      expiryDate: "",
      status: "active",
      requiresSignature: false
    })
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setShowCreateDialog(true)
  }

  // Handle File Upload for Create
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        })
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        })
        return
      }

      setUploadedFile(file)
    }
  }

  // Handle Save Create
  const handleSaveCreate = async () => {
    if (!uploadedFile) {
      toast({
        title: "Error",
        description: "Please upload a document file",
        variant: "destructive",
      })
      return
    }

    if (!createFormData.title || !createFormData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)

      // First, upload the file
      const formData = new FormData()
      formData.append('file', uploadedFile)
      
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
      const uploadResponse = await fetch(getApiUrl("uploads"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("File upload failed")
      }

      const uploadData = await uploadResponse.json()

      // Then create the policy document
      // Convert camelCase to snake_case for backend
      if (!token) {
        throw new Error("No authentication token found. Please login again.")
      }

      const response = await fetch(getApiUrl("policy_documents.json"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          policy_document: {
            title: createFormData.title,
            category: createFormData.category,
            version: createFormData.version,
            expiry_date: createFormData.expiryDate || null,
            status: createFormData.status,
            requires_signature: createFormData.requiresSignature,
            file_path: uploadData.path || uploadData.url,
            file_size: uploadData.size || uploadedFile.size,
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Request failed" }))
        throw new Error(errorData.error || errorData.message || "Failed to create policy document")
      }

      await response.json()

      toast({
        title: "Success",
        description: "Policy document created successfully",
      })

      setShowCreateDialog(false)
      setUploadedFile(null)
      setCreateFormData({
        title: "",
        category: "",
        version: "",
        expiryDate: "",
        status: "active",
        requiresSignature: false
      })
      fetchPolicyDocuments()
      refreshSignatureData()
    } catch (error: any) {
      console.error("Error creating document:", error)
      const errorMessage = error?.message || error?.error || "Failed to create policy document"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Filter policy documents
  const filteredDocuments = policyDocuments.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Filter employee documents
  const filteredEmployeeDocuments = employeeDocuments.filter((doc) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      !searchTerm || 
      (doc.employee_name?.toLowerCase().includes(searchLower) ||
       doc.name?.toLowerCase().includes(searchLower) ||
       doc.document_type?.toLowerCase().includes(searchLower))
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    return matchesSearch && matchesStatus
  })


  // Upload file to server
  const uploadFileToServer = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
    if (!token) {
      throw new Error("No authentication token found")
    }
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    }
    
    try {
      const response = await fetch(getApiUrl("uploads"), {
        method: 'POST',
        headers,
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
      
      const result = await response.json()
      return result.url || result.path
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  // Handle file selection for employee document upload
  const handleEmployeeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only PDF, Word, and images are allowed.`)
        return
      }
      
      if (file.size > maxSize) {
        errors.push(`${file.name}: File size too large. Maximum size is 5MB.`)
        return
      }
      
      validFiles.push(file)
    })

    if (errors.length > 0) {
      toast({
        title: "Error",
        description: errors.join('\n'),
        variant: "destructive",
      })
    }

    if (validFiles.length > 0) {
      setUploadFiles(prev => [...prev, ...validFiles])
    }
  }

  const handleRemoveUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Handle upload document for employee
  const handleUploadDocument = () => {
    setUploadFormData({
      employeeId: "",
      documentType: "id_proof",
      name: "",
      expiryDate: "",
    })
    setUploadFiles([])
    setShowUploadDialog(true)
  }

  const handleConfirmUpload = async () => {
    if (!uploadFormData.employeeId || !uploadFormData.name || uploadFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select at least one file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    
    try {
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Upload all files and create documents
      for (const file of uploadFiles) {
        const filePath = await uploadFileToServer(file)
        
        // Create employee document
        const response = await fetch(getApiUrl("employee_documents.json"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            employee_document: {
              employee_id: parseInt(uploadFormData.employeeId),
              name: uploadFormData.name,
              document_type: uploadFormData.documentType,
              upload_date: new Date().toISOString().split('T')[0],
              expiry_date: uploadFormData.expiryDate || null,
              status: "pending_review",
              file_size: file.size.toString(),
              uploaded_by: "System",
              file_path: filePath,
            }
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Request failed" }))
          throw new Error(errorData.error || errorData.message || "Failed to create employee document")
        }
      }

      toast({
        title: "Success",
        description: `Successfully uploaded ${uploadFiles.length} document(s)`,
      })

      setShowUploadDialog(false)
      setUploadFiles([])
      setUploadFormData({
        employeeId: "",
        documentType: "id_proof",
        name: "",
        expiryDate: "",
      })
      if (employeeFileInputRef.current) {
        employeeFileInputRef.current.value = ''
      }
      
      fetchEmployeeDocuments()
    } catch (error: any) {
      console.error("Error uploading document:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Helper function to parse dates from backend (handles dd/mm/yyyy format)
  const parseDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString || dateString === 'N/A' || dateString === 'No expiry') {
      return null
    }
    
    // Try parsing as ISO8601 first (for employee documents)
    const isoDate = new Date(dateString)
    if (!isNaN(isoDate.getTime())) {
      return isoDate
    }
    
    // Try parsing as dd/mm/yyyy format (for policy documents)
    const ddmmyyyyMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch
      const parsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      if (!isNaN(parsed.getTime())) {
        return parsed
      }
    }
    
    return null
  }

  const formatDate = (dateString: string | null | undefined): string => {
    const date = parseDate(dateString)
    if (!date) {
      return dateString === 'No expiry' ? 'No expiry' : 'N/A'
    }
    return date.toLocaleDateString()
  }

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
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage policy documents, employee files, and digital signatures</p>
        </div>
        {canEditPolicyDocuments && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleUploadDocument} className="w-full sm:w-auto">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
            <Button onClick={handleCreateNew} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Policy
            </Button>
          </div>
        )}
      </div>

      {/* Pending signature banner for current employee */}
      {pendingSignatures.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-orange-100 p-2">
                  <Signature className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    You have {pendingSignatures.length} document{pendingSignatures.length > 1 ? "s" : ""} awaiting your signature
                  </p>
                  <p className="text-sm text-gray-600">
                    Review and sign required policy documents to stay compliant
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {pendingSignatures.slice(0, 3).map((sig) => (
                  <Button key={sig.id} size="sm" onClick={() => handleOpenSignDialog(sig)}>
                    Sign: {sig.documentTitle.length > 24 ? `${sig.documentTitle.slice(0, 24)}…` : sig.documentTitle}
                  </Button>
                ))}
                {pendingSignatures.length > 3 && (
                  <Button size="sm" variant="outline" onClick={() => {
                    const tab = document.querySelector('[value="signatures"]') as HTMLButtonElement
                    tab?.click()
                  }}>
                    View all ({pendingSignatures.length})
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documentStats.totalDocs}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Signatures</p>
                <p className="text-2xl font-bold text-gray-900">{signatureStats.pending}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Signature className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{documentStats.expiringSoon}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signed</p>
                <p className="text-2xl font-bold text-gray-900">{signatureStats.signed}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList className="hrms-tabs-scroll">
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
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search policies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48">
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
              <div className="hidden md:block overflow-x-auto">
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">Loading documents...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No policy documents found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc) => (
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
                        <TableCell>{doc.version || "N/A"}</TableCell>
                        <TableCell>{formatDate(doc.lastUpdated)}</TableCell>
                        <TableCell>{formatDate(doc.expiryDate)}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell>{doc.downloads || 0}</TableCell>
                        <TableCell>
                          {doc.requiresSignature ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">
                                {doc.signedBy ?? 0}/{doc.signaturesTotal ?? 0}
                                {(doc.signaturesPending ?? 0) > 0 && (
                                  <span className="text-orange-600 ml-1">({doc.signaturesPending} pending)</span>
                                )}
                              </span>
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
                              <DropdownMenuItem onClick={() => handleView(doc)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              {canEditPolicyDocuments && doc.requiresSignature && (
                                <DropdownMenuItem
                                  onClick={() => handleRequestSignatures(doc)}
                                  disabled={isRequestingSignatures}
                                >
                                  <Signature className="mr-2 h-4 w-4" />
                                  Request Signatures
                                </DropdownMenuItem>
                              )}
                              {canEditPolicyDocuments && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEdit(doc)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedDocument(doc)
                                      setShowDeleteDialog(true)
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>

              <div className="md:hidden space-y-3">
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Loading documents...</p>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No policy documents found</p>
                ) : (
                  filteredDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4 space-y-3 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {getFileIcon(doc.type)}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                            <p className="text-sm text-gray-500">{doc.category} · {doc.size}</p>
                          </div>
                        </div>
                        {getStatusBadge(doc.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Version</span>
                          <p className="font-medium">{doc.version || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Expiry</span>
                          <p className="font-medium">{formatDate(doc.expiryDate)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Updated</span>
                          <p className="font-medium">{formatDate(doc.lastUpdated)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Downloads</span>
                          <p className="font-medium">{doc.downloads || 0}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            <MoreHorizontal className="w-4 h-4 mr-2" />
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleView(doc)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(doc)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          {canEditPolicyDocuments && (
                            <>
                              <DropdownMenuItem onClick={() => handleEdit(doc)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedDocument(doc)
                                  setShowDeleteDialog(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
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
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="hidden md:block overflow-x-auto">
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
                  {isLoadingEmployeeDocs ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">Loading documents...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredEmployeeDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No employee documents found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployeeDocuments.map((doc) => {
                      const employeeInitials = doc.employee_name 
                        ? doc.employee_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                        : 'EE'
                      const fileExt = doc.file_path?.split('.').pop()?.toLowerCase() || 'pdf'
                      const fileType = fileExt === 'pdf' ? 'pdf' : fileExt.match(/jpg|jpeg|png|gif/) ? 'image' : 'doc'
                      
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                {employeeInitials}
                              </div>
                              <span className="font-medium text-gray-900">{doc.employee_name || `Employee ${doc.employee_id}`}</span>
                            </div>
                          </TableCell>
                          <TableCell>{doc.document_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getFileIcon(fileType)}
                              <span>{doc.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(doc.upload_date)}</TableCell>
                          <TableCell>{doc.expiry_date ? formatDate(doc.expiry_date) : 'No expiry'}</TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell>
                            {doc.uploaded_by ? (
                              <div>
                                <p className="text-sm font-medium">{doc.uploaded_by}</p>
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
                            <DropdownMenuItem onClick={() => handleViewEmployeeDoc(doc)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadEmployeeDoc(doc)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            {doc.status !== "active" && (
                              <DropdownMenuItem 
                                onClick={() => handleVerifyEmployeeDoc(doc)}
                                disabled={isVerifyingEmployeeDoc}
                              >
                                {isVerifyingEmployeeDoc ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                Verify
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setSelectedEmployeeDoc(doc)
                                setShowEmployeeDocDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
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

              <div className="md:hidden space-y-3">
                {isLoadingEmployeeDocs ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Loading documents...</p>
                  </div>
                ) : filteredEmployeeDocuments.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No employee documents found</p>
                ) : (
                  filteredEmployeeDocuments.map((doc) => {
                    const fileExt = doc.file_path?.split('.').pop()?.toLowerCase() || 'pdf'
                    const fileType = fileExt === 'pdf' ? 'pdf' : fileExt.match(/jpg|jpeg|png|gif/) ? 'image' : 'doc'
                    return (
                      <div key={doc.id} className="border rounded-lg p-4 space-y-3 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{doc.employee_name || `Employee ${doc.employee_id}`}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getFileIcon(fileType)}
                              <p className="text-sm text-gray-600 truncate">{doc.name}</p>
                            </div>
                          </div>
                          {getStatusBadge(doc.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Type</span>
                            <p className="font-medium">{doc.document_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Uploaded</span>
                            <p className="font-medium">{formatDate(doc.upload_date)}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Expiry</span>
                            <p className="font-medium">{doc.expiry_date ? formatDate(doc.expiry_date) : 'No expiry'}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <MoreHorizontal className="w-4 h-4 mr-2" />
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewEmployeeDoc(doc)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadEmployeeDoc(doc)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })
                )}
              </div>
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
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {canEditPolicyDocuments && (
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={handleSendReminders}
                      disabled={isSendingReminders || signatureStats.pending === 0}
                    >
                      {isSendingReminders ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Bell className="w-4 h-4 mr-2" />
                      )}
                      Send Reminders
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="hidden md:block overflow-x-auto">
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
                  {isLoadingSignatures ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">Loading signatures...</p>
                      </TableCell>
                    </TableRow>
                  ) : digitalSignatures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No digital signatures found
                      </TableCell>
                    </TableRow>
                  ) : (
                  digitalSignatures.map((sig) => (
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
                        {sig.signedDate ? formatDate(sig.signedDate) : 'Pending'}
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
                            {sig.status === "pending" && user?.employee_id === sig.employeeId && (
                              <DropdownMenuItem onClick={() => handleOpenSignDialog(sig)}>
                                <Signature className="mr-2 h-4 w-4" />
                                Sign Document
                              </DropdownMenuItem>
                            )}
                            {sig.hasSignatureImage && (
                              <>
                                <DropdownMenuItem onClick={() => handleViewSignature(sig)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Signature
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadSignature(sig)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                              </>
                            )}
                            {canEditPolicyDocuments && sig.status === "pending" && (
                              <DropdownMenuItem onClick={handleSendReminders} disabled={isSendingReminders}>
                                <Bell className="mr-2 h-4 w-4" />
                                Send Reminder
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
              </div>

              <div className="md:hidden space-y-3">
                {isLoadingSignatures ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Loading signatures...</p>
                  </div>
                ) : digitalSignatures.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No digital signatures found</p>
                ) : (
                  digitalSignatures.map((sig) => (
                    <div key={sig.id} className="border rounded-lg p-4 space-y-3 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{sig.documentTitle}</p>
                          <p className="text-sm text-gray-600 truncate">{sig.employeeName}</p>
                        </div>
                        {getStatusBadge(sig.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Signed</span>
                          <p className="font-medium">{sig.signedDate ? formatDate(sig.signedDate) : 'Pending'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Type</span>
                          <p className="font-medium">{sig.signatureType === 'electronic' ? 'Electronic' : 'Pending'}</p>
                        </div>
                      </div>
                      {sig.status === "pending" && user?.employee_id === sig.employeeId && (
                        <Button size="sm" className="w-full" onClick={() => handleOpenSignDialog(sig)}>
                          <Signature className="w-4 h-4 mr-2" />
                          Sign Document
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
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
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Clock className="w-4 h-4 mr-2" />
                    View All Alerts
                  </Button>
                  <Button className="w-full sm:w-auto">
                    <Bell className="w-4 h-4 mr-2" />
                    Configure Alerts
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="hidden md:block overflow-x-auto">
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
                      <TableCell>{formatDate(alert.expiryDate)}</TableCell>
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
              </div>

              <div className="md:hidden space-y-3">
                {isLoadingExpiryAlerts ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Loading alerts...</p>
                  </div>
                ) : expiryAlerts.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No expiry alerts</p>
                ) : (
                  expiryAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`border rounded-lg p-4 space-y-3 bg-white ${alert.priority === 'high' ? 'bg-red-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{alert.documentTitle}</p>
                          <p className="text-sm text-gray-600">{alert.documentType}</p>
                        </div>
                        {getPriorityBadge(alert.priority)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Expiry</span>
                          <p className="font-medium">{formatDate(alert.expiryDate)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Days left</span>
                          <p className={`font-medium ${(alert.daysUntilExpiry ?? 999) <= 30 ? 'text-red-600' : ''}`}>
                            {alert.daysUntilExpiry ?? 0} days
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Assigned to</span>
                          <p className="font-medium truncate">{alert.assignedTo}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status</span>
                          <div className="mt-0.5">{getStatusBadge(alert.status)}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Document Dialog */}
      {selectedDocument && (
        <DocumentPreview
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          documentUrl={selectedDocument.filePath ? getDocumentUrl(selectedDocument.filePath) : ""}
          documentName={selectedDocument.title}
          documentType={selectedDocument.type}
        />
      )}

      {/* Create New Policy Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Policy Document</DialogTitle>
            <DialogDescription>
              Upload and create a new policy document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Title *</Label>
              <Input
                id="create-title"
                value={createFormData.title}
                onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                placeholder="Document title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-category">Category *</Label>
              <Select
                value={createFormData.category}
                onValueChange={(value) => setCreateFormData({ ...createFormData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR Policies">HR Policies</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-version">Version</Label>
                <Input
                  id="create-version"
                  value={createFormData.version}
                  onChange={(e) => setCreateFormData({ ...createFormData, version: e.target.value })}
                  placeholder="e.g., v1.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-expiryDate">Expiry Date</Label>
                <DatePicker
                  value={createFormData.expiryDate}
                  onChange={(v) => setCreateFormData({ ...createFormData, expiryDate: v })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-status">Status</Label>
              <Select
                value={createFormData.status}
                onValueChange={(value) => setCreateFormData({ ...createFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="create-requiresSignature"
                checked={createFormData.requiresSignature}
                onChange={(e) => setCreateFormData({ ...createFormData, requiresSignature: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="create-requiresSignature">Requires Signature</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-file">Document File *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {uploadedFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUploadedFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PDF, DOC, DOCX files only (Max 5MB)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCreate} disabled={isCreating || !uploadedFile}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Policy"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Policy Document</DialogTitle>
            <DialogDescription>
              Update the policy document details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder="Document title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={editFormData.category}
                onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR Policies">HR Policies</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={editFormData.version}
                  onChange={(e) => setEditFormData({ ...editFormData, version: e.target.value })}
                  placeholder="e.g., v1.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <DatePicker
                  value={editFormData.expiryDate}
                  onChange={(v) => setEditFormData({ ...editFormData, expiryDate: v })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requiresSignature"
                checked={editFormData.requiresSignature}
                onChange={(e) => setEditFormData({ ...editFormData, requiresSignature: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="requiresSignature">Requires Signature</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Employee Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Employee Document</DialogTitle>
            <DialogDescription>
              Upload documents for an employee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="upload-employee">Employee *</Label>
              <Select
                value={uploadFormData.employeeId}
                onValueChange={(value) => setUploadFormData({ ...uploadFormData, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.first_name} {emp.last_name} {emp.employee_id ? `(${emp.employee_id})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-name">Document Name *</Label>
              <Input
                id="upload-name"
                value={uploadFormData.name}
                onChange={(e) => setUploadFormData({ ...uploadFormData, name: e.target.value })}
                placeholder="e.g., Aadhaar Card, PAN Card"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-type">Document Type *</Label>
              <Select
                value={uploadFormData.documentType}
                onValueChange={(value) => setUploadFormData({ ...uploadFormData, documentType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id_proof">ID Proof</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="resume">Resume</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-expiry">Expiry Date (Optional)</Label>
              <DatePicker
                value={uploadFormData.expiryDate}
                onChange={(v) => setUploadFormData({ ...uploadFormData, expiryDate: v })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-files">Document Files *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {uploadFiles.length > 0 ? (
                  <div className="space-y-2">
                    {uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveUploadFile(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PDF, DOC, DOCX, Images (Max 5MB each)
                    </p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => employeeFileInputRef.current?.click()}
                >
                  Choose Files
                </Button>
                <input
                  ref={employeeFileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  className="hidden"
                  onChange={handleEmployeeFileSelect}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUploadDialog(false)
              setUploadFiles([])
              setUploadFormData({
                employeeId: "",
                documentType: "id_proof",
                name: "",
                expiryDate: "",
              })
            }}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpload} disabled={isUploading || uploadFiles.length === 0}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Employee Document Dialog */}
      {selectedEmployeeDoc && selectedEmployeeDoc.file_path && (() => {
        const fileExt = selectedEmployeeDoc.file_path?.split('.').pop()?.toLowerCase() || 'pdf'
        const fileType = fileExt === 'pdf' ? 'pdf' : fileExt.match(/jpg|jpeg|png|gif/) ? 'image' : 'doc'
        const documentUrl = getDocumentUrl(selectedEmployeeDoc.file_path)
        return (
          <DocumentPreview
            open={showEmployeeDocViewDialog}
            onOpenChange={setShowEmployeeDocViewDialog}
            documentUrl={documentUrl}
            documentName={selectedEmployeeDoc.name}
            documentType={fileType}
          />
        )
      })()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the policy document
              "{selectedDocument?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Employee Document Confirmation Dialog */}
      <AlertDialog open={showEmployeeDocDeleteDialog} onOpenChange={setShowEmployeeDocDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee document
              "{selectedEmployeeDoc?.name}" for {selectedEmployeeDoc?.employee_name || `Employee ${selectedEmployeeDoc?.employee_id}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingEmployeeDoc}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployeeDoc}
              disabled={isDeletingEmployeeDoc}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingEmployeeDoc ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DocumentSignDialog
        open={signDialogOpen}
        onOpenChange={setSignDialogOpen}
        signature={signatureToSign}
        onSigned={refreshSignatureData}
      />

      {/* View Signature Dialog */}
      <Dialog open={viewSignatureOpen} onOpenChange={setViewSignatureOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Signature — {selectedSignature?.employeeName}</DialogTitle>
            <DialogDescription>
              {selectedSignature?.documentTitle}
              {selectedSignature?.signedDate && (
                <> · Signed {formatDate(selectedSignature.signedDate)}</>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedSignature?.signatureImage ? (
            <div className="rounded-lg border bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedSignature.signatureImage}
                alt={`Signature of ${selectedSignature.employeeName}`}
                className="mx-auto max-h-40 w-full object-contain"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">No signature image available.</p>
          )}
          {selectedSignature?.deviceInfo && (
            <p className="text-xs text-gray-500">
              Signed from {selectedSignature.deviceInfo}
              {selectedSignature.ipAddress && ` · IP ${selectedSignature.ipAddress}`}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewSignatureOpen(false)}>
              Close
            </Button>
            {selectedSignature?.signatureImage && (
              <Button onClick={() => handleDownloadSignature(selectedSignature)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 