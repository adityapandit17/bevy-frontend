export type TenantMode =
  | { kind: "admin" }
  | { kind: "company"; code: string }
  | { kind: "root" };

/**
 * Subdomain-based multitenancy for local dev + production.
 *
 * Examples:
 * - admin.lvh.me -> { kind: "admin" }
 * - bis.lvh.me   -> { kind: "company", code: "bis" }
 * - bevyhr.com   -> { kind: "root" }
 */
export function getTenantModeFromHost(hostname: string): TenantMode {
  const host = (hostname || "").toLowerCase();

  // localhost / IPs → treat as "root" (header-based switching can still work)
  if (host === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return { kind: "root" };
  }

  const parts = host.split(".").filter(Boolean);
  if (parts.length < 3) {
    // example: bevyhr.com
    return { kind: "root" };
  }

  const sub = parts[0];
  if (!sub || sub === "www") return { kind: "root" };
  if (sub === "admin") return { kind: "admin" };

  return { kind: "company", code: sub };
}

export function getTenantMode(): TenantMode {
  if (typeof window === "undefined") return { kind: "root" };
  return getTenantModeFromHost(window.location.hostname);
}

