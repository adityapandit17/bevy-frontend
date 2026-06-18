export const credentials = {
  admin: {
    email: process.env.PLAYWRIGHT_ADMIN_EMAIL || "admin@hrms.com",
    password: process.env.PLAYWRIGHT_ADMIN_PASSWORD || "admin123",
  },
  hr: {
    email: process.env.PLAYWRIGHT_HR_EMAIL || "sarah.miller@company.com",
    password: process.env.PLAYWRIGHT_HR_PASSWORD || "password123",
  },
  deptHead: {
    email: process.env.PLAYWRIGHT_DEPT_HEAD_EMAIL || "bob.wilson@company.com",
    password: process.env.PLAYWRIGHT_DEPT_HEAD_PASSWORD || "password123",
  },
  employee: {
    email: process.env.PLAYWRIGHT_EMPLOYEE_EMAIL || "john.doe@company.com",
    password: process.env.PLAYWRIGHT_EMPLOYEE_PASSWORD || "password123",
  },
  platformAdmin: {
    email: process.env.PLAYWRIGHT_PLATFORM_ADMIN_EMAIL || "admin@bevyhr.com",
    password: process.env.PLAYWRIGHT_PLATFORM_ADMIN_PASSWORD || "admin123",
  },
} as const

export type HrmsRole = keyof Omit<typeof credentials, "platformAdmin">

export const apiBaseUrl = process.env.PLAYWRIGHT_API_BASE_URL || "http://localhost:3000"

export const HRMS_TOKEN_KEY = "hrms_auth_token"
export const HRMS_USER_KEY = "hrms_auth_user"
export const BEVY_ADMIN_TOKEN_KEY = "bevy_admin_token"
export const BEVY_ADMIN_USER_KEY = "bevy_admin_user"
