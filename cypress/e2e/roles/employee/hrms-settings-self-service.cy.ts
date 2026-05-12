describe("HRMS - Settings (Employee self-service)", () => {
  it("employee uses /profile for personal updates; company Settings redirects", () => {
    cy.visitAs("employee", "/profile")
    cy.contains("h1", /my profile/i).should("be.visible")
    cy.visit("/settings")
    cy.url({ timeout: 15000 }).should("include", "/dashboard")
  })
})

