"use client"

import { usePathname } from "next/navigation"
import { useAuthContext } from "@/lib/auth"
import { TopNav } from "@/components/top-nav"
import { SidebarLayout } from "@/components/sidebar-layout"
import { AuthGuard, SubscriptionGuard } from "@/lib/auth"
import { TrialBanner } from "@/components/trial-banner"

interface LoginLayoutProps {
  children: React.ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  const pathname = usePathname()
  const { isAuthenticated, isLoading, dashboardLayout } = useAuthContext()
  
  const isLoginPage = pathname === "/login"
  const isAcceptInvitationPage = pathname === "/accept-invitation"
  const isForgotPasswordPage = pathname === "/forgot-password"
  const isResetPasswordPage = pathname === "/reset-password"
  const isHomePage = pathname === "/home"
  const isPricingPage = pathname === "/pricing"
  const isSignupPage = pathname === "/signup"
  const isTermsPage = pathname === "/terms"
  const isPrivacyPage = pathname === "/privacy"
  const isBillingPage = pathname === "/billing"
  const isRootPage = pathname === "/"
  const isCareersPage = pathname?.startsWith("/careers")

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

  if (isLoginPage || isAcceptInvitationPage || isForgotPasswordPage || isResetPasswordPage || isHomePage || isPricingPage || isSignupPage || isTermsPage || isPrivacyPage || isRootPage || isCareersPage) {
    return <>{children}</>
  }

  if (isBillingPage) {
    return (
      <AuthGuard>
        {children}
      </AuthGuard>
    )
  }

  if (dashboardLayout === "sidebar") {
    return (
      <AuthGuard>
        <SubscriptionGuard>
          <SidebarLayout>{children}</SidebarLayout>
        </SubscriptionGuard>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <SubscriptionGuard>
        <TopNav />
        <div className="pt-16 min-h-screen flex flex-col bg-gray-50">
          <TrialBanner className="sticky top-16 z-40" />
          <main className="flex-1">{children}</main>
        </div>
      </SubscriptionGuard>
    </AuthGuard>
  )
}
