describe("HRMS modules (employee smoke)", () => {
  const go = (path: string, pathContains: string, heading: RegExp) => {
    cy.visitAs("employee", path)
    cy.expectModuleLoaded({ pathContains, heading })
  }

  it("self-service and read-only areas", () => {
    go("/dashboard", "dashboard", /dashboard/i)
    go("/profile", "profile", /my profile/i)
    go("/notifications", "notifications", /notifications/i)
    go("/user-settings", "user-settings", /settings/i)
    go("/calendar", "calendar", /company calendar/i)
    go("/recognitions", "recognitions", /recognitions/i)
    go("/chat", "chat", /chat/i)
  })

  it("attendance & leave (permission-dependent)", () => {
    go("/attendance-leave", "attendance-leave", /attendance & leave/i)
  })
})
