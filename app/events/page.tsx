"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  Calendar,
  Clock,
  MapPin,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
} from "lucide-react"
import { useAuth } from "@/lib/auth/auth.hooks"
import { format } from "date-fns"

interface Event {
  id: number
  title: string
  description: string
  event_type: string
  start_time: string
  end_time: string
  location: string
  organizer_id?: number
  status: string
  attendee_ids_list: number[]
  formatted_start_time: string
  formatted_end_time: string
  duration_hours: number
  is_upcoming?: boolean
  is_past?: boolean
  is_ongoing?: boolean
  organizer?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
}

export default function EventsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "meeting",
    start_time: "",
    end_time: "",
    location: "",
    status: "scheduled",
    attendee_ids: [] as number[]
  })

  useEffect(() => {
    fetchEvents()
  }, [filterType, filterStatus])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      let url = getApiUrl('events')
      const params = new URLSearchParams()
      
      if (filterType !== "all") {
        params.append('event_type', filterType)
      }
      if (filterStatus === "upcoming") {
        params.append('upcoming', 'true')
      } else if (filterStatus === "past") {
        params.append('past', 'true')
      } else if (filterStatus !== "all") {
        params.append('status', filterStatus)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const data = await apiRequest<Event[]>(url, { method: "GET" })
      setEvents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = () => {
    setNewEvent({
      title: "",
      description: "",
      event_type: "meeting",
      start_time: "",
      end_time: "",
      location: "",
      status: "scheduled",
      attendee_ids: []
    })
    setShowCreateDialog(true)
  }

  const handleSubmitEvent = async () => {
    if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
      alert("Please fill in all required fields")
      return
    }

    // Validate that end time is after start time
    const startTime = new Date(newEvent.start_time)
    const endTime = new Date(newEvent.end_time)
    
    if (endTime <= startTime) {
      alert("End time must be after start time")
      return
    }

    setLoading(true)
    try {
      const url = selectedEvent 
        ? `${getApiUrl('events')}/${selectedEvent.id}`
        : getApiUrl('events')
      
      const method = selectedEvent ? 'PATCH' : 'POST'
      
      await apiRequest(url, {
        method,
        body: JSON.stringify({
          event: {
            ...newEvent,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString()
          }
        })
      })
      
      setShowCreateDialog(false)
      setShowEditDialog(false)
      setSelectedEvent(null)
      fetchEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      // Error message is already shown via toast in apiRequest
    } finally {
      setLoading(false)
    }
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setNewEvent({
      title: event.title,
      description: event.description || "",
      event_type: event.event_type,
      start_time: event.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : "",
      end_time: event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : "",
      location: event.location || "",
      status: event.status,
      attendee_ids: event.attendee_ids_list || []
    })
    setShowEditDialog(true)
  }

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event)
    setShowViewDialog(true)
  }

  const handleDeleteEvent = async (event: Event) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return
    }

    setLoading(true)
    try {
      await apiRequest(`${getApiUrl('events')}/${event.id}`, {
        method: 'DELETE'
      })
      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert("Failed to delete event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getEventTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      meeting: "bg-blue-100 text-blue-800",
      event: "bg-purple-100 text-purple-800",
      training: "bg-green-100 text-green-800",
      workshop: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800"
    }
    return <Badge className={colors[type] || colors.other}>{type}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-gray-100 text-gray-800",
      postponed: "bg-yellow-100 text-yellow-800"
    }
    return <Badge className={colors[status] || colors.scheduled}>{status}</Badge>
  }

  const filteredEvents = events.filter(event => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        event.title.toLowerCase().includes(searchLower) ||
        (event.description && event.description.toLowerCase().includes(searchLower)) ||
        (event.location && event.location.toLowerCase().includes(searchLower))
      )
    }
    return true
  })

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Events & Meetings</h1>
          <p className="text-gray-600">Create and manage scheduled events and meetings</p>
        </div>
        <Button onClick={handleCreateEvent}>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="postponed">Postponed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No events found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{event.title}</p>
                          {event.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getEventTypeBadge(event.event_type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {event.start_time ? format(new Date(event.start_time), "MMM dd, yyyy HH:mm") : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {event.end_time ? format(new Date(event.end_time), "MMM dd, yyyy HH:mm") : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.location ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewEvent(event)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEvent(event)}
                              className="text-red-600"
                            >
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false)
          setShowEditDialog(false)
          setSelectedEvent(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
            <DialogDescription>
              {selectedEvent ? "Update event details" : "Fill in the details to create a new event"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Event description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_type">Event Type *</Label>
                <Select
                  value={newEvent.event_type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={newEvent.status}
                  onValueChange={(value) => setNewEvent({ ...newEvent, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Event location"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false)
              setShowEditDialog(false)
              setSelectedEvent(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEvent} disabled={loading}>
              {loading ? "Saving..." : selectedEvent ? "Update Event" : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>Event Details</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Type</Label>
                  <div className="mt-1">{getEventTypeBadge(selectedEvent.event_type)}</div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedEvent.status)}</div>
                </div>
              </div>
              {selectedEvent.description && (
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Description</Label>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Start Time</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedEvent.start_time ? format(new Date(selectedEvent.start_time), "PPpp") : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-500">End Time</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedEvent.end_time ? format(new Date(selectedEvent.end_time), "PPpp") : "N/A"}
                  </p>
                </div>
              </div>
              {selectedEvent.location && (
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Location</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedEvent.location}</p>
                </div>
              )}
              {selectedEvent.organizer && (
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Organizer</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedEvent.organizer.first_name} {selectedEvent.organizer.last_name}
                  </p>
                </div>
              )}
              {selectedEvent.duration_hours > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Duration</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedEvent.duration_hours} hours</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {selectedEvent && (
              <Button onClick={() => {
                setShowViewDialog(false)
                handleEditEvent(selectedEvent)
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

