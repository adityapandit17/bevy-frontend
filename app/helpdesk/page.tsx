"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getEndpointUrl, getApiUrl, apiRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  MessageSquare,
  Clock,
  CheckCircle,
  HelpCircle,
  FileText,
  Users,
  TrendingUp,
  Calendar,
  User,
  Tag,
  AlertTriangle,
  Mail,
  Phone,
  Download,
  Eye,
  Edit,
  Trash2,
  Reply,
  Forward,
  Archive,
  Star,
  BookOpen,
  Lightbulb,
  Target,
  BarChart3,
  Settings,
  Shield,
  Award
} from "lucide-react"

interface Ticket {
  id: number
  title: string
  description: string
  category: string
  priority: string
  status: string
  assigned_to_id?: number
  requester_id?: number
  sla_hours?: number
  sla_status: string
  channel: string
  tags_list: string[]
  sla_display: string
  assigned_to_name: string
  requester_name: string
  created_at: string
  assigned_to?: { id: number; first_name: string; last_name: string; email: string }
  requester?: { id: number; first_name: string; last_name: string; email: string }
}

interface SLAWorkflow {
  id: number
  name: string
  category: string
  priority: string
  sla_hours: number
  status: string
  tickets_handled: number
  avg_resolution_hours?: number
  escalation_levels_list: Array<{ level: number; time: string; action: string }>
  sla_display: string
  avg_resolution_display: string
}

interface KnowledgeArticle {
  id: number
  title: string
  content: string
  category: string
  author: string
  tags_list: string[]
  views: number
  helpful: number
  status: string
  last_updated_display: string
  updated_at: string
}

interface Stats {
  open_tickets: number
  in_progress_tickets: number
  resolved_tickets: number
  avg_response_time: string
  sla_compliance: number
  knowledge_articles: number
}

export default function HelpdeskPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [slaWorkflows, setSlaWorkflows] = useState<SLAWorkflow[]>([])
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeArticle[]>([])
  const [stats, setStats] = useState<Stats>({
    open_tickets: 0,
    in_progress_tickets: 0,
    resolved_tickets: 0,
    avg_response_time: "0h",
    sla_compliance: 0,
    knowledge_articles: 0
  })
  const [loading, setLoading] = useState(false)
  const [showCreateTicketDialog, setShowCreateTicketDialog] = useState(false)
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    channel: "portal"
  })
  const [creating, setCreating] = useState(false)
  const [showCreateWorkflowDialog, setShowCreateWorkflowDialog] = useState(false)
  const [showCreateArticleDialog, setShowCreateArticleDialog] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showEditTicketDialog, setShowEditTicketDialog] = useState(false)
  const [editingTicket, setEditingTicket] = useState(false)
  
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    category: "",
    priority: "medium",
    sla_hours: 24,
    escalation_levels: [
      { level: 1, time: "", action: "" },
      { level: 2, time: "", action: "" },
      { level: 3, time: "", action: "" }
    ]
  })
  const [creatingWorkflow, setCreatingWorkflow] = useState(false)

  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    category: "",
    author: "",
    tags: [] as string[],
    status: "draft"
  })
  const [creatingArticle, setCreatingArticle] = useState(false)

  useEffect(() => {
    fetchTickets()
    fetchSLAWorkflows()
    fetchKnowledgeArticles()
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [priorityFilter, statusFilter, categoryFilter, searchTerm])

  // Keep stats in sync with loaded tickets and knowledge base
  useEffect(() => {
    if (tickets.length === 0 && knowledgeBase.length === 0) {
      setStats({
        open_tickets: 0,
        in_progress_tickets: 0,
        resolved_tickets: 0,
        avg_response_time: "0h",
        sla_compliance: 0,
        knowledge_articles: 0,
      })
      return
    }

    const openTickets = tickets.filter((t) => t.status === "open").length
    const inProgressTickets = tickets.filter((t) => t.status === "in-progress").length
    const resolvedTickets = tickets.filter((t) => t.status === "resolved").length

    // Approximate average response time from available SLA data (in hours)
    const ticketsWithSla = tickets.filter((t) => typeof t.sla_hours === "number" && t.sla_hours! > 0)
    const avgResponseTime =
      ticketsWithSla.length > 0
        ? `${Math.round(
            ticketsWithSla.reduce((sum, t) => sum + (t.sla_hours || 0), 0) / ticketsWithSla.length
          )}h`
        : "N/A"

    // SLA compliance based on SLA status
    const ticketsWithSlaStatus = tickets.filter((t) => t.sla_status)
    const onTrackCount = ticketsWithSlaStatus.filter((t) => t.sla_status === "on-track").length
    const slaCompliance =
      ticketsWithSlaStatus.length > 0
        ? Math.round((onTrackCount / ticketsWithSlaStatus.length) * 100)
        : 0

    setStats({
      open_tickets: openTickets,
      in_progress_tickets: inProgressTickets,
      resolved_tickets: resolvedTickets,
      avg_response_time: avgResponseTime,
      sla_compliance: slaCompliance,
      knowledge_articles: knowledgeBase.length,
    })
  }, [tickets, knowledgeBase])

  const handleCreateTicket = () => {
    setShowCreateTicketDialog(true)
  }

  const handleSubmitTicket = async () => {
    if (!newTicket.title || !newTicket.description || !newTicket.category) {
      alert("Please fill in all required fields")
      return
    }

    setCreating(true)
    try {
      await apiRequest(getEndpointUrl('HELPDESK_TICKETS'), {
        method: "POST",
        body: JSON.stringify({
          helpdesk_ticket: {
            ...newTicket,
            status: "open",
            sla_status: "on-track"
          }
        })
      })
      setShowCreateTicketDialog(false)
      setNewTicket({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        channel: "portal"
      })
      fetchTickets()
    } catch (err) {
      console.error('Error creating ticket:', err)
      alert("Failed to create ticket. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const handleCreateWorkflow = () => {
    setShowCreateWorkflowDialog(true)
  }

  const handleSubmitWorkflow = async () => {
    if (!newWorkflow.name || !newWorkflow.category || !newWorkflow.sla_hours) {
      alert("Please fill in all required fields")
      return
    }

    setCreatingWorkflow(true)
    try {
      await apiRequest(getEndpointUrl('SLA_WORKFLOWS'), {
        method: "POST",
        body: JSON.stringify({
          sla_workflow: {
            ...newWorkflow,
            status: "active",
            tickets_handled: 0,
            escalation_levels: newWorkflow.escalation_levels.filter(level => level.time && level.action)
          }
        })
      })
      setShowCreateWorkflowDialog(false)
      setNewWorkflow({
        name: "",
        category: "",
        priority: "medium",
        sla_hours: 24,
        escalation_levels: [
          { level: 1, time: "", action: "" },
          { level: 2, time: "", action: "" },
          { level: 3, time: "", action: "" }
        ]
      })
      fetchSLAWorkflows()
    } catch (err) {
      console.error('Error creating workflow:', err)
      alert("Failed to create workflow. Please try again.")
    } finally {
      setCreatingWorkflow(false)
    }
  }

  const handleCreateArticle = () => {
    setShowCreateArticleDialog(true)
  }

  const handleSubmitArticle = async () => {
    if (!newArticle.title || !newArticle.content || !newArticle.category) {
      alert("Please fill in all required fields")
      return
    }

    setCreatingArticle(true)
    try {
      await apiRequest(getEndpointUrl('KNOWLEDGE_ARTICLES'), {
        method: "POST",
        body: JSON.stringify({
          knowledge_article: {
            ...newArticle,
            views: 0,
            helpful: 0
          }
        })
      })
      setShowCreateArticleDialog(false)
      setNewArticle({
        title: "",
        content: "",
        category: "",
        author: "",
        tags: [],
        status: "draft"
      })
      fetchKnowledgeArticles()
      fetchStats()
    } catch (err) {
      console.error('Error creating article:', err)
      alert("Failed to create article. Please try again.")
    } finally {
      setCreatingArticle(false)
    }
  }

  const handleViewTicketDetails = (ticket: Ticket) => {
    router.push(`/helpdesk/${ticket.id}`)
  }

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setNewTicket({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      channel: ticket.channel
    })
    setShowEditTicketDialog(true)
  }

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return

    setEditingTicket(true)
    try {
      await apiRequest(`${getEndpointUrl('HELPDESK_TICKETS')}/${selectedTicket.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          helpdesk_ticket: newTicket
        })
      })
      setShowEditTicketDialog(false)
      setSelectedTicket(null)
      setNewTicket({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        channel: "portal"
      })
      fetchTickets()
    } catch (err) {
      console.error('Error updating ticket:', err)
      alert("Failed to update ticket. Please try again.")
    } finally {
      setEditingTicket(false)
    }
  }

  const handleDeleteTicket = async (ticket: Ticket) => {
    if (!confirm(`Are you sure you want to delete ticket "${ticket.title}"?`)) return

    try {
      await apiRequest(`${getEndpointUrl('HELPDESK_TICKETS')}/${ticket.id}`, {
        method: "DELETE"
      })
      fetchTickets()
      fetchStats()
    } catch (err) {
      console.error('Error deleting ticket:', err)
      alert("Failed to delete ticket. Please try again.")
    }
  }

  const handleArchiveTicket = async (ticket: Ticket) => {
    try {
      await apiRequest(`${getEndpointUrl('HELPDESK_TICKETS')}/${ticket.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          helpdesk_ticket: {
            status: "closed"
          }
        })
      })
      fetchTickets()
      fetchStats()
    } catch (err) {
      console.error('Error archiving ticket:', err)
      alert("Failed to archive ticket. Please try again.")
    }
  }

  const handleEscalateTicket = async (ticket: Ticket) => {
    try {
      await apiRequest(`${getEndpointUrl('HELPDESK_TICKETS')}/${ticket.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          helpdesk_ticket: {
            priority: ticket.priority === "high" ? "high" : ticket.priority === "medium" ? "high" : "medium",
            sla_status: "at-risk"
          }
        })
      })
      fetchTickets()
    } catch (err) {
      console.error('Error escalating ticket:', err)
      alert("Failed to escalate ticket. Please try again.")
    }
  }

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (priorityFilter !== "all") params.append("priority", priorityFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (searchTerm) params.append("search", searchTerm)

      const url = `${getEndpointUrl('HELPDESK_TICKETS')}${params.toString() ? `?${params.toString()}` : ''}`
      const data = await apiRequest<Ticket[]>(url, { method: "GET" })
      setTickets(data)
    } catch (err) {
      console.error('Error fetching tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSLAWorkflows = async () => {
    try {
      const data = await apiRequest<SLAWorkflow[]>(getEndpointUrl('SLA_WORKFLOWS'), {
        method: "GET",
        suppressToast: true, // Non-blocking; silently fail and log
      })
      setSlaWorkflows(data)
    } catch (err) {
      console.error('Error fetching SLA workflows:', err)
    }
  }

  const fetchKnowledgeArticles = async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (searchTerm) params.append("search", searchTerm)

      const url = `${getEndpointUrl('KNOWLEDGE_ARTICLES')}${params.toString() ? `?${params.toString()}` : ''}`
      const data = await apiRequest<KnowledgeArticle[]>(url, { method: "GET" })
      setKnowledgeBase(data)
    } catch (err) {
      console.error('Error fetching knowledge articles:', err)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>
      case 'in-progress':
        return <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getSLAStatusBadge = (slaStatus: string) => {
    switch (slaStatus) {
      case 'on-track':
        return <Badge className="bg-green-100 text-green-800">On Track</Badge>
      case 'at-risk':
        return <Badge className="bg-yellow-100 text-yellow-800">At Risk</Badge>
      case 'breached':
        return <Badge className="bg-red-100 text-red-800">Breached</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{slaStatus}</Badge>
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />
      case 'phone':
        return <Phone className="w-4 h-4" />
      case 'portal':
        return <FileText className="w-4 h-4" />
      case 'system':
        return <Settings className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Helpdesk / HR Support</h1>
          <p className="text-gray-600">Manage HR queries, tickets, and support workflows</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={handleCreateTicket}>
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.open_tickets}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avg_response_time}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sla_compliance}%</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Knowledge Articles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.knowledge_articles}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="sla">SLA Workflows</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        {/* Tickets */}
        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Support Tickets
                  </CardTitle>
                  <CardDescription>
                    Manage and track HR support tickets
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          <span className="ml-2 text-gray-600">Loading tickets...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : tickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No tickets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {ticket.id.toString().slice(-3)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{ticket.title}</p>
                            <p className="text-sm text-gray-500 truncate">{ticket.description}</p>
                            <div className="flex gap-1 mt-1">
                              {(ticket.tags_list || []).slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                            {ticket.assigned_to_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-sm">{ticket.assigned_to_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(ticket.channel)}
                          <span className="text-sm capitalize">{ticket.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{ticket.sla_display}</span>
                          {getSLAStatusBadge(ticket.sla_status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(ticket.created_at).toLocaleTimeString()}
                          </p>
                        </div>
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
                            <DropdownMenuItem onClick={() => router.push(`/helpdesk/${ticket.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert("Reply functionality coming soon")}>
                              <Reply className="mr-2 h-4 w-4" />
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEscalateTicket(ticket)}>
                              <Forward className="mr-2 h-4 w-4" />
                              Escalate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTicket(ticket)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Ticket
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleArchiveTicket(ticket)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTicket(ticket)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SLA Workflows */}
        <TabsContent value="sla" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    SLA Workflows
                  </CardTitle>
                  <CardDescription>
                    Configure and monitor Service Level Agreement workflows
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    SLA Reports
                  </Button>
                  <Button onClick={handleCreateWorkflow}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {slaWorkflows.map((workflow) => (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{workflow.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {workflow.category} • {workflow.sla_display} SLA
                          </CardDescription>
                        </div>
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
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Workflow
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(workflow.priority)}
                        <Badge className="bg-green-100 text-green-800">
                          {workflow.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900">Escalation Levels</h4>
                        {(workflow.escalation_levels_list || []).map((level) => (
                          <div key={level.level} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                                {level.level}
                              </div>
                              <span className="text-gray-700">{level.action}</span>
                            </div>
                            <span className="text-gray-500 font-medium">{level.time}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Tickets Handled</p>
                          <p className="text-lg font-bold text-gray-900">{workflow.tickets_handled}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Avg Resolution</p>
                          <p className="text-lg font-bold text-gray-900">{workflow.avg_resolution_display}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base */}
        <TabsContent value="knowledge" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Knowledge Base
                  </CardTitle>
                  <CardDescription>
                    Self-service articles and FAQs for common HR queries
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search articles..."
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Leave Management">Leave Management</SelectItem>
                      <SelectItem value="Payroll">Payroll</SelectItem>
                      <SelectItem value="Benefits">Benefits</SelectItem>
                      <SelectItem value="Performance">Performance</SelectItem>
                      <SelectItem value="IT Support">IT Support</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateArticle}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Article
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {knowledgeBase.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{article.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {article.category} • {article.author}
                          </CardDescription>
                        </div>
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
                              View Article
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Article
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {article.content}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {(article.tags_list || []).slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {article.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {article.helpful}
                          </div>
                        </div>
                        <span>{article.last_updated_display}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Read Article
                        </Button>
                        <Button size="sm" variant="outline">
                          <Lightbulb className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateTicketDialog} onOpenChange={setShowCreateTicketDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>
              Create a new helpdesk ticket to track HR support requests
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter ticket title"
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue or request"
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Payroll">Payroll</SelectItem>
                    <SelectItem value="Benefits">Benefits</SelectItem>
                    <SelectItem value="Leave Management">Leave Management</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="IT Support">IT Support</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="channel">Channel</Label>
              <Select
                value={newTicket.channel}
                onValueChange={(value) => setNewTicket({ ...newTicket, channel: value })}
              >
                <SelectTrigger id="channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portal">Portal</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateTicketDialog(false)
                setNewTicket({
                  title: "",
                  description: "",
                  category: "",
                  priority: "medium",
                  channel: "portal"
                })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitTicket} disabled={creating}>
              {creating ? "Creating..." : "Create Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create SLA Workflow Dialog */}
      <Dialog open={showCreateWorkflowDialog} onOpenChange={setShowCreateWorkflowDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create SLA Workflow</DialogTitle>
            <DialogDescription>
              Configure a new Service Level Agreement workflow for ticket management
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="workflow-name">Workflow Name *</Label>
              <Input
                id="workflow-name"
                placeholder="e.g., Payroll Issues"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="workflow-category">Category *</Label>
                <Select
                  value={newWorkflow.category}
                  onValueChange={(value) => setNewWorkflow({ ...newWorkflow, category: value })}
                >
                  <SelectTrigger id="workflow-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Payroll">Payroll</SelectItem>
                    <SelectItem value="Benefits">Benefits</SelectItem>
                    <SelectItem value="Leave Management">Leave Management</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="IT Support">IT Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workflow-priority">Priority</Label>
                <Select
                  value={newWorkflow.priority}
                  onValueChange={(value) => setNewWorkflow({ ...newWorkflow, priority: value })}
                >
                  <SelectTrigger id="workflow-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sla-hours">SLA Hours *</Label>
              <Input
                id="sla-hours"
                type="number"
                placeholder="24"
                value={newWorkflow.sla_hours}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, sla_hours: parseInt(e.target.value) || 24 })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Escalation Levels</Label>
              {newWorkflow.escalation_levels.map((level, index) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Time (e.g., 4h)"
                    value={level.time}
                    onChange={(e) => {
                      const updated = [...newWorkflow.escalation_levels]
                      updated[index].time = e.target.value
                      setNewWorkflow({ ...newWorkflow, escalation_levels: updated })
                    }}
                  />
                  <Input
                    placeholder="Action"
                    value={level.action}
                    onChange={(e) => {
                      const updated = [...newWorkflow.escalation_levels]
                      updated[index].action = e.target.value
                      setNewWorkflow({ ...newWorkflow, escalation_levels: updated })
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateWorkflowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitWorkflow} disabled={creatingWorkflow}>
              {creatingWorkflow ? "Creating..." : "Create Workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Knowledge Article Dialog */}
      <Dialog open={showCreateArticleDialog} onOpenChange={setShowCreateArticleDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create Knowledge Article</DialogTitle>
            <DialogDescription>
              Create a new knowledge base article to help employees find answers
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="article-title">Title *</Label>
              <Input
                id="article-title"
                placeholder="Enter article title"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="article-content">Content *</Label>
              <Textarea
                id="article-content"
                placeholder="Write the article content..."
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                rows={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="article-category">Category *</Label>
                <Select
                  value={newArticle.category}
                  onValueChange={(value) => setNewArticle({ ...newArticle, category: value })}
                >
                  <SelectTrigger id="article-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Leave Management">Leave Management</SelectItem>
                    <SelectItem value="Payroll">Payroll</SelectItem>
                    <SelectItem value="Benefits">Benefits</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="IT Support">IT Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="article-author">Author</Label>
                <Input
                  id="article-author"
                  placeholder="e.g., HR Team"
                  value={newArticle.author}
                  onChange={(e) => setNewArticle({ ...newArticle, author: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="article-status">Status</Label>
              <Select
                value={newArticle.status}
                onValueChange={(value) => setNewArticle({ ...newArticle, status: value })}
              >
                <SelectTrigger id="article-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateArticleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitArticle} disabled={creatingArticle}>
              {creatingArticle ? "Creating..." : "Create Article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Dialog */}
      <Dialog open={showEditTicketDialog} onOpenChange={setShowEditTicketDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
            <DialogDescription>
              Update ticket information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Payroll">Payroll</SelectItem>
                    <SelectItem value="Benefits">Benefits</SelectItem>
                    <SelectItem value="Leave Management">Leave Management</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="IT Support">IT Support</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                >
                  <SelectTrigger id="edit-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-channel">Channel</Label>
              <Select
                value={newTicket.channel}
                onValueChange={(value) => setNewTicket({ ...newTicket, channel: value })}
              >
                <SelectTrigger id="edit-channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portal">Portal</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditTicketDialog(false)
                setSelectedTicket(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTicket} disabled={editingTicket}>
              {editingTicket ? "Updating..." : "Update Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 