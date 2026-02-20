"use client"

import { useState, useEffect } from "react"
import { getApiUrl, apiRequest, getEndpointUrl } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Award,
  Trophy,
  Star,
  Heart,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Sparkles,
  Target,
  Lightbulb,
  Handshake,
} from "lucide-react"
import { useAuth } from "@/lib/auth/auth.hooks"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Recognition {
  id: number
  title: string
  description: string
  recognition_type: string
  category: string
  status: string
  given_by_id: number
  received_by_id: number
  created_at: string
  formatted_date: string
  given_by_name: string
  received_by_name: string
  given_by?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  received_by?: {
    id: number
    first_name: string
    last_name: string
    email: string
    designation: string
    department_id: number
  }
}

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  designation?: string
}

export default function RecognitionsPage() {
  const { user } = useAuth()
  const [recognitions, setRecognitions] = useState<Recognition[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedRecognition, setSelectedRecognition] = useState<Recognition | null>(null)
  const [newRecognition, setNewRecognition] = useState({
    received_by_id: "",
    recognition_type: "appreciation",
    title: "",
    description: "",
    category: "other"
  })
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)

  useEffect(() => {
    fetchRecognitions()
  }, [filterType, filterCategory])

  useEffect(() => {
    if (showCreateDialog || showEditDialog) {
      fetchEmployees()
    }
  }, [showCreateDialog, showEditDialog])

  const fetchRecognitions = async () => {
    setLoading(true)
    try {
      let url = getEndpointUrl('RECOGNITIONS')
      const params = new URLSearchParams()
      
      if (filterType !== "all") {
        params.append('recognition_type', filterType)
      }
      if (filterCategory !== "all") {
        params.append('category', filterCategory)
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const data = await apiRequest<Recognition[]>(url, { method: "GET" })
      setRecognitions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching recognitions:', error)
      setRecognitions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    setLoadingEmployees(true)
    try {
      const response = await apiRequest<any>(`${getEndpointUrl('EMPLOYEES')}?per_page=1000`, { suppressToast: true })
      
      let employeeList: Employee[] = []
      if (Array.isArray(response)) {
        employeeList = response
      } else if (response?.data && Array.isArray(response.data)) {
        employeeList = response.data
      }
      
      setEmployees(employeeList)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    } finally {
      setLoadingEmployees(false)
    }
  }

  const handleCreateRecognition = () => {
    setNewRecognition({
      received_by_id: "",
      recognition_type: "appreciation",
      title: "",
      description: "",
      category: "other"
    })
    setShowCreateDialog(true)
  }

  const handleSubmitRecognition = async () => {
    if (!newRecognition.title || !newRecognition.received_by_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const url = selectedRecognition 
        ? `${getEndpointUrl('RECOGNITIONS')}/${selectedRecognition.id}`
        : getEndpointUrl('RECOGNITIONS')
      
      const method = selectedRecognition ? 'PUT' : 'POST'
      
      await apiRequest(url, {
        method,
        body: JSON.stringify({
          recognition: {
            ...newRecognition,
            received_by_id: parseInt(newRecognition.received_by_id)
          }
        })
      })
      
      setShowCreateDialog(false)
      setShowEditDialog(false)
      setSelectedRecognition(null)
      fetchRecognitions()
      toast({
        title: "Success",
        description: selectedRecognition ? "Recognition updated successfully" : "Recognition created successfully",
        variant: "default",
      })
    } catch (error: any) {
      console.error('Error saving recognition:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to save recognition",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditRecognition = (recognition: Recognition) => {
    setSelectedRecognition(recognition)
    setNewRecognition({
      received_by_id: recognition.received_by_id.toString(),
      recognition_type: recognition.recognition_type,
      title: recognition.title,
      description: recognition.description || "",
      category: recognition.category || "other"
    })
    setShowEditDialog(true)
  }

  const handleViewRecognition = (recognition: Recognition) => {
    setSelectedRecognition(recognition)
    setShowViewDialog(true)
  }

  const handleDeleteRecognition = async (recognition: Recognition) => {
    if (!confirm(`Are you sure you want to delete "${recognition.title}"?`)) {
      return
    }

    setLoading(true)
    try {
      await apiRequest(`${getEndpointUrl('RECOGNITIONS')}/${recognition.id}`, {
        method: 'DELETE'
      })
      fetchRecognitions()
      toast({
        title: "Success",
        description: "Recognition deleted successfully",
        variant: "default",
      })
    } catch (error: any) {
      console.error('Error deleting recognition:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to delete recognition",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRecognitionTypeIcon = (type: string) => {
    switch (type) {
      case 'appreciation':
        return <Heart className="h-5 w-5 text-pink-500" />
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 'milestone':
        return <Target className="h-5 w-5 text-blue-500" />
      case 'excellence':
        return <Star className="h-5 w-5 text-purple-500" />
      case 'teamwork':
        return <Users className="h-5 w-5 text-green-500" />
      case 'innovation':
        return <Lightbulb className="h-5 w-5 text-orange-500" />
      case 'leadership':
        return <Handshake className="h-5 w-5 text-indigo-500" />
      default:
        return <Award className="h-5 w-5 text-gray-500" />
    }
  }

  const getRecognitionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      appreciation: "bg-pink-100 text-pink-800",
      achievement: "bg-yellow-100 text-yellow-800",
      milestone: "bg-blue-100 text-blue-800",
      excellence: "bg-purple-100 text-purple-800",
      teamwork: "bg-green-100 text-green-800",
      innovation: "bg-orange-100 text-orange-800",
      leadership: "bg-indigo-100 text-indigo-800",
    }
    return <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>{type}</Badge>
  }

  const getRecognitionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      appreciation: "Appreciation",
      achievement: "Achievement",
      milestone: "Milestone",
      excellence: "Excellence",
      teamwork: "Teamwork",
      innovation: "Innovation",
      leadership: "Leadership",
    }
    return labels[type] || type
  }

  const filteredRecognitions = recognitions.filter(recognition => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        recognition.title.toLowerCase().includes(searchLower) ||
        (recognition.description && recognition.description.toLowerCase().includes(searchLower)) ||
        recognition.received_by_name.toLowerCase().includes(searchLower) ||
        recognition.given_by_name.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  return (
    <div className="max-w-7xl mx-auto p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-green-600" />
            Recognitions & Appreciations
          </h1>
          <p className="text-gray-600 text-sm">Celebrate achievements and recognize outstanding contributions</p>
        </div>
        <Button onClick={handleCreateRecognition}>
          <Plus className="w-4 h-4 mr-2" />
          Give Recognition
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search recognitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Recognition Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="appreciation">Appreciation</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="excellence">Excellence</SelectItem>
                <SelectItem value="teamwork">Teamwork</SelectItem>
                <SelectItem value="innovation">Innovation</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="teamwork">Teamwork</SelectItem>
                <SelectItem value="innovation">Innovation</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="customer_service">Customer Service</SelectItem>
                <SelectItem value="project_success">Project Success</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recognitions Feed */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading recognitions...</div>
      ) : filteredRecognitions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500">No recognitions found</p>
            <Button onClick={handleCreateRecognition} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Give First Recognition
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecognitions.map((recognition) => (
            <Card key={recognition.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getRecognitionTypeIcon(recognition.recognition_type)}
                    <div>
                      <CardTitle className="text-lg">{recognition.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {getRecognitionTypeLabel(recognition.recognition_type)}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewRecognition(recognition)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {user?.id === recognition.given_by_id && (
                        <>
                          <DropdownMenuItem onClick={() => handleEditRecognition(recognition)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRecognition(recognition)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recognition Description */}
                  {recognition.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {recognition.description}
                    </p>
                  )}

                  {/* Recipient */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {recognition.received_by_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {recognition.received_by_name}
                      </p>
                      {recognition.received_by?.designation && (
                        <p className="text-xs text-gray-500 truncate">
                          {recognition.received_by.designation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Given By */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>
                      Given by <span className="font-medium">{recognition.given_by_name}</span>
                    </span>
                    <span>{recognition.formatted_date}</span>
                  </div>

                  {/* Category Badge */}
                  {recognition.category && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {recognition.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false)
          setShowEditDialog(false)
          setSelectedRecognition(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRecognition ? "Edit Recognition" : "Give Recognition"}</DialogTitle>
            <DialogDescription>
              {selectedRecognition ? "Update recognition details" : "Recognize someone for their outstanding contribution"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="received_by">Recognize *</Label>
              <Select
                value={newRecognition.received_by_id}
                onValueChange={(value) => setNewRecognition({ ...newRecognition, received_by_id: value })}
                disabled={loadingEmployees}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingEmployees ? "Loading employees..." : "Select employee"} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.first_name} {emp.last_name} {emp.email && `(${emp.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newRecognition.title}
                onChange={(e) => setNewRecognition({ ...newRecognition, title: e.target.value })}
                placeholder="e.g., Outstanding Performance, Team Player, Innovation Award"
              />
            </div>
            <div>
              <Label htmlFor="recognition_type">Recognition Type *</Label>
              <Select
                value={newRecognition.recognition_type}
                onValueChange={(value) => setNewRecognition({ ...newRecognition, recognition_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appreciation">Appreciation</SelectItem>
                  <SelectItem value="achievement">Achievement</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="excellence">Excellence</SelectItem>
                  <SelectItem value="teamwork">Teamwork</SelectItem>
                  <SelectItem value="innovation">Innovation</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newRecognition.description}
                onChange={(e) => setNewRecognition({ ...newRecognition, description: e.target.value })}
                placeholder="Describe why this recognition is being given..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={newRecognition.category}
                onValueChange={(value) => setNewRecognition({ ...newRecognition, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="teamwork">Teamwork</SelectItem>
                  <SelectItem value="innovation">Innovation</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="customer_service">Customer Service</SelectItem>
                  <SelectItem value="project_success">Project Success</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false)
              setShowEditDialog(false)
              setSelectedRecognition(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRecognition} disabled={loading}>
              {loading ? "Saving..." : selectedRecognition ? "Update Recognition" : "Give Recognition"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRecognition && getRecognitionTypeIcon(selectedRecognition.recognition_type)}
              {selectedRecognition?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedRecognition && getRecognitionTypeBadge(selectedRecognition.recognition_type)}
            </DialogDescription>
          </DialogHeader>
          {selectedRecognition && (
            <div className="space-y-4">
              {selectedRecognition.description && (
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Description</Label>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedRecognition.description}</p>
                </div>
              )}
              
              {/* Recipient */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-semibold text-gray-500 mb-2 block">Recognized Employee</Label>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {selectedRecognition.received_by_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedRecognition.received_by_name}
                    </p>
                    {selectedRecognition.received_by?.designation && (
                      <p className="text-xs text-gray-500">
                        {selectedRecognition.received_by.designation}
                      </p>
                    )}
                    {selectedRecognition.received_by?.email && (
                      <p className="text-xs text-gray-500">
                        {selectedRecognition.received_by.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Given By */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Given By</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRecognition.given_by_name}
                  </p>
                </div>
                <div className="text-right">
                  <Label className="text-sm font-semibold text-gray-500">Date</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRecognition.formatted_date}
                  </p>
                </div>
              </div>

              {selectedRecognition.category && (
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Category</Label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {selectedRecognition.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {selectedRecognition && user?.id === selectedRecognition.given_by_id && (
              <Button onClick={() => {
                setShowViewDialog(false)
                handleEditRecognition(selectedRecognition)
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
