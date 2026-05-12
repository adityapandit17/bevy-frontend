describe("HRMS - HR recruitment, ATS, and org structure", () => {
  it("Super Admin can open Recruitment and reach ATS (full permission stack)", () => {
    cy.visitAs("admin", "/recruitment")
    cy.contains("h1", /recruitment/i, { timeout: 20000 }).should("be.visible")
    cy.contains("button", /^ats$/i).should("be.visible").click()
    cy.url({ timeout: 20000 }).should("include", "/ats")
    cy.contains("h1", /applicant tracking system/i).should("be.visible")
  })

  it("HR Manager visiting /recruitment ends on recruitment or dashboard (permission-dependent)", () => {
    cy.visitAs("hr", "/recruitment")
    cy.url({ timeout: 25000 }).should((href) => {
      expect(href.includes("/recruitment") || href.includes("/dashboard"), href).to.be.true
    })
  })

  it("HR can open Organization Chart", () => {
    cy.visitAs("hr", "/org-chart")
    cy.contains("h1", /organization chart/i).should("be.visible")
  })

  it("HR can open Team & Manager Assignment", () => {
    cy.visitAs("hr", "/team-assignment")
    cy.contains("h1", /team & manager assignment/i).should("be.visible")
  })

  it("Admin can manage org tree and team assignment", () => {
    cy.visitAs("admin", "/org-chart")
    cy.contains("h1", /organization chart/i).should("be.visible")
    cy.visitAs("admin", "/team-assignment")
    cy.contains("h1", /team & manager assignment/i).should("be.visible")
  })
})
