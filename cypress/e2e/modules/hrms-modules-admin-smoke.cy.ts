/**
 * Broad smoke coverage for authenticated Super Admin–class users.
 * Uses expectModuleLoaded: each route either shows its heading, Access Denied, or redirects.
 */

describe("HRMS modules (admin smoke)", () => {
  const go = (path: string, pathContains: string, heading: RegExp) => {
    cy.visitAs("admin", path)
    cy.expectModuleLoaded({ pathContains, heading })
  }

  it("core navigation", () => {
    go("/dashboard", "dashboard", /dashboard/i)
    go("/chat", "chat", /chat/i)
    go("/notifications", "notifications", /notifications/i)
    go("/user-settings", "user-settings", /settings/i)
    go("/profile", "profile", /my profile/i)
  })

  it("people & org", () => {
    go("/employees", "employees", /employees/i)
    go("/org-chart", "org-chart", /organization chart/i)
    go("/team-assignment", "team-assignment", /team & manager assignment/i)
  })

  it("talent: recruitment & interviews", () => {
    go("/recruitment", "recruitment", /recruitment/i)
    go("/ats", "ats", /applicant tracking system/i)
    go("/interviews", "interviews", /interview management/i)
    go("/scheduled-interviews", "scheduled-interviews", /scheduled interviews|missed interviews/i)
  })

  it("HR lifecycle", () => {
    go("/onboarding", "onboarding", /employee onboarding/i)
    go("/offboarding", "offboarding", /employee offboarding/i)
  })

  it("time, leave & reviews", () => {
    go("/attendance-leave", "attendance-leave", /attendance & leave/i)
    go("/attendance", "attendance", /attendance|leave management/i)
    go("/leave-management", "leave-management", /leave management|access denied/i)
    go("/review-leave-applications", "review-leave-applications", /review leave applications/i)
  })

  it("compensation & performance", () => {
    go("/payroll", "payroll", /payroll/i)
    go("/performance", "performance", /performance management/i)
  })

  it("documents, assets & expenses", () => {
    go("/documents", "documents", /document management/i)
    go("/assets", "assets", /asset management/i)
    go("/expense-tracker", "expense-tracker", /expense tracker/i)
  })

  it("workspace & culture", () => {
    go("/workspace-seating", "workspace-seating", /workspace seating/i)
    go("/recognitions", "recognitions", /recognitions/i)
    go("/events", "events", /events/i)
    go("/calendar", "calendar", /company calendar/i)
  })

  it("insights & configuration", () => {
    go("/reports", "reports", /reports/i)
    go("/settings", "settings", /settings/i)
  })

  it("support & L&D", () => {
    go("/helpdesk", "helpdesk", /helpdesk/i)
    go("/learning", "learning", /learning & development/i)
  })

  it("projects & scrum", () => {
    go("/project-management", "project-management", /project management/i)
    go("/project-management/kanban", "project-management", /kanban board/i)
    go("/project-management/timeline", "project-management", /project timeline/i)
    go("/project-management/sprints", "project-management", /sprint planning/i)
    go("/scrum-tools", "scrum-tools", /scrum tools/i)
  })

  it("super admin console", () => {
    go("/super-admin", "super-admin", /super admin dashboard/i)
  })
})
