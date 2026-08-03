import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { cn } from "@/lib/utils"
import { LoginLayout } from "@/components/login-layout"
import { AuthProvider } from "@/lib/auth"
import { Toaster } from "@/components/ui/toaster"
import { ErrorSuppressor } from "@/components/error-suppressor"
import { CallProviderRoot } from "@/components/call-provider-root"

export const metadata: Metadata = {
  title: "BevyHR - Human Resource Management System",
  description: "Complete HR Management Solution",
  generator: "Aditya",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/bevyhr-logo.webp" type="image/webp" />
      </head>
      <body className={cn("min-h-screen font-sans antialiased")}>
        <ErrorSuppressor />
        <AuthProvider>
          <CallProviderRoot>
            <LoginLayout>
              {children}
            </LoginLayout>
            <Toaster />
          </CallProviderRoot>
        </AuthProvider>
      </body>
    </html>
  )
}
