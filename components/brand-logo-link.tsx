"use client"

import Image from "next/image"
import Link from "next/link"
import { useAuthContext } from "@/lib/auth"

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
      <Image
        src="/bevyhr-logo.png"
        alt="BevyHR"
        width={1024}
        height={455}
        className={imageClassName}
        style={{ imageRendering: "auto" }}
        priority={priority}
      />
    </Link>
  )
}
