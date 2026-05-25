"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getApiUrl, publicApiRequest } from "@/lib/api"

type ResolveResponse = {
  success: boolean
  data?: { company_slug: string; job_slug: string }
}

/**
 * Legacy single-segment URLs: /careers/:jobSlug
 * Resolves to /careers/:companySlug/:jobSlug
 */
export default function LegacyCareersRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const segment = params.companySlug as string

  useEffect(() => {
    const resolve = async () => {
      try {
        const res = await publicApiRequest<ResolveResponse>(
          getApiUrl(`api/v1/public/resolve/${segment}`)
        )
        if (res.success && res.data) {
          router.replace(`/careers/${res.data.company_slug}/${res.data.job_slug}`)
          return
        }
      } catch {
        // fall through
      }
      router.replace("/home")
    }
    if (segment) resolve()
  }, [segment, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
