import { test, expect } from "@playwright/test"
import { visitHrmsAuthenticated } from "../helpers/auth"
import { credentials, apiBaseUrl } from "../helpers/credentials"

test.describe("Authentication", () => {
  test("UI login lands on dashboard", async ({ page }) => {
    await page.goto("/login")
    await page.locator("#email").fill(credentials.admin.email)
    await page.locator("#password").fill(credentials.admin.password)
    await page.getByRole("button", { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
  })

  test("API session opens protected dashboard", async ({ page, request }) => {
    await visitHrmsAuthenticated(request, page, "/dashboard")
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
  })

  test("protected API rejects unauthenticated requests", async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/employees`, {
      headers: { Accept: "application/json" },
    })
    expect(response.status()).toBe(401)
  })

  test("login page is publicly accessible", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator("#email")).toBeVisible()
    await expect(page.locator("#password")).toBeVisible()
  })
})
