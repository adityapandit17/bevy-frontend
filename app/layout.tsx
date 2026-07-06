import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { LoginLayout } from "@/components/login-layout"
import { AuthProvider } from "@/lib/auth"
import { Toaster } from "@/components/ui/toaster"
import { ErrorSuppressor } from "@/components/error-suppressor"
import { CallProviderRoot } from "@/components/call-provider-root"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BevyHR - Human Resource Management System",
  description: "Complete HR Management Solution",
  generator: "Aditya",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen font-sans antialiased", inter.className)}>
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
