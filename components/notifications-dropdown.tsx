"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCheck, ArrowRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Notification {
  id: string
  type: "leave" | "attendance" | "payroll" | "system" | "announcement" | "reminder"
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface NotificationsDropdownProps {
  children: React.ReactNode
}

// Mock notifications data - replace with API call later
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "leave",
    title: "Leave Request Approved",
    message: "Your leave request for Dec 15-20 has been approved by your manager.",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    actionUrl: "/attendance",
  },
  {
    id: "2",
    type: "attendance",
    title: "Attendance Reminder",
    message: "Don't forget to mark your attendance for today.",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    actionUrl: "/attendance",
  },
  {
    id: "3",
    type: "payroll",
    title: "Payroll Processed",
    message: "Your salary for November has been processed and credited to your account.",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    actionUrl: "/payroll",
  },
  {
    id: "4",
    type: "system",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur on Dec 10 from 2:00 AM to 4:00 AM.",
    read: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: "5",
    type: "announcement",
    title: "Company Holiday",
    message: "The office will be closed on Dec 25 for Christmas holiday.",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "6",
    type: "reminder",
    title: "Performance Review Due",
    message: "Your quarterly performance review is due next week. Please complete it.",
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    actionUrl: "/performance",
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
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  }
}

export function NotificationsDropdown({ children }: NotificationsDropdownProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length
  const topNotifications = notifications.slice(0, 5) // Top 5 notifications

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    )

    // Navigate if action URL exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      setOpen(false)
    }
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleViewAll = () => {
    router.push("/notifications")
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={5}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <DropdownMenuLabel className="p-0 font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            </div>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {topNotifications.length > 0 ? (
            <div className="p-2">
              {topNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative p-3 rounded-lg cursor-pointer transition-colors mb-2",
                    "hover:bg-gray-50",
                    !notification.read && "bg-blue-50/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0",
                        getNotificationColor(notification.type)
                      )}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No notifications</p>
            </div>
          )}
        </ScrollArea>
        {topNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={handleViewAll}
              >
                <span className="text-sm">View all notifications</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

