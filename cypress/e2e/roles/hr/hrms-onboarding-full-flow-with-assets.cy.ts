describe("HRMS - Onboarding (full flow) + Assets allocation", () => {
  it("HR starts onboarding, completes tasks; super admin allocates an asset", () => {
    const today = new Date()
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

    // --- HR starts onboarding for a not-yet-onboarded employee ---
    cy.visitAs("hr", "/onboarding")
    cy.contains("h1", /employee onboarding/i).should("be.visible")

    cy.contains("button", /add employee/i, { timeout: 20000 }).should("be.enabled").click()
    cy.contains(/add new employee to onboarding/i).should("be.visible")

    // Store picked employee name as a Cypress alias (vars can be tricky across async command chains).
    let pickedEmployeeName = ""
    cy.intercept("POST", "**/onboarding_employees*").as("addOnboardingEmployee")
    cy.on("window:alert", (text) => {
      expect(String(text)).to.match(/added to onboarding/i)
    })

    // Fill and submit inside the dialog (prevents accidentally clicking the header "Add Employee").
    cy.contains("[role='dialog']", /add new employee to onboarding/i)
      .should("be.visible")
      .within(() => {
        // Open employee dropdown (options render in a portal outside the dialog).
        cy.get("#employeeId").click({ force: true })
      })

    // Select the first available employee option from the portal list.
    cy.get("[role='option'], [role='listbox'] li, [data-radix-select-item]", { timeout: 20000 })
      .should(($opts) => {
        expect($opts.length).to.be.greaterThan(0)
      })
      .first()
      .then(($opt) => {
        const full = ($opt.text() || "").trim()
        // Example: "Alice Johnson - Software Engineer (Engineering)"
        pickedEmployeeName = full.split(" - ")[0]?.trim() || full
        cy.wrap(pickedEmployeeName, { log: false }).as("pickedEmployeeName")
        cy.wrap($opt).click({ force: true })
      })
    cy.get<string>("@pickedEmployeeName").then((name) => {
      cy.get("#employeeId").should("contain", String(name))
    })

    // Pick start date (DatePicker emits YYYY-MM-DD to the form).
    cy.contains("[role='dialog']", /add new employee to onboarding/i).within(() => {
      cy.contains("button", /pick a date/i).click({ force: true })
    })

    // Calendar renders day buttons; select today's day number.
    cy.get(".rdp", { timeout: 20000 })
      .contains("button", new RegExp(`^${today.getDate()}$`))
      .click({ force: true })

    cy.contains("[role='dialog']", /add new employee to onboarding/i)
      .within(() => {
        cy.contains("button", /pick a date/i).should("not.exist")
        cy.contains("button", /^add employee$/i).should("be.enabled").click({ force: true })
      })

    // Ensure the backend create call actually happened and succeeded.
    cy.wait("@addOnboardingEmployee", { timeout: 30000 })
      .its("response.statusCode")
      .should("be.oneOf", [200, 201])

    cy.get<string>("@pickedEmployeeName").then((name) => {
      const firstName = String(name).split(" ")[0] || String(name)
      cy.get('input[placeholder="Search employees..."]', { timeout: 20000 }).clear().type(firstName)
      cy.contains("h3", new RegExp(escapeRegExp(String(name)), "i"), { timeout: 30000 })
        .should("be.visible")
        .click({ force: true })
    })
    cy.contains(/onboarding checklist/i).should("be.visible")
    cy.contains(/onboarding tasks/i, { timeout: 20000 }).should("be.visible")

    // Complete all tasks visible in the checklist.
    cy.get("input[type='checkbox']").then(($boxes) => {
      // Click only unchecked boxes to avoid toggling completed ones off.
      const unchecked = Array.from($boxes).filter((el) => !(el as HTMLInputElement).checked)
      if (unchecked.length === 0) return
      unchecked.forEach((el) => cy.wrap(el).click({ force: true }))
    })

    // Verify progress reaches 100% (either via explicit 100% label or completed badge).
    cy.contains(/100%/i, { timeout: 20000 }).should("exist")

    // --- Super Admin allocates an asset to the onboarded employee ---
    cy.visitAs("admin", "/assets")
    cy.contains("h1", /asset management/i).should("be.visible")

    // Find an "available" asset row and allocate it.
    // We rely on the dropdown action label "Allocate" in the row actions menu.
    cy.contains("tr", /available/i, { timeout: 20000 })
      .first()
      .within(() => {
        // Action trigger is an icon-only button (no accessible name).
        cy.get("button")
          .filter(":has(svg)")
          .last()
          .click({ force: true })
      })

    cy.contains("[role='menuitem']", /^allocate$/i, { timeout: 20000 }).click({ force: true })
    cy.contains(/allocate asset/i, { timeout: 20000 }).should("be.visible")

    // Select employee to assign to.
    cy.contains(/select employee/i).parent().find("button").click({ force: true })
    cy.get<string>("@pickedEmployeeName").then((name) => {
      cy.get("[role='option'], [data-radix-select-item]")
        .contains(new RegExp(escapeRegExp(String(name)), "i"))
        .click({ force: true })
    })

    cy.contains("button", /^allocate$/i).click({ force: true })

    // Confirm the asset is now assigned (either the status changes or "Assigned To" section shows Alice).
    cy.contains(/assigned to/i, { timeout: 20000 }).should("exist")
    cy.get<string>("@pickedEmployeeName").then((name) => {
      cy.contains(new RegExp(escapeRegExp(String(name)), "i")).should("exist")
    })
  })
})

