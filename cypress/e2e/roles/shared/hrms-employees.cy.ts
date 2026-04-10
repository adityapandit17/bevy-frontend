describe("HRMS - Employees", () => {
  beforeEach(() => {
    cy.visitAuthenticated("/employees")
  })

  it("shows the employees directory with seeded employees", () => {
    cy.contains("h1", /employees/i).should("be.visible")
    cy.get('input[placeholder="Search employees..."]').should("be.visible")

    // Seed data includes John Doe & Alice Johnson
    cy.contains(/john/i).should("be.visible")
    cy.contains(/doe/i).should("be.visible")
  })

  it("can search employees by name", () => {
    cy.get('input[placeholder="Search employees..."]').type("Alice")
    cy.contains(/alice/i, { timeout: 20000 }).should("be.visible")
  })
})

