"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function MobileNav() {
  const pathname = usePathname()

  const getPageTitle = (path: string) => {
    if (path === "/") return "Dashboard"
    if (path === "/dashboard") return "Dashboard"
    if (path.includes("/chat")) return "Chat"
    if (path.includes("/attendance")) return "Attendance"
    if (path.includes("/leave")) return "Leave"
    if (path.includes("/employees")) return "Employees"
    if (path.includes("/recruitment")) return "Recruitment"
    if (path.includes("/payroll")) return "Payroll"
    if (path.includes("/attendance-leave")) return "Attendance & Leave"
    if (path.includes("/notifications")) return "Notifications"
    if (path.includes("/helpdesk")) return "Helpdesk"
    if (path.includes("/documents")) return "Documents"
    if (path.includes("/profile")) return "Profile"
    if (path.includes("/user-settings")) return "Settings"
    if (path.includes("/calendar")) return "Calendar"
    if (path.includes("/events")) return "Events"
    if (path.includes("/learning")) return "Learning"
    if (path.includes("/reports")) return "Reports"
    if (path.includes("/settings")) return "Settings"
    return "BevyHR"
  }

  return (
    <>
      <SidebarTrigger className="text-gray-600 hover:bg-gray-100" />
      <h1 className={`text-base sm:text-lg font-semibold truncate min-w-0 ${pathname === "/" || getPageTitle(pathname) === "BevyHR" ? "text-green-600" : "text-gray-900"}`}>{getPageTitle(pathname)}</h1>
    </>
  )
}
