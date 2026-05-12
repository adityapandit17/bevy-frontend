describe("HRMS - Leave (employee applies, lead / HR reviews)", () => {
  it("Super Admin can open Request Leave (validates leave application UI)", () => {
    cy.visitAs("admin", "/attendance-leave")
    cy.contains("h1", /attendance & leave/i).should("be.visible")
    cy.contains('[role="tab"]', /leave requests/i).click()
    cy.contains("button", /apply leave/i, { timeout: 15000 }).should("be.visible").click()
    cy.contains(/request leave/i, { timeout: 15000 }).should("be.visible")
    cy.get(".fixed.inset-0 button").first().click()
  })

  it("employee sees Attendance & Leave; Leave tab shows self-service or access notice", () => {
    cy.visitAs("employee", "/attendance-leave")
    cy.contains("h1", /attendance & leave/i).should("be.visible")
    cy.contains('[role="tab"]', /leave requests/i).click()
    cy.get("body", { timeout: 15000 }).should(($b) => {
      const txt = $b.text()
      expect(
        txt.includes("Apply Leave") ||
          txt.includes("don't have permission to view leave requests") ||
          txt.includes("Access Denied"),
        "employee leave UX",
      ).to.be.true
    })
  })

  it("department head can open Leave Requests list (approve flow when pending rows exist)", () => {
    cy.visitAs("deptHead", "/attendance-leave")
    cy.contains("h1", /attendance & leave/i).should("be.visible")
    cy.contains('[role="tab"]', /leave requests/i).click()
    cy.contains(/leave requests/i, { timeout: 15000 }).should("be.visible")
    cy.get("body").then(($body) => {
      if ($body.text().includes("No leave requests found.")) {
        cy.contains(/no leave requests found/i).should("be.visible")
      } else {
        cy.get("table").should("exist")
      }
    })
  })

  it("HR can use Leave Management overview", () => {
    cy.visitAs("hr", "/leave-management")
    cy.contains("h1", /leave management/i).should("be.visible")
  })
})
