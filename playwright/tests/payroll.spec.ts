import { test, expect } from "@playwright/test"
import { visitHrmsAuthenticated } from "../helpers/auth"

test.describe("Payroll", () => {
  test.beforeEach(async ({ page, request }) => {
    await visitHrmsAuthenticated(request, page, "/payroll", "admin")
  })

  test("shows payroll page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Payroll" })).toBeVisible({ timeout: 30_000 })
  })

  test("shows payroll workspace content", async ({ page }) => {
    await expect(page.locator("main").getByText(/payroll|salary/i).first()).toBeVisible({ timeout: 30_000 })
  })
})
