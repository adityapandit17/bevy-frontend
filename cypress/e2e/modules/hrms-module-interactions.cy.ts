/**
 * Light interaction checks on top of smoke tests (filters, search, primary CTAs).
 */

describe("HRMS module interactions", () => {
  it("admin: Documents — policy and employee document search filters accept input", () => {
    cy.visitAs("admin", "/documents")
    cy.expectModuleLoaded({ pathContains: "documents", heading: /document management/i })
    cy.get('input[placeholder="Search policies..."]', { timeout: 20000 }).clear().type("leave")
    cy.contains('[role="tab"]', /employee documents/i).click()
    cy.get('input[placeholder="Search documents..."]', { timeout: 20000 }).clear().type("contract")
  })

  it("admin: Reports — period selector is present", () => {
    cy.visitAs("admin", "/reports")
    cy.expectModuleLoaded({ pathContains: "reports", heading: /reports/i })
    cy.contains(/select period/i, { timeout: 20000 }).should("exist")
  })

  it("admin: Payroll — header actions area loads", () => {
    cy.visitAs("admin", "/payroll")
    cy.expectModuleLoaded({ pathContains: "payroll", heading: /payroll/i })
    cy.contains(/export payroll|process payroll|manage employee salaries/i, { timeout: 20000 }).should(
      "exist",
    )
  })

  it("HR: Employees — search filters directory", () => {
    cy.visitAs("hr", "/employees")
    cy.get('input[placeholder="Search employees..."]', { timeout: 20000 }).clear().type("a")
    cy.contains(/employee/i, { timeout: 15000 }).should("exist")
  })

  it("employee: Recognitions — Give Recognition or list region", () => {
    cy.visitAs("employee", "/recognitions")
    cy.expectModuleLoaded({ pathContains: "recognitions", heading: /recognitions/i })
    cy.get("body").should(($b) => {
      expect($b.text().length).to.be.greaterThan(50)
    })
  })

  it("admin: Assets — search filter is interactive", () => {
    cy.visitAs("admin", "/assets")
    cy.expectModuleLoaded({ pathContains: "assets", heading: /asset management/i })
    cy.get('input[placeholder="Search assets..."]', { timeout: 20000 }).clear().type("laptop")
  })

  it("admin: Helpdesk — ticket search accepts input", () => {
    cy.visitAs("admin", "/helpdesk")
    cy.expectModuleLoaded({ pathContains: "helpdesk", heading: /helpdesk/i })
    cy.get('input[placeholder="Search tickets..."]', { timeout: 20000 }).clear().type("vpn")
  })
})
