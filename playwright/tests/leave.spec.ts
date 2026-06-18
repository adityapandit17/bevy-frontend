import { test, expect } from "@playwright/test"
import { visitHrmsAuthenticated } from "../helpers/auth"

test.describe("Leave management", () => {
  test("HR can open leave management", async ({ page, request }) => {
    await visitHrmsAuthenticated(request, page, "/leave-management", "hr")

    await expect(page.getByRole("heading", { name: "Leave Management" })).toBeVisible()
  })

  test("employee can open leave section from attendance page", async ({ page, request }) => {
    await visitHrmsAuthenticated(request, page, "/attendance-leave", "employee")

    const leaveTab = page.getByRole("tab", { name: /leave/i })
    if (await leaveTab.isVisible()) {
      await leaveTab.click()
      await expect(page.getByText(/leave request/i).first()).toBeVisible({ timeout: 15_000 })
    }
  })
})
