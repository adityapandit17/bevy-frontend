"use client"

import { AppSidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { NavUserActions } from "@/components/nav-user-actions"
import { TrialBanner } from "@/components/trial-banner"
import { EmployeeMobileShell } from "@/components/layout/employee-mobile-shell"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEmployeeMobileExperience } from "@/lib/auth/use-employee-mobile"
import { BrandLogoLink } from "@/components/brand-logo-link"

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { isEmployeeMobile } = useEmployeeMobileExperience()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gray-50 min-h-screen">
        <header className="sticky top-0 z-40 flex h-14 md:h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm">
          {isEmployeeMobile ? (
            <BrandLogoLink className="h-8" />
          ) : (
            <MobileNav />
          )}
          <div className="flex-1" />
          <NavUserActions />
        </header>
        <TrialBanner />
        <main className="hrms-app-main">
          <EmployeeMobileShell>{children}</EmployeeMobileShell>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
