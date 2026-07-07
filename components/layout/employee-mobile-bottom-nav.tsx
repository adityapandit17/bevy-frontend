"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  Home,
  Clock,
  CalendarPlus,
  MessageSquare,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/lib/auth"

const PRIMARY_NAV = [
  { href: "/dashboard", label: "Home", icon: Home, id: "home" as const },
  { href: "/attendance", label: "Time", icon: Clock, id: "time" as const },
  {
    href: "/attendance?tab=leave-requests&apply=leave",
    label: "Leave",
    icon: CalendarPlus,
    id: "leave" as const,
  },
  { href: "/chat", label: "Chat", icon: MessageSquare, id: "chat" as const },
] as const

function navItemActive(
  id: (typeof PRIMARY_NAV)[number]["id"],
  pathname: string,
  tab: string | null
): boolean {
  if (id === "home") return pathname === "/dashboard" || pathname === "/"
  if (id === "chat") return pathname.startsWith("/chat")
  if (id === "leave") {
    return pathname.startsWith("/attendance") && (tab === "leave-requests" || tab === "leave-balance")
  }
  if (id === "time") {
    return pathname.startsWith("/attendance") && tab !== "leave-requests" && tab !== "leave-balance"
  }
  return false
}

const MORE_LINKS = [
  { href: "/notifications", label: "Notifications" },
  { href: "/calendar", label: "Calendar" },
  { href: "/documents", label: "Documents" },
  { href: "/helpdesk", label: "Helpdesk" },
  { href: "/profile", label: "Profile" },
  { href: "/user-settings", label: "Settings" },
]

export function EmployeeMobileBottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")
  const { user } = useAuthContext()

  if (pathname.startsWith("/chat")) {
    return null
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]"
      aria-label="Employee quick navigation"
    >
      <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon
          const active = navItemActive(item.id, pathname, tab)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium min-w-0 px-1",
                active ? "text-green-700" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active && "text-green-600")} />
              <span className="truncate w-full text-center">{item.label}</span>
            </Link>
          )
        })}

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground min-w-0 px-1"
            >
              <Menu className="h-5 w-5" />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
            <SheetHeader>
              <SheetTitle className="text-left">
                {user?.name?.split(" ")[0] ? `Hi, ${user.name.split(" ")[0]}` : "Menu"}
              </SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {MORE_LINKS.map((link) => (
                <Button key={link.href} variant="outline" className="justify-start h-11" asChild>
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
