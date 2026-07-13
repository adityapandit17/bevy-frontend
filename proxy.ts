import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This app uses client-side API calls only — no Server Actions.
// Block RSC/Server Action exploit probes (CVE-2025-55182 / React2Shell).
const SERVER_ACTION_ID = /^[a-f0-9]{40,64}$/i

const SHELL_IN_QUERY =
  /(\||;|`|\$\(|&&|\|\||\bcat\b|\bps\b|\bwget\b|\bcurl\b|\bbash\b|\bsh\b|\bchmod\b|\bexec\b)/i

const PROBE_PATHS = /^\/(\.git|\.env|\.well-known\/acme-challenge)/

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (PROBE_PATHS.test(pathname) || pathname.includes("..")) {
    return new NextResponse(null, { status: 404 })
  }

  const nextAction = request.headers.get("next-action")
  if (nextAction && !SERVER_ACTION_ID.test(nextAction)) {
    return new NextResponse(null, { status: 403 })
  }

  // Exploit traffic sends crafted multipart POSTs with RSC headers to random paths.
  if (
    request.method === "POST" &&
    request.headers.get("rsc") === "1" &&
    request.headers.get("content-type")?.includes("multipart/form-data")
  ) {
    return new NextResponse(null, { status: 403 })
  }

  for (const value of searchParams.values()) {
    if (SHELL_IN_QUERY.test(decodeURIComponent(value))) {
      return new NextResponse(null, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}
