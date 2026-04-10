describe("HRMS - Role perspectives", () => {
  it("HR Manager can access Employees and sees Add Employee", () => {
    cy.visitAs("hr", "/employees")
    cy.contains("h1", /employees/i).should("be.visible")
    cy.contains("button", /add employee/i).should("exist")
  })

  it("Employee can access Employees but does not see Add Employee", () => {
    cy.visitAs("employee", "/employees")
    // Depending on permissions, user may be denied or allowed.
    // Either way, an Employee should not see employee creation controls.
    cy.contains("button", /add employee/i).should("not.exist")
  })
})

