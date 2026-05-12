describe("HRMS - Onboarding (full flow) + Assets allocation", () => {
  it("HR starts onboarding, completes tasks; super admin allocates an asset", () => {
    const today = new Date()
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const apiBaseUrl = Cypress.env("apiBaseUrl") || "http://localhost:3000"
    const dayOfMonth = today.getDate()

    // Admin JWT: reuse for setup (free onboarding slot + seed asset) and keep one login.
    cy.request({
      method: "POST",
      url: `${apiBaseUrl}/api/v1/auth/login`,
      body: {
        email: Cypress.env("adminEmail"),
        password: Cypress.env("adminPassword"),
      },
    }).then((loginRes) => {
      expect(loginRes.status).to.eq(200)
      const token = loginRes.body?.data?.token as string
      cy.wrap(token).as("adminJwt")

      // The UI only lists employees with no onboarding record. If everyone already has a row,
      // the dropdown is empty — delete one onboarding record so someone can be added again.
      return cy
        .request({
          method: "GET",
          url: `${apiBaseUrl}/onboarding_employees`,
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        })
        .then((listRes) => {
          const rows = listRes.body as { id: number }[]
          if (Array.isArray(rows) && rows.length > 0) {
            return cy.request({
              method: "DELETE",
              url: `${apiBaseUrl}/onboarding_employees/${rows[0].id}`,
              headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            })
          }
        })
    })

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

    // Pick start date (DatePicker: Popover + react-day-picker; trigger shows "Pick a date" until set).
    cy.contains("[role='dialog']", /add new employee to onboarding/i)
      .should("be.visible")
      .find("button")
      .contains(/pick a date/i)
      .click({ force: true })

    // Day cells are buttons[name="day"]; exclude "outside" month days to avoid duplicate day numbers.
    cy.get(".rdp", { timeout: 20000 })
      .find('button[name="day"]')
      .not('[class*="day-outside"]')
      .contains(new RegExp(`^${dayOfMonth}$`))
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
    // Ensure at least one available asset exists (CI/dev DB may have none).
    const serial = `E2E-${Date.now()}`
    cy.get<string>("@adminJwt").then((token) => {
      return cy
        .request({
          method: "POST",
          url: `${apiBaseUrl}/api/assets`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            asset: {
              name: `E2E ${serial}`,
              asset_type: "laptop",
              serial_number: serial,
              brand: "Dell",
              model: "Latitude",
              purchase_date: "2024-06-01",
              purchase_cost: 1500,
              current_value: 1200,
              status: "available",
              location: "HQ",
              department: "IT",
              condition: "good",
            },
          },
        })
        .its("status")
        .should("be.oneOf", [200, 201])
    })

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

