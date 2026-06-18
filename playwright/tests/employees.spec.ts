import { test, expect } from "@playwright/test"
import { visitHrmsAuthenticated } from "../helpers/auth"

test.describe("Employees", () => {
  test.beforeEach(async ({ page, request }) => {
    await visitHrmsAuthenticated(request, page, "/employees")
  })

  test("shows employees directory", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Employees" })).toBeVisible()
    await expect(page.getByPlaceholder(/search employees/i)).toBeVisible()
  })

  test("lists seeded employees", async ({ page }) => {
    await expect(page.getByText(/john/i).first()).toBeVisible({ timeout: 20_000 })
  })

  test("search filters employee list", async ({ page }) => {
    const search = page.getByPlaceholder(/search employees/i)
    await search.fill("Sarah")
    await expect(page.getByText(/sarah/i).first()).toBeVisible({ timeout: 20_000 })
  })
})
