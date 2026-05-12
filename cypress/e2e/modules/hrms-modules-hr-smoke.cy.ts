describe("HRMS modules (HR Manager smoke)", () => {
  const go = (path: string, pathContains: string, heading: RegExp) => {
    cy.visitAs("hr", path)
    cy.expectModuleLoaded({ pathContains, heading })
  }

  it("typical HR surfaces", () => {
    go("/employees", "employees", /employees/i)
    go("/onboarding", "onboarding", /employee onboarding/i)
    go("/documents", "documents", /document management/i)
    go("/performance", "performance", /performance management/i)
    go("/leave-management", "leave-management", /leave management|access denied/i)
    go("/reports", "reports", /reports/i)
    go("/team-assignment", "team-assignment", /team & manager assignment/i)
  })
})
