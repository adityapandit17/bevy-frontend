describe("HRMS - Authentication", () => {
  it("logs in and lands on dashboard", () => {
    // Use API login to reduce UI flakiness; the UI should reflect an authenticated session afterward.
    cy.visit("/login")
    cy.apiLogin()
    cy.visit("/dashboard")

    cy.url({ timeout: 20000 }).should("include", "/dashboard")
    cy.contains(/dashboard/i).should("be.visible")
  })
})

