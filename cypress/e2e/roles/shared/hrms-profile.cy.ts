describe("HRMS - Profile (self-service)", () => {
  it("employee can open My Profile and use Edit Profile", () => {
    cy.visitAs("employee", "/profile")
    cy.contains("h1", /my profile/i).should("be.visible")
    cy.contains("button", /edit profile/i).click()
    cy.contains("[role='dialog']", /edit profile/i).should("be.visible")
    cy.get("#first_name").should("be.visible")
    cy.get("#last_name").should("be.visible")
    cy.contains("[role='dialog']", /edit profile/i).within(() => {
      cy.contains("button", /^cancel$/i).click()
    })
    cy.contains("[role='dialog']", /edit profile/i).should("not.exist")
  })

  it("HR Manager can open profile (same UI)", () => {
    cy.visitAs("hr", "/profile")
    cy.contains("h1", /my profile/i).should("be.visible")
  })

  it("Super Admin can open profile (same UI)", () => {
    cy.visitAs("admin", "/profile")
    cy.contains("h1", /my profile/i).should("be.visible")
  })
})
