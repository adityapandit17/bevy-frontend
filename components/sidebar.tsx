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
  GraduationCap,
  HelpCircle,
  FolderKanban,
  Target,
  Zap,
  Shirt,
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
import { useAuthContext } from "@/lib/auth"

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
    title: "Organization Chart",
    href: "/org-chart",
    icon: Network,
    segment: "org-chart",
    resourceKeys: ["employees"],
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
    segment: "documents",
    resourceKeys: ["employees", "employee_documents"],
  },
  {
    title: "Recruitment",
    href: "/recruitment",
    icon: Briefcase,
    segment: "recruitment",
    resourceKeys: ["candidates", "interviews"],
  },
  {
    title: "Performance",
    href: "/performance",
    icon: TrendingUp,
    segment: "performance",
    resourceKeys: ["performance_reviews", "performance_goals"],
  },
  {
    title: "Payroll",
    href: "/payroll",
    icon: DollarSign,
    segment: "payroll",
    resourceKeys: ["payrolls", "salary_structures"],
  },
  {
    title: "Attendance & Leave",
    href: "/attendance-leave",
    icon: CalendarCheck,
    segment: "attendance-leave",
    resourceKeys: ["attendance_records", "leave_requests"],
  },
  {
    title: "Learning & Development",
    href: "/learning",
    icon: GraduationCap,
    segment: "learning",
    requiredRolesOr: ["Super Admin"],
  },
  {
    title: "Helpdesk",
    href: "/helpdesk",
    icon: HelpCircle,
    segment: "helpdesk",
    requiredRolesOr: ["Super Admin"],
  },
  {
    title: "Project Management",
    href: "/project-management",
    icon: FolderKanban,
    segment: "project-management",
    requiredRolesOr: ["Super Admin"],
  },
  {
    title: "Scrum Tools",
    href: "/scrum-tools",
    icon: Target,
    segment: "scrum-tools",
    requiredRolesOr: ["Super Admin"],
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
    requiredRolesOr: ["Super Admin", "HR Manager"],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile } = useSidebar()
  const { permissions, roles } = useAuthContext()

  const userResources = React.useMemo(() => {
    console.log('🔍 Sidebar - Raw permissions:', permissions)
    console.log('🔍 Sidebar - Raw roles:', roles)
    
    const set = new Set<string>()
    for (const p of permissions || []) {
      // Handle both string permissions and object permissions
      const name = typeof p === 'string' ? p : (p.name || '')
      // Handle both colon (:) and dot (.) separators
      const res = name.includes(':') ? name.split(':')[0] : 
                  name.includes('.') ? name.split('.')[0] : name
      if (res) set.add(res)
    }
    
    console.log('🔍 Sidebar - Extracted resources:', Array.from(set))
    return set
  }, [permissions])
  
  const roleNames = React.useMemo(() => {
    const roleSet = new Set((roles || []).map(r => r.name))
    console.log('🔍 Sidebar - Role names:', Array.from(roleSet))
    return roleSet
  }, [roles])

  const canSee = (item: NavItem): boolean => {
    console.log(`🔍 Sidebar - Checking item: ${item.title}`)
    console.log(`🔍 Sidebar - Item resourceKeys:`, item.resourceKeys)
    console.log(`🔍 Sidebar - Item requiredRolesOr:`, item.requiredRolesOr)
    
    if (item.segment === "dashboard") {
      console.log(`✅ Sidebar - ${item.title}: Dashboard always visible`)
      return true
    }
    
    if (roleNames.has("Super Admin")) {
      console.log(`✅ Sidebar - ${item.title}: Super Admin bypass`)
      return true
    }
    
    if (item.requiredRolesOr && item.requiredRolesOr.length > 0) {
      const hasAnyRole = item.requiredRolesOr.some(r => roleNames.has(r))
      console.log(`🔍 Sidebar - ${item.title}: Role check - hasAnyRole: ${hasAnyRole}`)
      if (!hasAnyRole) {
        console.log(`❌ Sidebar - ${item.title}: No required role`)
        return false
      }
    }
    
    if (item.resourceKeys && item.resourceKeys.length > 0) {
      const hasAny = item.resourceKeys.some(key => userResources.has(key))
      console.log(`🔍 Sidebar - ${item.title}: Resource check - hasAny: ${hasAny}`)
      if (!hasAny) {
        console.log(`❌ Sidebar - ${item.title}: No required resource`)
        return false
      }
    }
    
    console.log(`✅ Sidebar - ${item.title}: Access granted`)
    return true
  }

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
              {navItems.filter(canSee).map((item) => (
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
