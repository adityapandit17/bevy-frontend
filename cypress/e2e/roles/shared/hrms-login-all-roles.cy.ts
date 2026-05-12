/**
 * Validates the real login form for each seeded role (API is covered elsewhere).
 * Requires backend + frontend running (default ports 3000 / 3001).
 */

const roles = [
  { key: "admin" as const, emailKey: "adminEmail", passwordKey: "adminPassword" },
  { key: "hr" as const, emailKey: "hrEmail", passwordKey: "hrPassword" },
  { key: "deptHead" as const, emailKey: "deptHeadEmail", passwordKey: "deptHeadPassword" },
  { key: "employee" as const, emailKey: "employeeEmail", passwordKey: "employeePassword" },
]

describe("HRMS - Login (all roles via UI)", () => {
  roles.forEach(({ key, emailKey, passwordKey }) => {
    it(`${key} signs in and reaches the dashboard`, () => {
      const email = Cypress.env(emailKey) as string
      const password = Cypress.env(passwordKey) as string

      cy.visit("/login", {
        onBeforeLoad(win) {
          win.localStorage.removeItem("hrms_auth_token")
          win.localStorage.removeItem("hrms_auth_user")
        },
      })

      cy.get("#email").clear().type(email)
      cy.get("#password").clear().type(password, { log: false })
      cy.contains("button", /^sign in$/i).click()

      cy.url({ timeout: 30000 }).should("include", "/dashboard")
      cy.contains(/dashboard/i, { timeout: 20000 }).should("be.visible")
    })
  })
})
