"use client"

import { AppSidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { NavUserActions } from "@/components/nav-user-actions"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gray-50 min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm">
          <MobileNav />
          <div className="flex-1" />
          <NavUserActions />
        </header>
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
