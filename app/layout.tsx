import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TopNav } from "@/components/top-nav"
import { cn } from "@/lib/utils"
import { LoginLayout } from "@/components/login-layout"
import { AuthProvider } from "@/lib/auth"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HRMS Pro - Human Resource Management System",
  description: "Complete HR Management Solution",
    generator: 'Aditya'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen font-sans antialiased", inter.className)}>
        <AuthProvider>
          <LoginLayout>
            {children}
          </LoginLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
