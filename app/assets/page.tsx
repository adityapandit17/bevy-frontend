"use client"

import React, { useState, useEffect } from "react"
import { getApiUrl, getEndpointUrl } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
} from "lucide-react"

interface Asset {
  id: string
  name: string
  assetType: string
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
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [showAllocateAsset, setShowAllocateAsset] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDepartment, setFilterDepartment] = useState<string>("all")

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch(getEndpointUrl('ASSETS'))
        const data = await response.json()
        setAssets(data.assets)
      } catch (error) {
        console.error('Error fetching assets:', error)
        // Fallback to mock data if API fails
        setAssets([
          {
            id: "1",
            name: "MacBook Pro 16-inch",
            assetType: "laptop",
            serialNumber: "MBP2024001",
            model: "MacBook Pro 16-inch M3",
            brand: "Apple",
            purchaseDate: "2024-01-15",
            warrantyExpiry: "2027-01-15",
            purchaseCost: 2499,
            currentValue: 2200,
            status: "assigned",
            location: "Engineering Department",
            department: "Engineering",
            condition: "excellent",
            notes: "High-performance laptop for software development",
            lastMaintenance: "2024-10-15",
            nextMaintenance: "2025-01-15",
            assignedTo: {
              id: "1",
              name: "John Doe",
              email: "john.doe@company.com",
              department: "Engineering"
            },
            maintenanceHistory: [
              {
                id: "1",
                date: "2024-10-15",
                type: "Routine Check",
                description: "Software updates and hardware inspection",
                cost: 0,
                performedBy: "IT Team"
              }
            ]
          }
        ])
      }
    }

    const fetchAssetStats = async () => {
      try {
        const response = await fetch(getApiUrl('assets/stats'))
        const data = await response.json()
        
        setAssetStats([
          {
            title: "Total Assets",
            value: data.overview.total_assets.toString(),
            change: `${data.overview.utilization_rate}% utilization`,
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
          },
          {
            title: "Assigned Assets",
            value: data.overview.assigned_assets.toString(),
            change: `${data.overview.utilization_rate}% utilization`,
            icon: User,
            color: "text-green-600",
            bgColor: "bg-green-50",
          },
          {
            title: "Available Assets",
            value: data.overview.available_assets.toString(),
            change: "Ready for allocation",
            icon: CheckCircle,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
          },
          {
            title: "Under Maintenance",
            value: data.overview.maintenance_assets.toString(),
            change: "Requires attention",
            icon: Wrench,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
          },
        ])
      } catch (error) {
        console.error('Error fetching asset stats:', error)
      }
    }

    fetchAssets()
    fetchAssetStats()
  }, [])

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

  const assetTypes = [
    { type: "laptop", label: "Laptops", icon: Laptop, count: 45, color: "bg-blue-100 text-blue-800" },
    { type: "desktop", label: "Desktops", icon: Monitor, count: 32, color: "bg-green-100 text-green-800" },
    { type: "mobile", label: "Mobile Devices", icon: Smartphone, count: 28, color: "bg-purple-100 text-purple-800" },
    { type: "printer", label: "Printers", icon: Printer, count: 15, color: "bg-orange-100 text-orange-800" },
    { type: "server", label: "Servers", icon: Server, count: 8, color: "bg-red-100 text-red-800" },
    { type: "network", label: "Network Equipment", icon: Network, count: 18, color: "bg-indigo-100 text-indigo-800" },
  ]

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

  const totalAssetValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0)
  const assignedAssets = assets.filter(asset => asset.status === "assigned").length
  const maintenanceAssets = assets.filter(asset => asset.status === "maintenance").length

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600">Track, allocate, and manage all company assets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button size="sm" onClick={() => setShowAddAsset(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {assetStats.map((stat, index) => (
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
              {assetTypes.map((type) => (
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
              ))}
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
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Asset Value</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalAssetValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                  <div className="flex items-center gap-2">
                    <Progress value={(assignedAssets / assets.length) * 100} className="flex-1" />
                    <span className="text-sm font-medium">{Math.round((assignedAssets / assets.length) * 100)}%</span>
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
                  <p className="text-2xl font-bold text-gray-900">2.3 years</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-96">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
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

              <div className="rounded-md border">
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
                    {filteredAssets.map((asset) => {
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setSelectedAsset(asset)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Asset
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowAllocateAsset(true)}>
                                  <User className="w-4 h-4 mr-2" />
                                  Allocate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Wrench className="w-4 h-4 mr-2" />
                                  Schedule Maintenance
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Retire Asset
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                {assets.filter(asset => asset.assignedTo).map((asset) => (
                  <div key={asset.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          {React.createElement(getAssetTypeIcon(asset.assetType), { className: "w-6 h-6 text-blue-600" })}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{asset.name}</h3>
                          <p className="text-sm text-gray-500">{asset.brand} {asset.model}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{asset.assignedTo?.name}</p>
                        <p className="text-sm text-gray-500">{asset.assignedTo?.department}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getConditionColor(asset.condition)}>
                          {asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1)}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <User className="w-4 h-4 mr-2" />
                          Reallocate
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                {assets.filter(asset => asset.nextMaintenance).map((asset) => (
                  <div key={asset.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                          {React.createElement(getAssetTypeIcon(asset.assetType), { className: "w-6 h-6 text-orange-600" })}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{asset.name}</h3>
                          <p className="text-sm text-gray-500">Next maintenance: {asset.nextMaintenance}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                    <span className="font-medium">{Math.round((assignedAssets / assets.length) * 100)}%</span>
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
      </Tabs>

      {/* Asset Details Dialog */}
      {selectedAsset && (
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
                  <h3 className="font-medium mb-2">Maintenance History</h3>
                  <div className="space-y-3">
                    {selectedAsset.maintenanceHistory.map((record) => (
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
                    ))}
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
                <Label htmlFor="name">Asset Name</Label>
                <Input id="name" placeholder="e.g., MacBook Pro 16-inch" />
              </div>
              <div>
                <Label htmlFor="assetType">Asset Type</Label>
                <Select>
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
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input id="serialNumber" placeholder="Enter serial number" />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" placeholder="e.g., Apple, Dell, HP" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Model</Label>
                <Input id="model" placeholder="e.g., MacBook Pro M3" />
              </div>
              <div>
                <Label htmlFor="purchaseCost">Purchase Cost</Label>
                <Input id="purchaseCost" type="number" placeholder="Enter cost" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input id="purchaseDate" type="date" />
              </div>
              <div>
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input id="warrantyExpiry" type="date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g., Engineering Department" />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select>
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
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add any additional notes..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddAsset(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddAsset(false)}>
              Add Asset
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 