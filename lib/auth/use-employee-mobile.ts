"use client"

import { useAuthContext } from "@/lib/auth"
import { useIsMobile } from "@/components/ui/use-mobile"

const MANAGER_ROLES = new Set([
  "Super Admin",
  "HR Manager",
  "HR",
  "Department Head",
  "IT Asset Manager",
])

/** True for typical employees on phones — minimal UI, quick actions */
export function useEmployeeMobileExperience() {
  const { user, roles, checkRole } = useAuthContext()
  const isMobile = useIsMobile()

  const hasManagerRole =
    Array.from(MANAGER_ROLES).some((name) => checkRole(name)) ||
    roles?.some((r) => {
      const name = typeof r === "string" ? r : r?.name ?? ""
      return MANAGER_ROLES.has(name)
    })

  const isEmployeeUser = Boolean(user?.employee_id) && !hasManagerRole

  return {
    isMobile,
    isEmployeeUser,
    isEmployeeMobile: isMobile && isEmployeeUser,
  }
}
