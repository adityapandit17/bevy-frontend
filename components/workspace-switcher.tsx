"use client"

import { Building2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthContext } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { getTenantMode } from "@/lib/tenant"

export function WorkspaceSwitcher() {
  const { user, switchWorkspace } = useAuthContext()
  const companies = user?.companies ?? []

  // Subdomain-based multitenancy: tenant is chosen by hostname, not via UI switcher.
  const mode = getTenantMode()
  if (mode.kind !== "root") {
    return null
  }

  if (companies.length <= 1) {
    return null
  }

  const currentId = user?.current_company_id
  const label = user?.current_company?.name ?? "Workspace"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 max-w-[220px] h-9 border-gray-200"
          aria-label="Switch workspace"
        >
          <Building2 className="h-4 w-4 shrink-0 text-gray-600" />
          <span className="truncate text-sm font-medium text-gray-800">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {companies.map((c) => (
          <DropdownMenuItem
            key={c.id}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => switchWorkspace(c.id)}
          >
            <span className="flex-1 truncate">{c.name}</span>
            <span className="text-xs text-muted-foreground shrink-0">{c.code}</span>
            <Check
              className={cn(
                "h-4 w-4 shrink-0 text-green-600",
                currentId === c.id ? "opacity-100" : "opacity-0"
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
