"use client"

import { usePathname } from "next/navigation"
import { useAuthContext } from "@/lib/auth"
import { TopNav } from "@/components/top-nav"
import { AuthGuard } from "@/lib/auth"

interface LoginLayoutProps {
  children: React.ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuthContext()
  
  const isLoginPage = pathname === "/login"
  const isHomePage = pathname === "/home"
  const isRootPage = pathname === "/"

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Public pages (login, home, root)
  if (isLoginPage || isHomePage || isRootPage) {
    return <>{children}</>
  }

  // Protected pages - require authentication
  return (
    <AuthGuard>
      <TopNav />
      <main className="pt-16 bg-gray-50 min-h-screen">{children}</main>
    </AuthGuard>
  )
} 