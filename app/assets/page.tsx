"use client"

import React, { useState, useEffect } from "react"
import { getApiUrl, getEndpointUrl, apiRequest } from "@/lib/api"
import { useAuth } from "@/lib/auth/auth.hooks"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
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
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  Calendar,
  MapPin,
  User,
  Building,
  Laptop,
  Monitor,
  Smartphone,
  Printer,
  Server,
  Network,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  TrendingUp,
  Package,
  Settings,
  Wrench,
  History,
  FileText,
  UserMinus,
} from "lucide-react"

interface Asset {
  id: string
  name: string
  assetType: string
  assetTag?: string
  scanPayload?: string
  serialNumber: string
  model: string
  brand: string
  purchaseDate: string
  warrantyExpiry: string
  purchaseCost: number
  currentValue: number
  status: "available" | "assigned" | "maintenance" | "retired" | "lost"
  location: string
  assignedTo?: {
    id: string
    name: string
    email: string
    department: string
  }
  department: string
  notes: string
  lastMaintenance?: string
  nextMaintenance?: string
  condition: "excellent" | "good" | "fair" | "poor"
  maintenanceHistory: MaintenanceRecord[]
  label?: {
    asset_tag?: string
    scan_payload?: string
    qr_code_url?: string
    barcode_url?: string
  }
  qrCodeDataUrl?: string
  barcodeDataUrl?: string
}

interface MaintenanceRecord {
  id: string
  date: string
  type: string
  description: string
  cost: number
  performedBy: string
  nextMaintenance?: string
}

interface AssetAllocation {
  id: string
  assetId: string
  employeeId: string
  employeeName: string
  assignedDate: string
  returnDate?: string
  notes: string
  status: "active" | "returned"
}

export default function AssetsPage() {
  const { checkPermission } = useAuth()

  // Permission checks for assets and allocations/reporting
  const canViewAssets = checkPermission("assets.index")
  const canCreateAssets = checkPermission("assets.create")
  const canUpdateAssets = checkPermission("assets.update")
  const canViewAllocations = checkPermission("asset_allocations.index")
  const canCreateAllocations = checkPermission("asset_allocations.create")
  const canViewReports = checkPermission("reports.index")
  const canExportReports = checkPermission("reports.export")

  const [assets, setAssets] = useState<Asset[]>([])
  const [allocations, setAllocations] = useState<AssetAllocation[]>([])
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [showAllocateAsset, setShowAllocateAsset] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const [assetStats, setAssetStats] = useState([
    {
      title: "Total Assets",
      value: "0",
      change: "Loading...",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Assigned Assets",
      value: "0",
      change: "Loading...",
      icon: User,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Available Assets",
      value: "0",
      change: "Loading...",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Under Maintenance",
      value: "0",
      change: "Loading...",
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ])
  const [assetTypes, setAssetTypes] = useState<Array<{ type: string; label: string; icon: any; count: number; color: string }>>([])
  const [statsData, setStatsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    assetType: "",
    serialNumber: "",
    brand: "",
    model: "",
    purchaseCost: "",
    purchaseDate: "",
    warrantyExpiry: "",
    location: "",
    department: "",
    condition: "good",
    notes: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; department?: string }>>([])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [showEditAsset, setShowEditAsset] = useState(false)
  const [allocatingAsset, setAllocatingAsset] = useState<Asset | null>(null)
  const [maintenanceAsset, setMaintenanceAsset] = useState<Asset | null>(null)
  const [retiringAsset, setRetiringAsset] = useState<Asset | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [allocationForm, setAllocationForm] = useState({
    employeeId: "",
    assignedDate: new Date().toISOString().split("T")[0],
    notes: ""
  })
  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenanceType: "routine",
    scheduledDate: new Date().toISOString().split("T")[0],
    notes: ""
  })

  // Transform backend data from snake_case to camelCase
  const transformAsset = (asset: any): Asset => {
    if (!asset || typeof asset !== 'object') {
      console.error('Invalid asset data:', asset)
      return {
        id: "",
        name: "",
        assetType: "",
        serialNumber: "",
        model: "",
        brand: "",
        purchaseDate: "",
        warrantyExpiry: "",
        purchaseCost: 0,
        currentValue: 0,
        status: "available",
        location: "",
        department: "",
        notes: "",
        condition: "good",
        maintenanceHistory: []
      }
    }
    
    return {
      id: asset.id?.toString() || "",
      name: asset.name || "",
      assetType: asset.asset_type || asset.assetType || "",
      assetTag: asset.asset_tag || asset.assetTag || "",
      scanPayload: asset.scan_payload || asset.scanPayload || "",
      serialNumber: asset.serial_number || asset.serialNumber || "",
      model: asset.model || "",
      brand: asset.brand || "",
      purchaseDate: asset.purchase_date || asset.purchaseDate || "",
      warrantyExpiry: asset.warranty_expiry || asset.warrantyExpiry || "",
      purchaseCost: parseFloat(asset.purchase_cost || asset.purchaseCost || 0) || 0,
      currentValue: parseFloat(asset.current_value || asset.currentValue || 0) || 0,
      status: asset.status || "available",
      location: asset.location || "",
      department: asset.department || "",
      notes: asset.notes || "",
      lastMaintenance: asset.last_maintenance || asset.lastMaintenance || "",
      nextMaintenance: asset.next_maintenance || asset.nextMaintenance || "",
      condition: asset.condition || "good",
      assignedTo: asset.assigned_to ? {
        id: asset.assigned_to.id?.toString() || "",
        name: asset.assigned_to.name || "",
        email: asset.assigned_to.email || "",
        department: asset.assigned_to.department || ""
      } : undefined,
      label: asset.label,
      maintenanceHistory: Array.isArray(asset.maintenance_history || asset.maintenanceHistory) 
        ? (asset.maintenance_history || asset.maintenanceHistory) 
        : []
    }
  }

  // Transform maintenance record
  const transformMaintenanceRecord = (record: any) => {
    if (!record || typeof record !== 'object') {
      console.error('Invalid maintenance record:', record)
      return {
        id: "",
        date: "",
        type: "",
        description: "",
        cost: 0,
        performedBy: "",
        nextMaintenance: "",
        assetId: "",
        asset_id: "",
        overdue: false,
        dueSoon: false
      }
    }
    
    return {
      id: record.id?.toString() || "",
      date: record.maintenance_date || record.date || "",
      type: record.maintenance_type || record.type || "",
      description: record.description || "",
      cost: parseFloat(record.cost || 0) || 0,
      performedBy: record.performed_by || record.performedBy || "",
      nextMaintenance: record.next_maintenance || record.nextMaintenance || "",
      assetId: record.asset_id?.toString() || record.assetId?.toString() || "",
      asset_id: record.asset_id?.toString() || record.assetId?.toString() || "",
      overdue: record.overdue || false,
      dueSoon: record.due_soon || record.dueSoon || false
    }
  }

  // Transform allocation
  const transformAllocation = (allocation: any): AssetAllocation => {
    if (!allocation || typeof allocation !== 'object') {
      console.error('Invalid allocation data:', allocation)
      return {
        id: "",
        assetId: "",
        employeeId: "",
        employeeName: "",
        assignedDate: "",
        notes: "",
        status: "active"
      }
    }
    
    return {
      id: allocation.id?.toString() || "",
      assetId: allocation.asset_id?.toString() || allocation.assetId?.toString() || "",
      employeeId: allocation.employee_id?.toString() || allocation.employeeId?.toString() || "",
      employeeName: allocation.employee_name || allocation.employeeName || "",
      assignedDate: allocation.assigned_date || allocation.assignedDate || "",
      returnDate: allocation.return_date || allocation.returnDate,
      notes: allocation.notes || "",
      status: allocation.status || "active"
    }
  }

  // Get asset type label
  const getAssetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      laptop: "Laptops",
      desktop: "Desktops",
      mobile: "Mobile Devices",
      printer: "Printers",
      server: "Servers",
      network: "Network Equipment",
      other: "Other"
    }
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }

  // Get asset type color
  const getAssetTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      laptop: "bg-blue-100 text-blue-800",
      desktop: "bg-green-100 text-green-800",
      mobile: "bg-purple-100 text-purple-800",
      printer: "bg-orange-100 text-orange-800",
      server: "bg-red-100 text-red-800",
      network: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800"
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      setEmployeesLoading(true)
      try {
        const assetsUrl = getApiUrl('api/assets')
        const statsUrl = getApiUrl('api/assets/stats')

        const [
          assetsData,
          statsResponse,
          allocationsResult,
          maintenanceResult,
          employeesResponse,
        ] = await Promise.all([
          apiRequest<any>(assetsUrl),
          apiRequest<any>(statsUrl),
          apiRequest<{ allocations: any[] }>(getApiUrl('api/assets/allocations')).catch(() => ({ allocations: [] })),
          apiRequest<{ maintenance_records: any[] }>(getApiUrl('maintenance_records')).catch(() => ({ maintenance_records: [] })),
          apiRequest<any>(`${getApiUrl('employees')}?page=1&per_page=1000`).catch(() => ({ data: [] })),
        ])

        const assetsArray = Array.isArray(assetsData)
          ? assetsData
          : (assetsData?.assets || assetsData?.data || [])

        if (!Array.isArray(assetsArray)) {
          console.error('Assets data is not an array:', assetsArray)
          setAssets([])
        } else {
          setAssets(assetsArray.map(transformAsset))
        }

        setStatsData(statsResponse)

        const overview = statsResponse?.overview || {}
        const distribution = statsResponse?.distribution || {}

        setAssetStats([
          {
            title: "Total Assets",
            value: (overview.total_assets ?? 0).toString(),
            change: `${overview.utilization_rate ?? 0}% utilization`,
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
          },
          {
            title: "Assigned Assets",
            value: (overview.assigned_assets ?? 0).toString(),
            change: `${overview.utilization_rate ?? 0}% utilization`,
            icon: User,
            color: "text-green-600",
            bgColor: "bg-green-50",
          },
          {
            title: "Available Assets",
            value: (overview.available_assets ?? 0).toString(),
            change: "Ready for allocation",
            icon: CheckCircle,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
          },
          {
            title: "Under Maintenance",
            value: (overview.maintenance_assets ?? 0).toString(),
            change: "Requires attention",
            icon: Wrench,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
          },
        ])

        const typeDistribution = distribution.asset_types || {}
        const typeLabels: Record<string, any> = {
          laptop: Laptop,
          desktop: Monitor,
          mobile: Smartphone,
          printer: Printer,
          server: Server,
          network: Network,
          other: Package
        }
        const dynamicAssetTypes = Object.entries(typeDistribution)
          .filter(([type, count]) => type && count !== undefined && count !== null)
          .map(([type, count]) => ({
            type: String(type),
            label: getAssetTypeLabel(String(type)),
            icon: typeLabels[String(type)] || Package,
            count: Number(count) || 0,
            color: getAssetTypeColor(String(type))
          }))
        setAssetTypes(dynamicAssetTypes)

        const transformedAllocations = allocationsResult.allocations?.map(transformAllocation) || []
        setAllocations(transformedAllocations)

        const records = maintenanceResult.maintenance_records || []
        setMaintenanceRecords(records.map(transformMaintenanceRecord))

        const employeesArray = Array.isArray(employeesResponse)
          ? employeesResponse
          : Array.isArray(employeesResponse?.data)
            ? employeesResponse.data
            : []
        const formatted = employeesArray.map((emp: any) => ({
          id: emp.id?.toString() || "",
          name: [emp.first_name, emp.last_name].filter(Boolean).join(" "),
          department: emp.department?.name || emp.department || ""
        })).filter((emp: any) => emp.id)
        setEmployees(formatted)
      } catch (error: any) {
        console.error('Error fetching asset data:', error)
        setAssets([])
        setAllocations([])
        setMaintenanceRecords([])
        setAssetTypes([])
        setEmployees([])
      } finally {
        setLoading(false)
        setEmployeesLoading(false)
      }
    }

    fetchAllData()
  }, [])

  const refreshMaintenanceRecords = async () => {
    try {
      const maintenanceData = await apiRequest<{ maintenance_records: any[] }>(getApiUrl('maintenance_records'))
      const records = maintenanceData.maintenance_records || []
      setMaintenanceRecords(records.map(transformMaintenanceRecord))
    } catch (error) {
      console.error('Error fetching maintenance records:', error)
      setMaintenanceRecords([])
    }
  }

  const refreshAssets = async () => {
    try {
      const assetsData = await apiRequest<any>(getApiUrl('api/assets'))
      const assetsArray = Array.isArray(assetsData) ? assetsData : (assetsData?.assets || assetsData?.data || [])
      if (Array.isArray(assetsArray)) {
        setAssets(assetsArray.map(transformAsset))
      }
      const allocationsData = await apiRequest<{ allocations: any[] }>(getApiUrl('api/assets/allocations'))
      setAllocations(allocationsData.allocations?.map(transformAllocation) || [])
      await refreshMaintenanceRecords()
    } catch (error) {
      console.error('Error refreshing assets data:', error)
    }
  }

  // Handle asset selection - fetch details if needed
  const handleViewAsset = async (asset: Asset) => {
    try {
      const data = await apiRequest<any>(getApiUrl(`api/assets/${asset.id}`))
      const transformedAsset = transformAsset(data.asset)
      transformedAsset.maintenanceHistory = data.maintenance_history?.map(transformMaintenanceRecord) || []
      try {
        const labelData = await apiRequest<any>(getApiUrl(`api/assets/${asset.id}/label`))
        transformedAsset.qrCodeDataUrl = labelData.qr_code_data_url
        transformedAsset.barcodeDataUrl = labelData.barcode_data_url
        transformedAsset.label = labelData.label || transformedAsset.label
      } catch {
        // Label images are optional
      }
      setSelectedAsset(transformedAsset)
    } catch (error) {
      console.error('Error fetching asset details:', error)
      setSelectedAsset(asset)
    }
  }

  const printAssetLabel = () => {
    if (!selectedAsset?.qrCodeDataUrl || !selectedAsset?.barcodeDataUrl) return
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=480,height=720")
    if (!printWindow) return
    printWindow.document.write(`
      <html><head><title>Asset Label - ${selectedAsset.name}</title>
      <style>
        body { font-family: sans-serif; padding: 24px; text-align: center; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        p { margin: 4px 0; color: #444; font-size: 13px; }
        img { max-width: 220px; margin: 12px auto; display: block; }
        .barcode { max-width: 320px; }
      </style></head><body>
      <h1>${selectedAsset.name}</h1>
      <p>Tag: ${selectedAsset.assetTag || selectedAsset.label?.asset_tag || "—"}</p>
      <p>Serial: ${selectedAsset.serialNumber}</p>
      <img src="${selectedAsset.qrCodeDataUrl}" alt="Asset QR code" />
      <img class="barcode" src="${selectedAsset.barcodeDataUrl}" alt="Asset barcode" />
      <p>${selectedAsset.scanPayload || selectedAsset.label?.scan_payload || ""}</p>
      <script>window.onload = () => { window.print(); }</script>
      </body></html>
    `)
    printWindow.document.close()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
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
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "bg-green-100 text-green-800"
      case "good":
        return "bg-blue-100 text-blue-800"
      case "fair":
        return "bg-yellow-100 text-yellow-800"
      case "poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case "laptop":
        return Laptop
      case "desktop":
        return Monitor
      case "mobile":
        return Smartphone
      case "printer":
        return Printer
      case "server":
        return Server
      case "network":
        return Network
      default:
        return Package
    }
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || asset.assetType === filterType
    const matchesStatus = filterStatus === "all" || asset.status === filterStatus
    const matchesDepartment = filterDepartment === "all" || asset.department === filterDepartment
    return matchesSearch && matchesType && matchesStatus && matchesDepartment
  })

  const totalAssetValue = assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0)
  const assignedAssets = assets.filter(asset => asset.status === "assigned").length
  const maintenanceAssets = assets.filter(asset => asset.status === "maintenance").length
  
  // Calculate average asset age dynamically
  const calculateAverageAssetAge = () => {
    if (assets.length === 0) return 0
    const totalAge = assets.reduce((sum, asset) => {
      if (!asset.purchaseDate) return sum
      const purchaseDate = new Date(asset.purchaseDate)
      const ageInYears = (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      return sum + ageInYears
    }, 0)
    return totalAge / assets.length
  }

  const averageAssetAge = calculateAverageAssetAge()
  const utilizationRate = assets.length > 0 ? (assignedAssets / assets.length) * 100 : 0

  const handleAddAsset = async () => {
    setSubmitting(true)
    try {
      // Validate required fields
      if (!formData.name || !formData.assetType || !formData.serialNumber || 
          !formData.brand || !formData.model || !formData.purchaseCost || 
          !formData.purchaseDate || !formData.location || !formData.department) {
        console.error('Missing required fields')
        return
      }

      const assetPayload = {
        asset: {
          name: formData.name,
          asset_type: formData.assetType,
          serial_number: formData.serialNumber,
          brand: formData.brand,
          model: formData.model,
          purchase_cost: parseFloat(formData.purchaseCost),
          purchase_date: formData.purchaseDate,
          warranty_expiry: formData.warrantyExpiry || null,
          location: formData.location,
          department: formData.department,
          condition: formData.condition,
          status: "available",
          notes: formData.notes,
          current_value: parseFloat(formData.purchaseCost) // Will be calculated by backend
        }
      }

      // Use /api/assets for POST requests
      const url = getApiUrl('api/assets')
      console.log('Creating asset at URL:', url)
      console.log('Payload:', assetPayload)

      // Make the POST request - apiRequest handles headers and auth automatically
      const response = await apiRequest<{ asset: any; message: string }>(
        url,
        {
          method: 'POST',
          body: JSON.stringify(assetPayload)
        }
      )

      console.log('Asset created successfully:', response)

      // Refresh assets list and stats
      await refreshAssets()

      // Reset form
      setFormData({
        name: "",
        assetType: "",
        serialNumber: "",
        brand: "",
        model: "",
        purchaseCost: "",
        purchaseDate: "",
        warrantyExpiry: "",
        location: "",
        department: "",
        condition: "good",
        notes: ""
      })
      setShowAddAsset(false)
    } catch (error) {
      console.error('Error adding asset:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setFormData({
      name: asset.name,
      assetType: asset.assetType,
      serialNumber: asset.serialNumber,
      brand: asset.brand,
      model: asset.model,
      purchaseCost: asset.purchaseCost.toString(),
      purchaseDate: asset.purchaseDate,
      warrantyExpiry: asset.warrantyExpiry || "",
      location: asset.location,
      department: asset.department,
      condition: asset.condition,
      notes: asset.notes
    })
    setShowEditAsset(true)
  }

  const handleUpdateAsset = async () => {
    if (!editingAsset) return
    setActionLoading(true)
    try {
      const payload = {
        asset: {
          name: formData.name,
          asset_type: formData.assetType,
          serial_number: formData.serialNumber,
          brand: formData.brand,
          model: formData.model,
          purchase_cost: parseFloat(formData.purchaseCost),
          purchase_date: formData.purchaseDate,
          warranty_expiry: formData.warrantyExpiry || null,
          location: formData.location,
          department: formData.department,
          condition: formData.condition,
          notes: formData.notes,
          current_value: parseFloat(formData.purchaseCost)
        }
      }
      await apiRequest(getApiUrl(`api/assets/${editingAsset.id}`), {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      await refreshAssets()
      setShowEditAsset(false)
      setEditingAsset(null)
    } catch (error) {
      console.error('Error updating asset:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenAllocate = (asset: Asset) => {
    setAllocatingAsset(asset)
    setShowAllocateAsset(true)
  }

  const handleUnassignAsset = async (asset: Asset) => {
    const activeAllocation = allocations.find(
      (allocation) => allocation.assetId === asset.id && allocation.status === "active"
    )

    if (!activeAllocation) {
      console.warn('No active allocation found for asset', asset.id)
      return
    }

    setActionLoading(true)
    try {
      const payload = {
        return_asset_allocation: {
          return_date: new Date().toISOString().split("T")[0],
          notes: "Unassigned from asset inventory"
        }
      }

      await apiRequest(getApiUrl(`asset_allocations/${activeAllocation.id}/return_asset_allocation`), {
        method: 'PATCH',
        body: JSON.stringify(payload)
      })
      await refreshAssets()
    } catch (error) {
      console.error('Error unassigning asset:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAllocateAsset = async () => {
    if (!allocatingAsset) return
    setActionLoading(true)
    try {
      const payload = {
        asset_allocation: {
          asset_id: allocatingAsset.id,
          employee_id: allocationForm.employeeId,
          assigned_date: allocationForm.assignedDate || new Date().toISOString().split("T")[0],
          notes: allocationForm.notes,
          status: "active"
        }
      }
      await apiRequest(getApiUrl('asset_allocations'), {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      await refreshAssets()
      setShowAllocateAsset(false)
      setAllocatingAsset(null)
      setAllocationForm({
        employeeId: "",
        assignedDate: new Date().toISOString().split("T")[0],
        notes: ""
      })
    } catch (error) {
      console.error('Error allocating asset:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenMaintenance = (asset: Asset) => {
    setMaintenanceAsset(asset)
    setMaintenanceForm({
      maintenanceType: "routine",
      scheduledDate: new Date().toISOString().split("T")[0],
      notes: ""
    })
  }

  const handleScheduleMaintenance = async () => {
    if (!maintenanceAsset) return
    
    // Validate form
    if (!maintenanceForm.scheduledDate) {
      toast({
        title: "Validation Error",
        description: "Please select a scheduled date",
        variant: "destructive",
      })
      return
    }

    if (!maintenanceForm.maintenanceType) {
      toast({
        title: "Validation Error",
        description: "Please select a maintenance type",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)
    try {
      const payload = {
        asset_id: maintenanceAsset.id,
        maintenance_type: maintenanceForm.maintenanceType,
        scheduled_date: maintenanceForm.scheduledDate,
        notes: maintenanceForm.notes
      }
      const response = await apiRequest<any>(getApiUrl('maintenance_records/schedule'), {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      
      toast({
        title: "Success",
        description: response.message || "Maintenance scheduled successfully",
      })
      
      await refreshAssets()
      await refreshMaintenanceRecords()
      
      // Reset form
      setMaintenanceForm({
        maintenanceType: "routine",
        scheduledDate: new Date().toISOString().split("T")[0],
        notes: ""
      })
      setMaintenanceAsset(null)
    } catch (error: any) {
      // Error toast is already shown by apiRequest, but we can add additional handling here
      const errorMessage = error?.message || "Failed to schedule maintenance"
      console.error('Error scheduling maintenance:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRetireAsset = async () => {
    if (!retiringAsset) return
    if (retiringAsset.status === "assigned") return
    setActionLoading(true)
    try {
      // If asset is available, retire it. Otherwise, make it available.
      const newStatus = retiringAsset.status === "available" ? "retired" : "available"
      await apiRequest(getApiUrl(`api/assets/${retiringAsset.id}`), {
        method: 'PUT',
        body: JSON.stringify({ asset: { status: newStatus } })
      })
      await refreshAssets()
      setRetiringAsset(null)
    } catch (error) {
      console.error('Error updating asset status:', error)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600">Track, allocate, and manage all company assets</p>
        </div>
        <div className="hrms-action-row w-full sm:w-auto">
          {(canViewReports || canExportReports) && (
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          {canCreateAssets && (
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          )}
          {canCreateAssets && (
            <Button size="sm" onClick={() => setShowAddAsset(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {assetStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
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

      {/* Asset Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Asset Types
            </CardTitle>
            <CardDescription>Breakdown by asset category</CardDescription>
          </CardHeader>
            <CardContent>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-gray-500">Loading asset types...</p>
              ) : assetTypes.length > 0 ? (
                assetTypes.map((type) => (
                  <div key={type.type} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <type.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-sm text-gray-500">{type.count} assets</p>
                      </div>
                    </div>
                    <Badge variant="outline">{type.count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No asset types found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Asset Value & Utilization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Asset Value & Utilization
            </CardTitle>
            <CardDescription>Financial overview and utilization metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Asset Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{(statsData?.financial?.total_value || totalAssetValue).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                  <div className="flex items-center gap-2">
                    <Progress value={utilizationRate} className="flex-1" />
                    <span className="text-sm font-medium">{Math.round(utilizationRate)}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assets Under Maintenance</p>
                  <p className="text-2xl font-bold text-orange-600">{maintenanceAssets}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Asset Age</p>
                  <p className="text-2xl font-bold text-gray-900">{averageAssetAge.toFixed(1)} years</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="hrms-tabs-scroll lg:w-auto">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          {canViewAllocations && <TabsTrigger value="allocations">Allocations</TabsTrigger>}
          {canViewAssets && <TabsTrigger value="maintenance">Maintenance</TabsTrigger>}
          {(canViewReports || canExportReports) && <TabsTrigger value="reports">Reports</TabsTrigger>}
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Asset Inventory
              </CardTitle>
              <CardDescription>Complete list of all company assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Asset Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="laptop">Laptops</SelectItem>
                    <SelectItem value="desktop">Desktops</SelectItem>
                    <SelectItem value="mobile">Mobile Devices</SelectItem>
                    <SelectItem value="printer">Printers</SelectItem>
                    <SelectItem value="server">Servers</SelectItem>
                    <SelectItem value="network">Network Equipment</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-sm text-gray-500">Loading assets...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredAssets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-sm text-gray-500">No assets found matching your filters</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssets.map((asset) => {
                        const TypeIcon = getAssetTypeIcon(asset.assetType)
                        return (
                          <TableRow key={asset.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <TypeIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{asset.name}</p>
                                  <p className="text-sm text-gray-500">{asset.brand} {asset.model}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {asset.assetType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">{asset.serialNumber}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(asset.status)}>
                                {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {asset.assignedTo ? (
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{asset.assignedTo.name}</p>
                                  <p className="text-xs text-gray-500">{asset.assignedTo.department}</p>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">Not assigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-3 h-3" />
                                <span>{asset.location}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">₹{asset.currentValue.toLocaleString()}</span>
                            </TableCell>
                            <TableCell>
                              {(canViewAssets || canUpdateAssets || canCreateAllocations) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    {canViewAssets && (
                                      <DropdownMenuItem onClick={() => handleViewAsset(asset)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                    )}
                                    {canUpdateAssets && (
                                      <DropdownMenuItem onClick={() => handleOpenEditAsset(asset)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Asset
                                      </DropdownMenuItem>
                                    )}
                                    {canCreateAllocations && (
                                      <>
                                        {asset.assignedTo ? (
                                          <DropdownMenuItem onClick={() => handleUnassignAsset(asset)}>
                                            <UserMinus className="w-4 h-4 mr-2" />
                                            Unassign
                                          </DropdownMenuItem>
                                        ) : (
                                          <DropdownMenuItem onClick={() => handleOpenAllocate(asset)}>
                                            <User className="w-4 h-4 mr-2" />
                                            Allocate
                                          </DropdownMenuItem>
                                        )}
                                      </>
                                    )}
                                    {canUpdateAssets && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleOpenMaintenance(asset)}>
                                          <Wrench className="w-4 h-4 mr-2" />
                                          Schedule Maintenance
                                        </DropdownMenuItem>
                                        {asset.status === "available" ? (
                                          <DropdownMenuItem className="text-red-600" onClick={() => setRetiringAsset(asset)}>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Retire Asset
                                          </DropdownMenuItem>
                                        ) : asset.status !== "assigned" ? (
                                          <DropdownMenuItem onClick={() => setRetiringAsset(asset)}>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Available
                                          </DropdownMenuItem>
                                        ) : null}
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

              <div className="md:hidden space-y-3">
                {loading ? (
                  <p className="text-center text-gray-500 py-8">Loading assets...</p>
                ) : filteredAssets.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No assets found</p>
                ) : (
                  filteredAssets.map((asset) => {
                    const TypeIcon = getAssetTypeIcon(asset.assetType)
                    return (
                      <div key={asset.id} className="border rounded-lg p-4 space-y-3 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                              <TypeIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{asset.name}</p>
                              <p className="text-sm text-gray-500 truncate">{asset.brand} {asset.model}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(asset.status)}>
                            {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Type</span>
                            <p className="font-medium capitalize">{asset.assetType}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Value</span>
                            <p className="font-medium">₹{asset.currentValue.toLocaleString()}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Assigned To</span>
                            <p className="font-medium">{asset.assignedTo?.name || "Not assigned"}</p>
                          </div>
                        </div>
                        {canViewAssets && (
                          <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewAsset(asset)}>
                            View Details
                          </Button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {canViewAllocations && (
        <TabsContent value="allocations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Asset Allocations
              </CardTitle>
              <CardDescription>Track which assets are assigned to employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading allocations...</p>
                ) : allocations.length > 0 ? (
                  allocations.map((allocation) => {
                    const asset = assets.find(a => a.id === allocation.assetId)
                    return (
                      <div key={allocation.id} className="p-4 border rounded-lg hover:bg-gray-50 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-3 bg-blue-100 rounded-lg shrink-0">
                              {asset ? React.createElement(getAssetTypeIcon(asset.assetType), { className: "w-6 h-6 text-blue-600" }) : <Package className="w-6 h-6 text-blue-600" />}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{asset?.name || `Asset ${allocation.assetId}`}</h3>
                              <p className="text-sm text-gray-500 truncate">{asset ? `${asset.brand} ${asset.model}` : allocation.notes}</p>
                            </div>
                          </div>
                          <div className="sm:text-right">
                            <p className="font-medium text-gray-900">{allocation.employeeName}</p>
                            <p className="text-sm text-gray-500">Assigned: {new Date(allocation.assignedDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Badge className={allocation.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {allocation.status.charAt(0).toUpperCase() + allocation.status.slice(1)}
                            </Badge>
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                              <User className="w-4 h-4 mr-2" />
                              Reallocate
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-500">No active allocations found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {canViewAssets && (
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Maintenance Schedule
              </CardTitle>
              <CardDescription>Track maintenance history and schedule upcoming maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading maintenance records...</p>
                ) : maintenanceRecords.length > 0 ? (
                  <div className="space-y-3">
                    {maintenanceRecords.map((record) => {
                      const asset = assets.find(a => a.id === record.assetId || a.id === record.asset_id)
                      const maintenanceDate = new Date(record.date)
                      const isUpcoming = maintenanceDate >= new Date()
                      const isOverdue = record.overdue || (maintenanceDate < new Date() && isUpcoming === false)
                      
                      return (
                        <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`p-3 rounded-lg shrink-0 ${
                                isOverdue ? "bg-red-100" : isUpcoming ? "bg-orange-100" : "bg-gray-100"
                              }`}>
                                <Wrench className={`w-6 h-6 ${
                                  isOverdue ? "text-red-600" : isUpcoming ? "text-orange-600" : "text-gray-600"
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-gray-900">
                                    {asset?.name || `Asset ${record.assetId || record.asset_id}`}
                                  </h3>
                                  <Badge variant="outline" className={
                                    record.type === "routine" ? "bg-green-100 text-green-800" :
                                    record.type === "repair" ? "bg-orange-100 text-orange-800" :
                                    record.type === "inspection" ? "bg-blue-100 text-blue-800" :
                                    "bg-gray-100 text-gray-800"
                                  }>
                                    {record.type?.charAt(0).toUpperCase() + record.type?.slice(1) || "Maintenance"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{record.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {maintenanceDate.toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {record.performedBy}
                                  </span>
                                  {record.cost > 0 && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      ₹{record.cost.toLocaleString()}
                                    </span>
                                  )}
                                  {record.nextMaintenance && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      Next: {new Date(record.nextMaintenance).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">
                              {isOverdue && (
                                <Badge className="bg-red-100 text-red-800">
                                  Overdue
                                </Badge>
                              )}
                              {isUpcoming && !isOverdue && (
                                <Badge className="bg-orange-100 text-orange-800">
                                  Upcoming
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 mb-2">No maintenance records found</p>
                    <p className="text-xs text-gray-400">Schedule maintenance for assets to see records here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {(canViewReports || canExportReports) && (
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Asset Value Report
                </CardTitle>
                <CardDescription>Financial overview of assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Purchase Value</span>
                    <span className="font-medium">₹{assets.reduce((sum, asset) => sum + asset.purchaseCost, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Value</span>
                    <span className="font-medium">₹{totalAssetValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Depreciation</span>
                    <span className="font-medium text-red-600">₹{(assets.reduce((sum, asset) => sum + asset.purchaseCost, 0) - totalAssetValue).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Utilization Report
                </CardTitle>
                <CardDescription>Asset utilization metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Utilization Rate</span>
                    <span className="font-medium">{Math.round(utilizationRate)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Assets</span>
                    <span className="font-medium">{assets.filter(asset => asset.status === "available").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Under Maintenance</span>
                    <span className="font-medium">{maintenanceAssets}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        )}
      </Tabs>

      {/* Asset Details Dialog */}
      {selectedAsset && (
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {React.createElement(getAssetTypeIcon(selectedAsset.assetType), { className: "w-5 h-5" })}
                {selectedAsset.name}
              </DialogTitle>
              <DialogDescription>Detailed asset information and history</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Asset Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Asset Tag:</span>
                      <span>{selectedAsset.assetTag || selectedAsset.label?.asset_tag || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Serial Number:</span>
                      <span>{selectedAsset.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span>{selectedAsset.brand} {selectedAsset.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Date:</span>
                      <span>{selectedAsset.purchaseDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Warranty Expiry:</span>
                      <span>{selectedAsset.warrantyExpiry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Cost:</span>
                      <span>₹{selectedAsset.purchaseCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Value:</span>
                      <span>₹{selectedAsset.currentValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Status & Location</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedAsset.status)}>
                        {selectedAsset.status.charAt(0).toUpperCase() + selectedAsset.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Condition:</span>
                      <Badge className={getConditionColor(selectedAsset.condition)}>
                        {selectedAsset.condition.charAt(0).toUpperCase() + selectedAsset.condition.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span>{selectedAsset.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span>{selectedAsset.department}</span>
                    </div>
                  </div>
                </div>

                {selectedAsset.assignedTo && (
                  <div>
                    <h3 className="font-medium mb-2">Assigned To</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employee:</span>
                        <span>{selectedAsset.assignedTo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>{selectedAsset.assignedTo.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span>{selectedAsset.assignedTo.department}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Asset label</h3>
                    {selectedAsset.qrCodeDataUrl && selectedAsset.barcodeDataUrl ? (
                      <Button variant="outline" size="sm" onClick={printAssetLabel}>
                        Print label
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Stick this QR/barcode on the physical asset. Mobile scans resolve to this record.
                  </p>
                  {selectedAsset.qrCodeDataUrl && selectedAsset.barcodeDataUrl ? (
                    <div className="rounded-lg border p-4 bg-white flex flex-col items-center gap-3">
                      <img src={selectedAsset.qrCodeDataUrl} alt="Asset QR code" className="h-36 w-36" />
                      <img src={selectedAsset.barcodeDataUrl} alt="Asset barcode" className="max-w-full h-16 object-contain" />
                      <p className="text-xs text-gray-600 break-all text-center">
                        {selectedAsset.scanPayload || selectedAsset.label?.scan_payload}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Label codes are generated when the asset is saved.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div>
                  <h3 className="font-medium mb-2">Maintenance History</h3>
                  <div className="space-y-3">
                    {selectedAsset.maintenanceHistory && selectedAsset.maintenanceHistory.length > 0 ? (
                      selectedAsset.maintenanceHistory.map((record) => (
                        <div key={record.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-sm">{record.type}</p>
                              <p className="text-xs text-gray-500">{record.date}</p>
                            </div>
                            <span className="text-sm font-medium">₹{record.cost.toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-600">{record.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Performed by: {record.performedBy}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No maintenance records found</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedAsset.notes}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Asset Dialog */}
      <Dialog open={showAddAsset} onOpenChange={setShowAddAsset}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>Add a new asset to the company inventory</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Asset Name *</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., MacBook Pro 16-inch" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="assetType">Asset Type *</Label>
                <Select value={formData.assetType} onValueChange={(value) => setFormData({ ...formData, assetType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile Device</SelectItem>
                    <SelectItem value="printer">Printer</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                    <SelectItem value="network">Network Equipment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serialNumber">Serial Number *</Label>
                <Input 
                  id="serialNumber" 
                  placeholder="Enter serial number" 
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand *</Label>
                <Input 
                  id="brand" 
                  placeholder="e.g., Apple, Dell, HP" 
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Model *</Label>
                <Input 
                  id="model" 
                  placeholder="e.g., MacBook Pro M3" 
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="purchaseCost">Purchase Cost *</Label>
                <Input 
                  id="purchaseCost" 
                  type="number" 
                  placeholder="Enter cost" 
                  value={formData.purchaseCost}
                  onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchaseDate">Purchase Date *</Label>
                <DatePicker
                  value={formData.purchaseDate}
                  onChange={(v) => setFormData({ ...formData, purchaseDate: v })}
                />
              </div>
              <div>
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <DatePicker
                  value={formData.warrantyExpiry}
                  onChange={(v) => setFormData({ ...formData, warrantyExpiry: v })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input 
                  id="location" 
                  placeholder="e.g., Engineering Department" 
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Add any additional notes..." 
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowAddAsset(false)
              setFormData({
                name: "",
                assetType: "",
                serialNumber: "",
                brand: "",
                model: "",
                purchaseCost: "",
                purchaseDate: "",
                warrantyExpiry: "",
                location: "",
                department: "",
                condition: "good",
                notes: ""
              })
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddAsset} disabled={submitting}>
              {submitting ? "Adding..." : "Add Asset"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Asset Dialog */}
      <Dialog open={showEditAsset} onOpenChange={(open) => {
        setShowEditAsset(open)
        if (!open) setEditingAsset(null)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>Update asset details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Asset Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-assetType">Asset Type *</Label>
                <Select value={formData.assetType} onValueChange={(value) => setFormData({ ...formData, assetType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile Device</SelectItem>
                    <SelectItem value="printer">Printer</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                    <SelectItem value="network">Network Equipment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-serialNumber">Serial Number *</Label>
                <Input
                  id="edit-serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-brand">Brand *</Label>
                <Input
                  id="edit-brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-model">Model *</Label>
                <Input
                  id="edit-model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-purchaseCost">Purchase Cost *</Label>
                <Input
                  id="edit-purchaseCost"
                  type="number"
                  value={formData.purchaseCost}
                  onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-purchaseDate">Purchase Date *</Label>
                <DatePicker
                  value={formData.purchaseDate}
                  onChange={(v) => setFormData({ ...formData, purchaseDate: v })}
                />
              </div>
              <div>
                <Label htmlFor="edit-warrantyExpiry">Warranty Expiry</Label>
                <DatePicker
                  value={formData.warrantyExpiry}
                  onChange={(v) => setFormData({ ...formData, warrantyExpiry: v })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-location">Location *</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditAsset(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAsset} disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Allocate Asset Dialog */}
      <Dialog open={showAllocateAsset} onOpenChange={(open) => {
        setShowAllocateAsset(open)
        if (!open) {
          setAllocatingAsset(null)
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Allocate Asset</DialogTitle>
            <DialogDescription>Assign {allocatingAsset?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeId">Employee</Label>
                <Select
                  value={allocationForm.employeeId}
                  onValueChange={(value) => setAllocationForm({ ...allocationForm, employeeId: value })}
                  disabled={employeesLoading}
                >
                  <SelectTrigger id="employeeId">
                    <SelectValue placeholder={employeesLoading ? "Loading employees..." : "Select employee"} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length === 0 ? (
                      <SelectItem value="none" disabled>No employees found</SelectItem>
                    ) : (
                      employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}{emp.department ? ` • ${emp.department}` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignedDate">Assigned Date</Label>
                <DatePicker
                  value={allocationForm.assignedDate}
                  onChange={(v) => setAllocationForm({ ...allocationForm, assignedDate: v })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="allocationNotes">Notes</Label>
              <Textarea
                id="allocationNotes"
                placeholder="Allocation notes"
                value={allocationForm.notes}
                onChange={(e) => setAllocationForm({ ...allocationForm, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowAllocateAsset(false)
              setAllocatingAsset(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleAllocateAsset} disabled={actionLoading || !allocationForm.employeeId}>
              {actionLoading ? "Allocating..." : "Allocate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog open={!!maintenanceAsset} onOpenChange={(open) => {
        if (!open) {
          setMaintenanceAsset(null)
          setMaintenanceForm({
            maintenanceType: "routine",
            scheduledDate: new Date().toISOString().split("T")[0],
            notes: ""
          })
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
            <DialogDescription>Schedule work for {maintenanceAsset?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maintenanceType">Maintenance Type</Label>
                <Select value={maintenanceForm.maintenanceType} onValueChange={(value) => setMaintenanceForm({ ...maintenanceForm, maintenanceType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="upgrade">Upgrade</SelectItem>
                    <SelectItem value="replacement">Replacement</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <DatePicker
                  value={maintenanceForm.scheduledDate}
                  onChange={(v) => setMaintenanceForm({ ...maintenanceForm, scheduledDate: v })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="maintenanceNotes">Notes</Label>
              <Textarea
                id="maintenanceNotes"
                placeholder="Maintenance notes"
                value={maintenanceForm.notes}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMaintenanceAsset(null)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleMaintenance} disabled={actionLoading || !maintenanceForm.scheduledDate}>
              {actionLoading ? "Scheduling..." : "Schedule"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Make Asset Available / Retire Asset Dialog */}
      <Dialog open={!!retiringAsset} onOpenChange={(open) => !open && setRetiringAsset(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {retiringAsset?.status === "available" ? "Retire Asset" : "Make Asset Available"}
            </DialogTitle>
            <DialogDescription>
              {retiringAsset?.status === "available" 
                ? `Mark ${retiringAsset?.name} as retired`
                : `Mark ${retiringAsset?.name} as available`}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            {retiringAsset?.status === "available"
              ? "This will update the asset status to retired."
              : "This will update the asset status to available."}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRetiringAsset(null)}>Cancel</Button>
            <Button 
              variant={retiringAsset?.status === "available" ? "destructive" : "default"}
              onClick={handleRetireAsset} 
              disabled={actionLoading}
            >
              {actionLoading 
                ? "Updating..." 
                : retiringAsset?.status === "available" 
                  ? "Retire" 
                  : "Make Available"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 