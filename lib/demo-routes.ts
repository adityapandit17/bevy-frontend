/** Demo-only routes — hidden outside development. */
export const DEMO_ROUTE_PATHS = [
  "/interview-demo",
  "/interviews-ui",
  "/demo/role-permissions",
] as const

export function isDemoRoutesEnabled(): boolean {
  return process.env.NODE_ENV === "development"
}

export function isDemoRoute(pathname: string): boolean {
  return DEMO_ROUTE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}
