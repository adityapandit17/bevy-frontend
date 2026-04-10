/// <reference types="cypress" />

// ─── Auth ────────────────────────────────────────────────────────────────────

Cypress.Commands.add("apiLogin", (email?: string, password?: string) => {
  const apiBaseUrl = Cypress.env("apiBaseUrl") || "http://localhost:3000"
  const effectiveEmail = email || Cypress.env("adminEmail") || "admin@hrms.com"
  const effectivePassword = password || Cypress.env("adminPassword") || "admin123"

  return cy
    .request({
      method: "POST",
      url: `${apiBaseUrl}/api/v1/auth/login`,
      body: { email: effectiveEmail, password: effectivePassword },
      failOnStatusCode: true,
    })
    .then((resp) => {
      expect(resp.status).to.eq(200)
      expect(resp.body).to.have.property("success", true)
      expect(resp.body?.data?.token).to.be.a("string")
      expect(resp.body?.data?.user).to.be.an("object")

      const token = resp.body.data.token as string
      const user = resp.body.data.user

      cy.window().then((win) => {
        win.localStorage.setItem("hrms_auth_token", token)
        win.localStorage.setItem("hrms_auth_user", JSON.stringify(user))
      })
    })
})

Cypress.Commands.add("loginAs", (role: "admin" | "hr" | "deptHead" | "employee") => {
  const credsByRole = {
    admin: { email: Cypress.env("adminEmail"), password: Cypress.env("adminPassword") },
    hr: { email: Cypress.env("hrEmail"), password: Cypress.env("hrPassword") },
    deptHead: { email: Cypress.env("deptHeadEmail"), password: Cypress.env("deptHeadPassword") },
    employee: { email: Cypress.env("employeeEmail"), password: Cypress.env("employeePassword") },
  } as const

  const creds = credsByRole[role]
  return cy.apiLogin(creds.email, creds.password)
})

Cypress.Commands.add("logout", () => {
  cy.window().then((win) => {
    win.localStorage.removeItem("hrms_auth_token")
    win.localStorage.removeItem("hrms_auth_user")
  })
})

// ─── Navigation helpers ───────────────────────────────────────────────────────

Cypress.Commands.add("visitAuthenticated", (path: string, email?: string, password?: string) => {
  cy.visit("/login", {
    onBeforeLoad(win) {
      win.localStorage.removeItem("hrms_auth_token")
      win.localStorage.removeItem("hrms_auth_user")
    },
  })
  cy.apiLogin(email, password)
  cy.visit(path)
})

Cypress.Commands.add("visitAs", (role: "admin" | "hr" | "deptHead" | "employee", path: string) => {
  cy.visit("/login", {
    onBeforeLoad(win) {
      win.localStorage.removeItem("hrms_auth_token")
      win.localStorage.removeItem("hrms_auth_user")
    },
  })
  cy.loginAs(role)
  cy.visit(path, { failOnStatusCode: false })
})

// ─── Form helpers ─────────────────────────────────────────────────────────────

Cypress.Commands.add("selectOption", (selector: string, value: string) => {
  cy.get(selector).click()
  cy.get("[role='option'], [role='listbox'] li, [data-radix-select-item]").contains(value).click()
})

// ─── Type declarations ────────────────────────────────────────────────────────

declare global {
  namespace Cypress {
    interface Chainable {
      apiLogin(email?: string, password?: string): Chainable<void>
      loginAs(role: "admin" | "hr" | "deptHead" | "employee"): Chainable<void>
      logout(): Chainable<void>
      visitAuthenticated(path: string, email?: string, password?: string): Chainable<void>
      visitAs(role: "admin" | "hr" | "deptHead" | "employee", path: string): Chainable<void>
      selectOption(selector: string, value: string): Chainable<void>
    }
  }
}
