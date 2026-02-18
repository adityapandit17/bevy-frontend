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
} from "lucide-react"
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns"
import { useAuth } from "@/lib/auth/auth.hooks"
import { cn } from "@/lib/utils"

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

export default function CalendarPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetchEvents()
  }, [currentMonth])

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

      if (response.success && response.data) {
        setEvents(response.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
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
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-green-600" />
              Company Calendar
            </h1>
            <p className="text-gray-600 mt-1">
              View holidays and company-wide events
            </p>
          </div>
        </div>

        {/* Large Calendar View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
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
          <CardContent>
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
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
                      "min-h-[120px] bg-white border-r border-b border-gray-200 p-2 flex flex-col",
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

        {/* Event Detail Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="max-w-2xl">
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
                <div className="grid grid-cols-2 gap-4">
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
