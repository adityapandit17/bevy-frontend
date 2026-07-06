"use client"

import { useEffect, useState } from "react"
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
import { apiRequest, getEndpointUrl, API_ENDPOINTS } from "@/lib/api"

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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const data = await apiRequest<Notification[]>(
          getEndpointUrl("NOTIFICATIONS")
        )
        setNotifications(data)
      } catch (error) {
        console.error("Failed to fetch notifications", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Always refresh notifications whenever the dropdown is opened
    if (open && !isLoading) {
      fetchNotifications()
    }
  }, [open])

  const unreadCount = notifications.filter((n) => !n.read).length
  const topNotifications = notifications.slice(0, 5) // Top 5 notifications

  const handleNotificationClick = async (notification: Notification) => {
    // Optimistically mark this notification as read locally
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    )

    // Persist read state to backend – stay on the same page
    if (notification.id && !notification.read) {
      try {
        await apiRequest<Notification>(
          `${getEndpointUrl("NOTIFICATIONS")}/${String(notification.id)}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              notification: { read: true },
            }),
          }
        )
      } catch (error) {
        // Don't show a toast or break UX; just log for debugging
        console.error("Failed to mark notification as read", error)
      }
    }
  }

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

    try {
      await apiRequest<void>(getEndpointUrl("NOTIFICATIONS_MARK_ALL_READ"), {
        method: "PATCH",
      })
    } catch (error) {
      console.error("Failed to mark all notifications as read", error)
    }
  }

  const handleViewAll = () => {
    router.push("/notifications")
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="relative inline-flex">
          {children}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </div>
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

