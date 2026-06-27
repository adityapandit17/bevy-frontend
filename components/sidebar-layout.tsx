"use client"

import { AppSidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { NavUserActions } from "@/components/nav-user-actions"
import { TrialBanner } from "@/components/trial-banner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gray-50 min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm">
          <MobileNav />
          <div className="flex-1" />
          <NavUserActions />
        </header>
        <TrialBanner className="sticky top-16 z-30 shrink-0" />
        <main className="flex-1 min-h-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
