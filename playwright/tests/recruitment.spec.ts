import { test, expect } from "@playwright/test"
import { visitHrmsAuthenticated } from "../helpers/auth"

test.describe("Recruitment", () => {
  test.beforeEach(async ({ page, request }) => {
    await visitHrmsAuthenticated(request, page, "/recruitment", "admin")
  })

  test("shows recruitment page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Recruitment" })).toBeVisible()
  })

  test("shows job openings or candidates section", async ({ page }) => {
    await expect(
      page.getByText(/job opening/i).first().or(page.getByText(/candidate/i).first())
    ).toBeVisible({ timeout: 20_000 })
  })
})
