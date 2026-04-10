describe("HRMS - Onboarding", () => {
  beforeEach(() => {
    cy.visitAs("hr", "/onboarding")
  })

  it("shows onboarding screen and employee list", () => {
    cy.contains(/employee onboarding/i).should("be.visible")
    cy.contains(/onboarding employees/i).should("be.visible")
  })
})

