import { APIRequestContext, Page } from "@playwright/test"
import {
  apiBaseUrl,
  BEVY_ADMIN_TOKEN_KEY,
  BEVY_ADMIN_USER_KEY,
  credentials,
  HRMS_TOKEN_KEY,
  HRMS_USER_KEY,
  HrmsRole,
} from "./credentials"

type LoginResponse = {
  success: boolean
  data: {
    token: string
    user?: Record<string, unknown>
    admin?: Record<string, unknown>
  }
}

export async function loginHrmsViaApi(
  request: APIRequestContext,
  page: Page,
  role: HrmsRole = "admin"
) {
  const { email, password } = credentials[role]
  const response = await request.post(`${apiBaseUrl}/api/v1/auth/login`, {
    data: { email, password },
  })

  if (!response.ok()) {
    throw new Error(`HRMS login failed for ${email}: ${response.status()}`)
  }

  const body = (await response.json()) as LoginResponse
  if (!body.success || !body.data?.token) {
    throw new Error(`HRMS login response invalid for ${email}`)
  }

  await page.goto("/login")
  await page.evaluate(
    ({ token, user, tokenKey, userKey }) => {
      localStorage.setItem(tokenKey, token)
      localStorage.setItem(userKey, JSON.stringify(user))
    },
    {
      token: body.data.token,
      user: body.data.user,
      tokenKey: HRMS_TOKEN_KEY,
      userKey: HRMS_USER_KEY,
    }
  )
}

export async function visitHrmsAuthenticated(
  request: APIRequestContext,
  page: Page,
  path: string,
  role: HrmsRole = "admin"
) {
  await loginHrmsViaApi(request, page, role)
  await page.goto(path)
  await page.waitForURL(`**${path}**`, { timeout: 30_000 })
}

export async function loginPlatformAdminViaApi(request: APIRequestContext, page: Page) {
  const { email, password } = credentials.platformAdmin
  const response = await request.post(`${apiBaseUrl}/api/v1/platform/auth/login`, {
    data: { email, password },
  })

  if (!response.ok()) {
    throw new Error(`Platform admin login failed: ${response.status()}`)
  }

  const body = (await response.json()) as LoginResponse
  if (!body.success || !body.data?.token) {
    throw new Error("Platform admin login response invalid")
  }

  await page.goto("/login")
  await page.evaluate(
    ({ token, admin, tokenKey, userKey }) => {
      localStorage.setItem(tokenKey, token)
      localStorage.setItem(userKey, JSON.stringify(admin))
    },
    {
      token: body.data.token,
      admin: body.data.admin,
      tokenKey: BEVY_ADMIN_TOKEN_KEY,
      userKey: BEVY_ADMIN_USER_KEY,
    }
  )
}

export async function visitBevyAdminAuthenticated(
  request: APIRequestContext,
  page: Page,
  path: string
) {
  await loginPlatformAdminViaApi(request, page)
  await page.goto(path)
  await page.waitForURL(`**${path}**`, { timeout: 30_000 })
}
