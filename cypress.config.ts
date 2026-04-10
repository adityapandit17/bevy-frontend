import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3001",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 8000,
    experimentalRunAllSpecs: true,
    env: {
      apiBaseUrl: process.env.CYPRESS_API_BASE_URL || "http://localhost:3000",
      adminEmail: process.env.CYPRESS_ADMIN_EMAIL || "admin@hrms.com",
      adminPassword: process.env.CYPRESS_ADMIN_PASSWORD || "admin123",
      hrEmail: process.env.CYPRESS_HR_EMAIL || "sarah.miller@company.com",
      hrPassword: process.env.CYPRESS_HR_PASSWORD || "password123",
      deptHeadEmail: process.env.CYPRESS_DEPT_HEAD_EMAIL || "bob.wilson@company.com",
      deptHeadPassword: process.env.CYPRESS_DEPT_HEAD_PASSWORD || "password123",
      employeeEmail: process.env.CYPRESS_EMPLOYEE_EMAIL || "john.doe@company.com",
      employeePassword: process.env.CYPRESS_EMPLOYEE_PASSWORD || "password123",
    },
    setupNodeEvents(on, config) {},
  },
})
