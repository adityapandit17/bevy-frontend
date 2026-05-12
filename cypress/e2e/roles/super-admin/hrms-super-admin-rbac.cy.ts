describe("HRMS - Super Admin (dashboard + roles & permissions)", () => {
  it("Super Admin dashboard loads for admin user", () => {
    cy.visitAs("admin", "/super-admin")
    cy.contains("h1", /super admin dashboard/i).should("be.visible")
  })

  it("non–Super Admin cannot use the Super Admin dashboard UI", () => {
    cy.visitAs("employee", "/super-admin")
    cy.contains(/access denied/i, { timeout: 15000 }).should("be.visible")
    cy.contains(/super admin role/i).should("be.visible")
  })

  it("admin can open Role & Permissions Management and sees role controls", () => {
    cy.visitAs("admin", "/settings/role-permissions")
    cy.contains("h1", /role & permissions management/i).should("be.visible")
    cy.contains("button", /create role/i).should("be.visible")
    cy.contains(/roles/i).should("be.visible")
  })

  it("admin can open Settings and manage company configuration (Users tab visible)", () => {
    cy.visitAs("admin", "/settings")
    cy.contains("h1", /^settings$/i).should("be.visible")
    cy.contains("button", /edit|save changes/i).should("exist")
    cy.get('[role="tab"]').contains(/^users$/i).should("be.visible")
  })
})
