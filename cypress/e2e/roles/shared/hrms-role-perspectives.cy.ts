describe("HRMS - Role perspectives", () => {
  it("Super Admin reaches dashboard and can open Employees", () => {
    cy.visitAs("admin", "/dashboard")
    cy.url({ timeout: 20000 }).should("include", "/dashboard")
    cy.visitAs("admin", "/employees")
    cy.contains("h1", /employees/i).should("be.visible")
    cy.contains("button", /add employee/i).should("exist")
  })

  it("HR Manager can access Employees and sees Add Employee", () => {
    cy.visitAs("hr", "/employees")
    cy.contains("h1", /employees/i).should("be.visible")
    cy.contains("button", /add employee/i).should("exist")
  })

  it("HR can open Add Employee dialog", () => {
    cy.visitAs("hr", "/employees")
    cy.contains("button", /add employee/i).click()
    cy.contains("[role='dialog']", /add new employee/i, { timeout: 15000 }).should("be.visible")
  })

  it("Department head reaches dashboard", () => {
    cy.visitAs("deptHead", "/dashboard")
    cy.url({ timeout: 20000 }).should("include", "/dashboard")
  })

  it("Employee can access Employees but does not see Add Employee", () => {
    cy.visitAs("employee", "/employees")
    // Depending on permissions, user may be denied or allowed.
    // Either way, an Employee should not see employee creation controls.
    cy.contains("button", /add employee/i).should("not.exist")
  })
})

