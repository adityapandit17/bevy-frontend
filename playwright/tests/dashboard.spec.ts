import { test, expect } from "@playwright/test"
import { visitHrmsAuthenticated } from "../helpers/auth"

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page, request }) => {
    await visitHrmsAuthenticated(request, page, "/dashboard")
  })

  test("shows dashboard heading and welcome content", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
    await expect(page.getByText(/welcome back/i)).toBeVisible()
  })

  test("displays stat cards", async ({ page }) => {
    const cards = page.locator('[class*="rounded"]').filter({ hasText: /employees|attendance|leave|payroll/i })
    await expect(cards.first()).toBeVisible({ timeout: 20_000 })
  })

  test("top navigation includes core modules", async ({ page }) => {
    await expect(page.getByRole("navigation")).toBeVisible()
    await expect(page.getByRole("button", { name: /employees/i }).or(page.getByRole("link", { name: /employees/i }))).toBeVisible()
  })
})
