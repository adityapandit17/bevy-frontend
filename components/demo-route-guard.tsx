"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isDemoRoutesEnabled } from "@/lib/demo-routes"

interface DemoRouteGuardProps {
  children: React.ReactNode
}

/** Redirects demo pages to dashboard when not in development. */
export function DemoRouteGuard({ children }: DemoRouteGuardProps) {
  const router = useRouter()

  useEffect(() => {
    if (!isDemoRoutesEnabled()) {
      router.replace("/dashboard")
    }
  }, [router])

  if (!isDemoRoutesEnabled()) {
    return null
  }

  return <>{children}</>
}
