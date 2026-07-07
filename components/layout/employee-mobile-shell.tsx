"use client"

import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useEmployeeMobileExperience } from "@/lib/auth/use-employee-mobile"
import { EmployeeMobileBottomNav } from "@/components/layout/employee-mobile-bottom-nav"
import { Suspense } from "react"

export function EmployeeMobileShell({ children }: { children: React.ReactNode }) {
  const { isEmployeeMobile } = useEmployeeMobileExperience()
  const pathname = usePathname()
  const showBottomNav = isEmployeeMobile && !pathname.startsWith("/chat")

  return (
    <>
      <div
        className={cn(
          showBottomNav && "pb-[calc(3.75rem+env(safe-area-inset-bottom))]"
        )}
      >
        {children}
      </div>
      {showBottomNav && (
        <Suspense fallback={null}>
          <EmployeeMobileBottomNav />
        </Suspense>
      )}
    </>
  )
}
