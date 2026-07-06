"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrandLogoLink } from "@/components/brand-logo-link"

interface MarketingShellProps {
  children: React.ReactNode
}

const navLinks = [
  { href: "/home#features", label: "Features", match: null },
  { href: "/home#modules", label: "Modules", match: null },
  { href: "/pricing", label: "Pricing", match: "/pricing" },
  { href: "/home#testimonials", label: "Reviews", match: null },
]

export function MarketingShell({ children }: MarketingShellProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-0">
            <BrandLogoLink imageClassName="h-20 w-auto md:h-20 object-contain" priority />
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      link.match === pathname
                        ? "text-green-600 font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button onClick={() => router.push("/login")} className="bg-green-600 hover:bg-green-700">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <BrandLogoLink imageClassName="h-8 w-auto object-contain" />
              </div>
              <p className="text-gray-400">The complete HR management solution for modern businesses.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/home#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <a href="/home#modules" className="hover:text-white">
                    Modules
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/home" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <a href="mailto:sales@bevyhr.com" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/login" className="hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@bevyhr.com" className="hover:text-white">
                    Help
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} BevyHR. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
