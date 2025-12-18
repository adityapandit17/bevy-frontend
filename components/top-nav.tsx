"use client"

import React, { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  CalendarCheck,
  BarChart,
  Settings,
  Building2,
  Menu,
  X,
  Bell,
  Search,
  User,
  MoreHorizontal as More,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuthContext } from "@/lib/auth"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

type NavItem = {
  title: string
  href: string
  icon: any
  segment: string
  resourceKeys?: string[]
  requiredRolesOr?: string[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    segment: "dashboard",
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
    segment: "employees",
    resourceKeys: ["employees"],
  },
  {
    title: "Recruitment",
    href: "/recruitment",
    icon: Briefcase,
    segment: "recruitment",
    resourceKeys: ["candidates", "interviews"],
  },
  {
    title: "Payroll",
    href: "/payroll",
    icon: DollarSign,
    segment: "payroll",
    resourceKeys: ["payrolls", "salary_structures"],
  },
  {
    title: "Attendance",
    href: "/attendance-leave",
    icon: CalendarCheck,
    segment: "attendance-leave",
    resourceKeys: ["attendance_records", "leave_requests"],
  },
  {
    title: "Leave Management",
    href: "/leave-management",
    icon: CalendarCheck,
    segment: "leave-management",
    resourceKeys: ["leave_management"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart,
    segment: "reports",
    resourceKeys: ["reports"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    segment: "settings",
    resourceKeys: ["settings"],
  },
]

export function TopNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNavExpanded, setIsNavExpanded] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, permissions, roles } = useAuthContext()

  const userResources = React.useMemo(() => {
    
    const set = new Set<string>()
    for (const p of permissions || []) {
      // Handle both string permissions and object permissions
      const name = typeof p === 'string' ? p : (p.name || '')
      // Handle both colon (:) and dot (.) separators
      const res = name.includes(':') ? name.split(':')[0] : 
                  name.includes('.') ? name.split('.')[0] : name
      if (res) set.add(res)
    }
    
    return set
  }, [permissions])
  
  const roleNames = React.useMemo(() => {
    const roleSet = new Set((roles || []).map(r => r.name))
    return roleSet
  }, [roles])

  const canSee = (item: NavItem): boolean => {    
    if (item.segment === "dashboard") {
      return true
    }
    
    if (item.requiredRolesOr && item.requiredRolesOr.length > 0) {
      const hasAnyRole = item.requiredRolesOr.some(r => roleNames.has(r))
      if (!hasAnyRole) {
        return false
      }
    }
    
    if (item.resourceKeys && item.resourceKeys.length > 0) {
      const hasAny = item.resourceKeys.some(key => userResources.has(key))
      if (!hasAny) {
        return false
      }
    }
    
    return true
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false)
  }

  const isActive = (item: (typeof navItems)[0]) => {
    return pathname === item.href || (item.segment !== "dashboard" && pathname.includes(item.segment))
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm" role="navigation" aria-label="Top Navigation">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center min-h-16 py-2 gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">HRMS Pro</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className={cn(
            "hidden lg:flex items-center gap-1",
            isNavExpanded ? "flex-wrap" : "overflow-x-auto"
          )} id="desktop-nav">
            {(() => {
              const filteredItems = navItems.filter(canSee);
              return filteredItems;
            })().map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive(item)
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Button>
            ))}
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-2">
            {/* Search - Hidden on mobile */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search..." className="pl-10 w-64 h-9 bg-gray-50 border-gray-200 focus:bg-white" />
            </div>

            {/* Notifications */}
            <NotificationsDropdown>
              <Button variant="ghost" size="sm" className="relative" aria-label="Notifications">
                <Bell className="w-5 h-5 text-gray-600" />
              </Button>
            </NotificationsDropdown>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2" aria-label="Account menu">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name || 'Admin'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/user-settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/helpdesk')}>
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white fixed top-16 left-0 right-0 z-40 shadow-sm max-h-[60vh] overflow-auto">
          <div className="px-4 py-2 space-y-1">
            {/* Mobile Search */}
            <div className="md:hidden mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search..." className="pl-10 w-full h-9 bg-gray-50 border-gray-200" />
              </div>
            </div>

            {navItems.filter(canSee).map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2 text-sm font-medium rounded-md",
                  isActive(item)
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
