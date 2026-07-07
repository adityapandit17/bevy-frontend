"use client"

import { useState, useEffect } from "react"
import { apiRequest, getEndpointUrl } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  PartyPopper,
  Building2,
  Info,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  X,
} from "lucide-react"
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns"
import { useAuth } from "@/lib/auth/auth.hooks"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

interface Event {
  id: number
  title: string
  description: string
  event_type: string
  start_time: string
  end_time: string
  location?: string
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

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
}

export default function CalendarPage() {
  const { user, checkRole } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string>("")
  const [updatingAttendees, setUpdatingAttendees] = useState(false)

  // Check if user can manage attendees (event creator or super admin)
  const canManageAttendees = (event: Event | null) => {
    if (!event || !user || !user.id) return false
    
    const isSuperAdmin = checkRole("Super Admin")
    const isEventCreator = Number(user.id) === Number(event.organizer_id)
    
    return isSuperAdmin || isEventCreator
  }

  useEffect(() => {
    fetchEvents()
  }, [currentMonth])

  useEffect(() => {
    if (showEventDialog && selectedEvent) {
      fetchEmployees()
    }
  }, [showEventDialog, selectedEvent])

  const fetchEmployees = async () => {
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
    }
  }

  const handleAddAttendee = async () => {
    if (!selectedEvent || !selectedAttendeeId) return

    // Check permissions
    if (!canManageAttendees(selectedEvent)) {
      toast({
        title: "Permission Denied",
        description: "Only the event creator or Super Admin can add attendees",
        variant: "destructive",
      })
      return
    }

    const attendeeId = parseInt(selectedAttendeeId)
    if (selectedEvent.attendee_ids_list.includes(attendeeId)) {
      toast({
        title: "Already added",
        description: "This attendee is already added to the event",
        variant: "default",
      })
      return
    }

    setUpdatingAttendees(true)
    try {
      const updatedAttendees = [...selectedEvent.attendee_ids_list, attendeeId]
      
      const response = await apiRequest<Event>(
        `${getEndpointUrl('EVENTS')}/${selectedEvent.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            event: {
              attendee_ids: updatedAttendees
            }
          }),
        }
      )

      // Update the event in state
      const updatedEvent = Array.isArray(response) ? response[0] : response
      setSelectedEvent(updatedEvent)
      setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e))
      setSelectedAttendeeId("")
      
      toast({
        title: "Success",
        description: "Attendee added successfully",
        variant: "default",
      })
    } catch (error: any) {
      console.error('Error adding attendee:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to add attendee",
        variant: "destructive",
      })
    } finally {
      setUpdatingAttendees(false)
    }
  }

  const handleRemoveAttendee = async (attendeeId: number) => {
    if (!selectedEvent) return

    // Check permissions
    if (!canManageAttendees(selectedEvent)) {
      toast({
        title: "Permission Denied",
        description: "Only the event creator or Super Admin can remove attendees",
        variant: "destructive",
      })
      return
    }

    setUpdatingAttendees(true)
    try {
      const updatedAttendees = selectedEvent.attendee_ids_list.filter(id => id !== attendeeId)
      
      const response = await apiRequest<Event>(
        `${getEndpointUrl('EVENTS')}/${selectedEvent.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            event: {
              attendee_ids: updatedAttendees
            }
          }),
        }
      )

      // Update the event in state
      const updatedEvent = Array.isArray(response) ? response[0] : response
      setSelectedEvent(updatedEvent)
      setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e))
      
      toast({
        title: "Success",
        description: "Attendee removed successfully",
        variant: "default",
      })
    } catch (error: any) {
      console.error('Error removing attendee:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to remove attendee",
        variant: "destructive",
      })
    } finally {
      setUpdatingAttendees(false)
    }
  }

  const getEmployeeName = (id: number) => {
    const emp = employees.find(e => e.id === id)
    return emp ? `${emp.first_name} ${emp.last_name}` : `Employee #${id}`
  }

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const startDate = startOfMonth(currentMonth)
      const endDate = endOfMonth(currentMonth)
      
      const params = new URLSearchParams({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        show_all: 'true'
      })
      
      const url = `${getEndpointUrl('EVENTS')}?${params.toString()}`

      const response = await apiRequest<Event[]>(url, {
        method: 'GET',
      })

      // Handle both array response and wrapped response
      if (Array.isArray(response)) {
        setEvents(response)
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        setEvents(response.data)
      } else {
        setEvents([])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const date = format(parseISO(event.start_time), 'yyyy-MM-dd')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(event)
    return acc
  }, {} as Record<string, Event[]>)

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return eventsByDate[dateStr] || []
  }

  // Check if date has holiday
  const hasHoliday = (date: Date) => {
    const dateEvents = getEventsForDate(date)
    return dateEvents.some(e => 
      e.event_type === 'holiday' || 
      e.title.toLowerCase().includes('holiday') ||
      e.title.toLowerCase().includes('public holiday')
    )
  }

  // Get calendar days for current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'holiday':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'event':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'meeting':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'training':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'holiday':
        return <PartyPopper className="h-3 w-3" />
      case 'event':
        return <Building2 className="h-3 w-3" />
      case 'meeting':
        return <Users className="h-3 w-3" />
      case 'training':
        return <Info className="h-3 w-3" />
      default:
        return <CalendarIcon className="h-3 w-3" />
    }
  }

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'holiday':
        return <Badge variant="destructive" className="text-xs">Holiday</Badge>
      case 'event':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Company Event</Badge>
      case 'meeting':
        return <Badge className="bg-green-100 text-green-800 text-xs">Meeting</Badge>
      case 'training':
        return <Badge className="bg-purple-100 text-purple-800 text-xs">Training</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Event</Badge>
    }
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-green-600 shrink-0" />
              Company Calendar
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              View holidays and company-wide events
            </p>
          </div>
        </div>

        {/* Large Calendar View */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="overflow-x-auto sm:mx-0">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden min-w-[560px]">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-700"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((day, dayIdx) => {
                const dayEvents = getEventsForDate(day)
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isToday = isSameDay(day, new Date())
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isHoliday = hasHoliday(day)

                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      "min-h-[72px] sm:min-h-[120px] bg-white border-r border-b border-gray-200 p-1.5 sm:p-2 flex flex-col",
                      !isCurrentMonth && "bg-gray-50",
                      isToday && "bg-green-50 border-green-300",
                      isSelected && "ring-2 ring-green-500 ring-inset",
                      isHoliday && "bg-red-50"
                    )}
                    onClick={() => setSelectedDate(day)}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isToday && "bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center",
                          !isCurrentMonth && "text-gray-400",
                          isCurrentMonth && !isToday && "text-gray-700"
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayEvents.length > 0 && (
                        <Badge variant="secondary" className="text-xs h-5 px-1.5">
                          {dayEvents.length}
                        </Badge>
                      )}
                    </div>

                    {/* Events List */}
                    <div className="flex-1 overflow-y-auto space-y-1">
                      {dayEvents.slice(0, 4).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "text-xs p-1.5 rounded border cursor-pointer hover:opacity-80 transition-opacity truncate",
                            getEventTypeColor(event.event_type)
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEvent(event)
                            setShowEventDialog(true)
                          }}
                          title={event.title}
                        >
                          <div className="flex items-center gap-1">
                            {getEventTypeIcon(event.event_type)}
                            <span className="font-medium truncate">
                              {format(parseISO(event.start_time), 'h:mm a')}
                            </span>
                          </div>
                          <div className="truncate font-semibold mt-0.5">
                            {event.title}
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 4 && (
                        <div className="text-xs text-gray-500 font-medium px-1.5">
                          +{dayEvents.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Legend</h4>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
                  <span>Holidays</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300"></div>
                  <span>Company Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
                  <span>Meetings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-100 border-2 border-purple-300"></div>
                  <span>Training</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected day events — easier to tap on mobile than tiny calendar cells */}
        {selectedDate && (
          <Card className="md:hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {format(selectedDate, "EEEE, MMMM d")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-gray-500">No events on this day</p>
              ) : (
                getEventsForDate(selectedDate).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-opacity hover:opacity-90",
                      getEventTypeColor(event.event_type)
                    )}
                    onClick={() => {
                      setSelectedEvent(event)
                      setShowEventDialog(true)
                    }}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {getEventTypeIcon(event.event_type)}
                      {format(parseISO(event.start_time), "h:mm a")}
                    </div>
                    <p className="font-semibold mt-1">{event.title}</p>
                    {event.location && (
                      <p className="text-xs mt-1 flex items-center gap-1 opacity-80">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    )}
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Event Detail Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedEvent && getEventTypeIcon(selectedEvent.event_type)}
                {selectedEvent?.title}
              </DialogTitle>
              <DialogDescription>
                {selectedEvent && getEventTypeBadge(selectedEvent.event_type)}
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Start Time</p>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(selectedEvent.start_time), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">End Time</p>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(selectedEvent.end_time), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                {selectedEvent.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location
                    </p>
                    <p className="text-sm text-gray-600">{selectedEvent.location}</p>
                  </div>
                )}
                {selectedEvent.organizer && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Organizer
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedEvent.organizer.first_name} {selectedEvent.organizer.last_name}
                    </p>
                  </div>
                )}
                {selectedEvent.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Description</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}
                
                {/* Attendees Section */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Attendees ({selectedEvent.attendee_ids_list.length})
                    </p>
                  </div>
                  
                  {/* Add Attendee - Only show if user can manage */}
                  {canManageAttendees(selectedEvent) ? (
                    <>
                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <Select value={selectedAttendeeId} onValueChange={setSelectedAttendeeId}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select employee to add" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees
                              .filter(emp => !selectedEvent.attendee_ids_list.includes(emp.id))
                              .map((emp) => (
                                <SelectItem key={emp.id} value={emp.id.toString()}>
                                  {emp.first_name} {emp.last_name} ({emp.email})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleAddAttendee}
                          disabled={!selectedAttendeeId || updatingAttendees}
                          size="sm"
                          className="flex-1 sm:flex-none"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                      <p className="text-sm text-yellow-800">
                        Only the event creator or Super Admin can manage attendees for this event.
                      </p>
                    </div>
                  )}

                  {/* Attendees List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedEvent.attendee_ids_list.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No attendees added yet</p>
                    ) : (
                      selectedEvent.attendee_ids_list.map((attendeeId) => (
                        <div
                          key={attendeeId}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm text-gray-700">
                            {getEmployeeName(attendeeId)}
                          </span>
                          {canManageAttendees(selectedEvent) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAttendee(attendeeId)}
                              disabled={updatingAttendees}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3 text-red-500" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Badge variant={selectedEvent.status === 'scheduled' ? 'default' : 'secondary'}>
                    {selectedEvent.status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Duration: {selectedEvent.duration_hours} hours
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
