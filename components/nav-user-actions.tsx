"use client"

import { useRouter } from "next/navigation"
import { Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { useAuthContext } from "@/lib/auth"

export function NavUserActions() {
  const router = useRouter()
  const { user, logout } = useAuthContext()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex items-center gap-2">
      <NotificationsDropdown>
        <Button variant="ghost" size="sm" className="relative" aria-label="Notifications">
          <Bell className="w-5 h-5 text-gray-600" />
        </Button>
      </NotificationsDropdown>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2" aria-label="Account menu">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name || "User"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/user-settings")}>Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/helpdesk")}>Help & Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
