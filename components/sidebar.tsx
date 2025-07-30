"use client"

import type * as React from "react"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  CalendarCheck,
  BarChart,
  Settings,
  Building2,
  TrendingUp,
  Network,
  FileText,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    segment: "dashboard",
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
    segment: "employees",
  },
  {
    title: "Organization Chart",
    href: "/org-chart",
    icon: Network,
    segment: "org-chart",
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
    segment: "documents",
  },
  {
    title: "Recruitment",
    href: "/recruitment",
    icon: Briefcase,
    segment: "recruitment",
  },
  {
    title: "Performance",
    href: "/performance",
    icon: TrendingUp,
    segment: "performance",
  },
  {
    title: "Payroll",
    href: "/payroll",
    icon: DollarSign,
    segment: "payroll",
  },
  {
    title: "Attendance & Leave",
    href: "/attendance-leave",
    icon: CalendarCheck,
    segment: "attendance-leave",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart,
    segment: "reports",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    segment: "settings",
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile } = useSidebar()

  const handleNavigation = (href: string) => {
    router.push(href)
    setOpenMobile(false)
  }

  return (
    <Sidebar className="bg-white border-r border-gray-200" collapsible="offcanvas" {...props}>
      <SidebarHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">HRMS Pro</h1>
            <p className="text-gray-500 text-sm">HR Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.href || (item.segment !== "dashboard" && pathname.includes(item.segment))
                    }
                    className={cn(
                      "text-gray-600 hover:bg-green-50 hover:text-green-700 transition-all duration-200 rounded-lg mx-2 my-1",
                      (pathname === item.href || (item.segment !== "dashboard" && pathname.includes(item.segment))) &&
                        "bg-green-100 text-green-700 font-medium",
                    )}
                  >
                    <button onClick={() => handleNavigation(item.href)} className="flex items-center gap-3 w-full p-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>System Online</span>
        </div>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}
