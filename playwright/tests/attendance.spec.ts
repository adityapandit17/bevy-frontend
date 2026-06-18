import { test, expect } from "@playwright/test"
import { visitHrmsAuthenticated } from "../helpers/auth"

test.describe("Attendance", () => {
  test("employee sees punch card on attendance page", async ({ page, request }) => {
    await visitHrmsAuthenticated(request, page, "/attendance-leave", "employee")

    await expect(page.getByRole("heading", { name: /attendance/i })).toBeVisible()
    await expect(page.getByText(/today's attendance/i)).toBeVisible({ timeout: 20_000 })
    await expect(
      page.getByRole("button", { name: /check in/i }).or(page.getByRole("button", { name: /check out/i }))
    ).toBeVisible()
  })

  test("admin sees attendance and leave management area", async ({ page, request }) => {
    await visitHrmsAuthenticated(request, page, "/attendance-leave", "admin")

    await expect(page.getByRole("heading", { name: "Attendance & Leave" })).toBeVisible()
    await expect(page.getByRole("tab").first()).toBeVisible()
  })
})
