"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getApiUrl, apiRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  User,
  Mail,
  Phone,
  Tag,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Edit,
  Send,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth/auth.hooks"

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
  updated_at: string
  assigned_to?: { id: number; first_name: string; last_name: string; email: string }
  requester?: { id: number; first_name: string; last_name: string; email: string }
}

interface TicketComment {
  id: number
  content: string
  author_name: string
  author_email?: string
  created_at: string
  updated_at: string
  user?: { id: number; first_name: string; last_name: string; email: string }
  employee?: { id: number; first_name: string; last_name: string; email: string }
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const ticketId = params?.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<TicketComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editTicket, setEditTicket] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    status: "open",
    channel: "portal"
  })

  useEffect(() => {
    if (ticketId) {
      fetchTicket()
      fetchComments()
    }
  }, [ticketId])

  const fetchTicket = async () => {
    setLoading(true)
    try {
      const data = await apiRequest<Ticket>(`${getApiUrl('helpdesk_tickets')}/${ticketId}`, {
        method: "GET"
      })
      setTicket(data)
      setEditTicket({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: data.status,
        channel: data.channel
      })
    } catch (err) {
      console.error('Error fetching ticket:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const url = `${getApiUrl('helpdesk_tickets')}/${ticketId}/ticket_comments`
      const data = await apiRequest<TicketComment[]>(url, {
        method: "GET"
      })
      setComments(data)
    } catch (err) {
      console.error('Error fetching comments:', err)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert("Please enter a comment")
      return
    }

    setCommentLoading(true)
    try {
      const url = `${getApiUrl('helpdesk_tickets')}/${ticketId}/ticket_comments`
      const data = await apiRequest<TicketComment>(url, {
        method: "POST",
        body: JSON.stringify({
          ticket_comment: {
            content: newComment
          }
        })
      })
      setComments([...comments, data])
      setNewComment("")
    } catch (err) {
      console.error('Error adding comment:', err)
      alert("Failed to add comment. Please try again.")
    } finally {
      setCommentLoading(false)
    }
  }

  const handleUpdateTicket = async () => {
    if (!ticket) return

    setLoading(true)
    try {
      await apiRequest(`${getApiUrl('helpdesk_tickets')}/${ticket.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          helpdesk_ticket: editTicket
        })
      })
      fetchTicket()
      setShowEditDialog(false)
    } catch (err) {
      console.error('Error updating ticket:', err)
      alert("Failed to update ticket. Please try again.")
    } finally {
      setLoading(false)
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
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return formatDate(dateString)
  }

  if (loading && !ticket) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Ticket not found</p>
            <Button onClick={() => router.push('/helpdesk')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Helpdesk
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/helpdesk')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{ticket.title}</h1>
            <div className="flex items-center gap-2">
              {getPriorityBadge(ticket.priority)}
              {getStatusBadge(ticket.status)}
            </div>
          </div>
          <p className="text-gray-600 mt-1">Ticket #{ticket.id}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Ticket
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-500">Description</Label>
                <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {ticket.tags_list && ticket.tags_list.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ticket.tags_list.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments & Activity
              </CardTitle>
              <CardDescription>Track work done on this ticket</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Comment Form */}
              <div className="space-y-2">
                <Label htmlFor="comment">Add Comment</Label>
                <Textarea
                  id="comment"
                  placeholder="Describe the work done or add updates..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleAddComment} disabled={commentLoading || !newComment.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  {commentLoading ? "Posting..." : "Post Comment"}
                </Button>
              </div>

              {/* Comments Timeline */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No comments yet. Be the first to add one!</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {comments.map((comment, index) => (
                      <div key={comment.id} className="relative pl-12 pb-6">
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-1 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        
                        {/* Comment content */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{comment.author_name}</p>
                              {comment.author_email && (
                                <p className="text-xs text-gray-500">{comment.author_email}</p>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatRelativeTime(comment.created_at)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(comment.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase">Status</Label>
                <div className="mt-1">{getStatusBadge(ticket.status)}</div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase">Priority</Label>
                <div className="mt-1">{getPriorityBadge(ticket.priority)}</div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase">Category</Label>
                <p className="text-sm text-gray-900 mt-1">{ticket.category}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase">Channel</Label>
                <p className="text-sm text-gray-900 mt-1 capitalize">{ticket.channel}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase">SLA</Label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-medium">{ticket.sla_display}</span>
                  {getSLAStatusBadge(ticket.sla_status)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* People */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">People</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase">Requester</Label>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {ticket.requester_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ticket.requester_name}</p>
                    {ticket.requester?.email && (
                      <p className="text-xs text-gray-500">{ticket.requester.email}</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase">Assigned To</Label>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {ticket.assigned_to_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ticket.assigned_to_name}</p>
                    {ticket.assigned_to?.email && (
                      <p className="text-xs text-gray-500">{ticket.assigned_to.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase">Created</Label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(ticket.created_at)}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase">Last Updated</Label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(ticket.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Ticket Dialog */}
      {showEditDialog && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <CardContent className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Ticket</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={editTicket.title}
                  onChange={(e) => setEditTicket({ ...editTicket, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={editTicket.description}
                  onChange={(e) => setEditTicket({ ...editTicket, description: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={editTicket.category}
                    onChange={(e) => setEditTicket({ ...editTicket, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <select
                    id="edit-priority"
                    value={editTicket.priority}
                    onChange={(e) => setEditTicket({ ...editTicket, priority: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <select
                    id="edit-status"
                    value={editTicket.status}
                    onChange={(e) => setEditTicket({ ...editTicket, status: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-channel">Channel</Label>
                  <select
                    id="edit-channel"
                    value={editTicket.channel}
                    onChange={(e) => setEditTicket({ ...editTicket, channel: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="portal">Portal</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateTicket} disabled={loading}>
                  {loading ? "Updating..." : "Update Ticket"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

