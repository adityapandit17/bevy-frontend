"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function MobileNav() {
  const pathname = usePathname()

  const getPageTitle = (path: string) => {
    if (path === "/") return "Dashboard"
    if (path.includes("/employees")) return "Employees"
    if (path.includes("/recruitment")) return "Recruitment"
    if (path.includes("/payroll")) return "Payroll"
    if (path.includes("/attendance-leave")) return "Attendance & Leave"
    if (path.includes("/reports")) return "Reports"
    if (path.includes("/settings")) return "Settings"
    return "HRMS Pro"
  }

  return (
    <>
      <SidebarTrigger className="text-gray-600 hover:bg-gray-100" />
      <h1 className="text-lg font-semibold text-gray-900">{getPageTitle(pathname)}</h1>
    </>
  )
}
