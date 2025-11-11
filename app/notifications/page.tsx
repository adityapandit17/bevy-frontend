"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, CheckCheck, Trash2, Search, Filter, Clock, ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Notification } from "@/components/notifications-dropdown"

// Mock notifications data - replace with API call later
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "leave",
    title: "Leave Request Approved",
    message: "Your leave request for Dec 15-20 has been approved by your manager.",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    actionUrl: "/attendance",
  },
  {
    id: "2",
    type: "attendance",
    title: "Attendance Reminder",
    message: "Don't forget to mark your attendance for today.",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    actionUrl: "/attendance",
  },
  {
    id: "3",
    type: "payroll",
    title: "Payroll Processed",
    message: "Your salary for November has been processed and credited to your account.",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/payroll",
  },
  {
    id: "4",
    type: "system",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur on Dec 10 from 2:00 AM to 4:00 AM.",
    read: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    type: "announcement",
    title: "Company Holiday",
    message: "The office will be closed on Dec 25 for Christmas holiday.",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "6",
    type: "reminder",
    title: "Performance Review Due",
    message: "Your quarterly performance review is due next week. Please complete it.",
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/performance",
  },
  {
    id: "7",
    type: "leave",
    title: "Leave Request Pending",
    message: "Your leave request for Dec 22-24 is pending approval from your manager.",
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/attendance",
  },
  {
    id: "8",
    type: "attendance",
    title: "Late Attendance Alert",
    message: "You marked your attendance late today. Please ensure timely attendance.",
    read: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/attendance",
  },
  {
    id: "9",
    type: "payroll",
    title: "Payslip Available",
    message: "Your payslip for October is now available. You can download it from the payroll section.",
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/payroll",
  },
  {
    id: "10",
    type: "system",
    title: "Password Reset Required",
    message: "For security reasons, please reset your password. It's been 90 days since your last password change.",
    read: false,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/user-settings",
  },
  {
    id: "11",
    type: "announcement",
    title: "Team Meeting Scheduled",
    message: "A team meeting has been scheduled for Dec 12 at 2:00 PM. Please confirm your attendance.",
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "12",
    type: "reminder",
    title: "Document Submission Reminder",
    message: "Please submit your updated insurance documents by Dec 15.",
    read: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "13",
    type: "leave",
    title: "Leave Balance Update",
    message: "Your leave balance has been updated. You now have 12 days of annual leave remaining.",
    read: false,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/attendance",
  },
  {
    id: "14",
    type: "attendance",
    title: "Attendance Regularized",
    message: "Your attendance for Nov 28 has been regularized by HR.",
    read: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/attendance",
  },
  {
    id: "15",
    type: "payroll",
    title: "Tax Document Available",
    message: "Your tax documents for the financial year are now available for download.",
    read: false,
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/payroll",
  },
]

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "leave":
      return "📅"
    case "attendance":
      return "⏰"
    case "payroll":
      return "💰"
    case "system":
      return "⚙️"
    case "announcement":
      return "📢"
    case "reminder":
      return "🔔"
    default:
      return "🔔"
  }
}

const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "leave":
      return "bg-blue-100 text-blue-700"
    case "attendance":
      return "bg-yellow-100 text-yellow-700"
    case "payroll":
      return "bg-green-100 text-green-700"
    case "system":
      return "bg-gray-100 text-gray-700"
    case "announcement":
      return "bg-purple-100 text-purple-700"
    case "reminder":
      return "bg-orange-100 text-orange-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "Just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? "s" : ""} ago`
  }
}

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(mockNotifications)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterRead, setFilterRead] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    let filtered = [...notifications]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((n) => n.type === filterType)
    }

    // Filter by read status
    if (filterRead !== "all") {
      filtered = filtered.filter((n) => (filterRead === "read" ? n.read : !n.read))
    }

    setFilteredNotifications(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [notifications, searchTerm, filterType, filterRead])

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete all notifications?")) {
      setNotifications([])
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">
          Manage and view all your notifications ({notifications.length} total, {unreadCount} unread)
        </p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="outline" onClick={handleDeleteAll}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete all
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredNotifications.length)} of{" "}
            {filteredNotifications.length} notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedNotifications.length > 0 ? (
            <div className="space-y-3">
              {paginatedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors",
                    !notification.read && "bg-blue-50/50 border-blue-200"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0",
                        getNotificationColor(notification.type)
                      )}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                              <span className="mx-1">•</span>
                              <span>{formatFullDate(notification.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-8"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-sm text-gray-500">
                {searchTerm || filterType !== "all" || filterRead !== "all"
                  ? "Try adjusting your filters"
                  : "You're all caught up!"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>
                    }
                    return null
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

