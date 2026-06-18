import { test, expect } from "@playwright/test"
import { visitBevyAdminAuthenticated } from "../../helpers/auth"
import { credentials } from "../../helpers/credentials"

test.describe("Bevy Admin — platform auth", () => {
  test("UI login reaches dashboard", async ({ page }) => {
    await page.goto("/login")
    await page.locator("#email").fill(credentials.platformAdmin.email)
    await page.locator("#password").fill(credentials.platformAdmin.password)
    await page.getByRole("button", { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
  })

  test("API session opens companies list", async ({ page, request }) => {
    await visitBevyAdminAuthenticated(request, page, "/companies")
    await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible()
    await expect(page.getByPlaceholder(/search by name/i)).toBeVisible()
  })
})
