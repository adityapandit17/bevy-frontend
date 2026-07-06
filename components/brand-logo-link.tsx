"use client"

import Link from "next/link"
import { useAuthContext } from "@/lib/auth"
import { cn } from "@/lib/utils"

export const BRAND_LOGO = {
  webp: "/bevyhr-logo.webp",
  fallback: "/bevyhr-logo-transparent.png",
  width: 400,
  height: 178,
} as const

interface BrandLogoLinkProps {
  className?: string
  imageClassName?: string
  priority?: boolean
}

export function BrandLogoLink({
  className = "flex items-center shrink-0",
  imageClassName = "h-20 w-auto object-contain",
  priority = false,
}: BrandLogoLinkProps) {
  const { isAuthenticated } = useAuthContext()
  const href = isAuthenticated ? "/dashboard" : "/home"

  return (
    <Link href={href} className={className} aria-label="Go to BevyHR home">
      <picture>
        <source srcSet={BRAND_LOGO.webp} type="image/webp" />
        <img
          src={BRAND_LOGO.fallback}
          alt="BevyHR"
          width={BRAND_LOGO.width}
          height={BRAND_LOGO.height}
          className={cn(imageClassName)}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
        />
      </picture>
    </Link>
  )
}
