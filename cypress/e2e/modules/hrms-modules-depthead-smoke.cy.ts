describe("HRMS modules (department head smoke)", () => {
  const go = (path: string, pathContains: string, heading: RegExp) => {
    cy.visitAs("deptHead", path)
    cy.expectModuleLoaded({ pathContains, heading })
  }

  it("team lead surfaces", () => {
    go("/dashboard", "dashboard", /dashboard/i)
    go("/review-leave-applications", "review-leave-applications", /review leave applications/i)
    go("/scheduled-interviews", "scheduled-interviews", /scheduled interviews|missed interviews/i)
    go("/team-assignment", "team-assignment", /team & manager assignment/i)
    go("/org-chart", "org-chart", /organization chart/i)
  })
})
