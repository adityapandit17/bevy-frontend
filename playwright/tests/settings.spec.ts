import { test, expect } from "@playwright/test"
import { visitHrmsAuthenticated } from "../helpers/auth"

test.describe("Settings", () => {
  test.beforeEach(async ({ page, request }) => {
    await visitHrmsAuthenticated(request, page, "/settings", "admin")
  })

  test("shows settings page with company tab", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole("tab", { name: "Company" })).toBeVisible()
  })

  test("company settings show organization fields", async ({ page }) => {
    await expect(page.getByLabel(/company name/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/dashboard layout/i)).toBeVisible()
  })
})
