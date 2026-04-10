describe("HRMS - Leave Requests", () => {
  beforeEach(() => {
    cy.visitAs("hr", "/leave-management")
  })

  it("shows leave management area", () => {
    // Keep assertions generic across HRMS implementations
    cy.contains("h1", /leave management/i).should("be.visible")
  })
})

