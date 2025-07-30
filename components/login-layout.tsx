"use client"

import { usePathname } from "next/navigation"
import { TopNav } from "@/components/top-nav"

interface LoginLayoutProps {
  children: React.ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <>
      <TopNav />
      <main className="pt-16 bg-gray-50 min-h-screen">{children}</main>
    </>
  )
} 