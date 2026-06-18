import { test, expect } from "@playwright/test"

test.describe("Trial signup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.evaluate(() => {
      localStorage.removeItem("hrms_auth_token")
      localStorage.removeItem("hrms_auth_user")
    })
  })

  test("signup page renders trial form", async ({ page }) => {
    await page.goto("/signup")

    await expect(page.locator("#company_name")).toBeVisible({ timeout: 30_000 })
    await expect(page.locator("#admin_email")).toBeVisible()
    await expect(page.getByRole("button", { name: /start 14-day free trial/i })).toBeVisible()
  })

  test("signup route is publicly accessible", async ({ page }) => {
    const response = await page.goto("/signup")
    expect(response?.ok()).toBeTruthy()
    await expect(page).toHaveURL(/\/signup/)
  })
})
