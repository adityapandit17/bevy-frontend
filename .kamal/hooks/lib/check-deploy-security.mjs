#!/usr/bin/env node

/**
 * Pre-deploy security gate for Kamal.
 * - Enforces minimum versions for next / react / react-dom
 * - Runs npm audit and blocks high/critical findings (moderate+ when npmAuditLevel=moderate)
 * - Verifies required security files exist (e.g. middleware.ts)
 */

import { readFileSync, existsSync, copyFileSync, mkdtempSync, rmSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { tmpdir } from "node:os"

const __dirname = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = resolve(__dirname, "../../..")
const BASELINE_PATH = join(APP_ROOT, ".kamal/security-baseline.json")

const RED = "\x1b[31m"
const GREEN = "\x1b[32m"
const YELLOW = "\x1b[33m"
const RESET = "\x1b[0m"

function fail(message) {
  console.error(`${RED}✗ ${message}${RESET}`)
  process.exit(1)
}

function ok(message) {
  console.log(`${GREEN}✓${RESET} ${message}`)
}

function warn(message) {
  console.warn(`${YELLOW}!${RESET} ${message}`)
}

function parseVersion(version) {
  const match = String(version)
    .trim()
    .replace(/^[^0-9]*/, "")
    .match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function gte(actual, minimum) {
  const a = parseVersion(actual)
  const b = parseVersion(minimum)
  if (!a || !b) return false
  for (let i = 0; i < 3; i += 1) {
    if (a[i] > b[i]) return true
    if (a[i] < b[i]) return false
  }
  return true
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}

function installedVersion(packageName) {
  const pkgPath = join(APP_ROOT, "node_modules", packageName, "package.json")
  if (!existsSync(pkgPath)) return null
  return readJson(pkgPath).version
}

function checkBaseline(baseline) {
  console.log("\n==> Checking security baseline versions")

  for (const [name, minimum] of Object.entries(baseline.packages)) {
    const installed = installedVersion(name)
    if (!installed) {
      fail(`${name} is not installed — run 'yarn install' before deploying`)
    }
    if (!gte(installed, minimum)) {
      fail(
        `${name}@${installed} is below minimum ${minimum}. ` +
          `Upgrade with: yarn add ${name}@${minimum} (or newer patched release)`
      )
    }
    ok(`${name}@${installed} meets minimum ${minimum}`)
  }
}

function checkRequiredFiles(files) {
  console.log("\n==> Checking required security files")

  for (const file of files) {
    const path = join(APP_ROOT, file)
    if (!existsSync(path)) {
      fail(`Missing required file: ${file}`)
    }
    ok(`${file} present`)
  }
}

function checkRegistryUpgrades(baseline) {
  if (process.env.KAMAL_SKIP_REGISTRY_CHECK === "1") {
    warn("Skipping registry version check (KAMAL_SKIP_REGISTRY_CHECK=1)")
    return
  }

  console.log("\n==> Checking npm registry for newer patched releases")

  const critical = Object.keys(baseline.packages)
  for (const name of critical) {
    const result = spawnSync("npm", ["view", name, "version", "--json"], {
      cwd: APP_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })

    if (result.status !== 0) {
      warn(`Could not fetch latest ${name} version from npm — continuing`)
      continue
    }

    const latest = JSON.parse(result.stdout.trim())
    const installed = installedVersion(name)
    if (installed && !gte(installed, latest) && latest !== installed) {
      warn(
        `${name}: installed ${installed}, latest on npm is ${latest}. ` +
          `Consider: yarn add ${name}@${latest}`
      )
    } else {
      ok(`${name} is up to date with npm (${installed})`)
    }
  }
}

function checkAudit(baseline) {
  const auditLevel = baseline.npmAuditLevel ?? baseline.auditLevel ?? "high"
  const hasYarnLock = existsSync(join(APP_ROOT, "yarn.lock"))

  if (hasYarnLock) {
    // Yarn v1 audit reports against the entire lockfile (including dev deps),
    // which is too strict for deploy gating. We audit *production* deps only
    // via npm in a temp dir to avoid writing package-lock.json into the repo.
    console.log(`\n==> Running npm audit (production-only, level: ${auditLevel})`)

    const auditDir = mkdtempSync(join(tmpdir(), "bevyhr-frontend-audit-"))
    try {
      copyFileSync(join(APP_ROOT, "package.json"), join(auditDir, "package.json"))

      const install = spawnSync(
        "npm",
        [
          "i",
          "--package-lock-only",
          "--ignore-scripts",
          "--omit=dev",
          "--legacy-peer-deps",
          "--no-audit",
          "--no-fund",
        ],
        { cwd: auditDir, encoding: "utf8", stdio: "inherit" }
      )
      if (install.status !== 0) {
        fail("Failed to generate production-only package-lock for audit")
      }

      const result = spawnSync("npm", ["audit", `--audit-level=${auditLevel}`, "--omit=dev"], {
        cwd: auditDir,
        encoding: "utf8",
        stdio: "inherit",
      })

      if (result.status !== 0) {
        fail(
          `npm audit (production-only) found ${auditLevel} or higher vulnerabilities. ` +
            `Run: npm audit --omit=dev --audit-level=${auditLevel}`
        )
      }

      ok(`npm audit passed for production dependencies (no ${auditLevel}+ vulnerabilities)`)
      return
    } finally {
      rmSync(auditDir, { recursive: true, force: true })
    }
  }

  console.log(`\n==> Running npm audit (level: ${auditLevel})`)
  const result = spawnSync("npm", ["audit", `--audit-level=${auditLevel}`], {
    cwd: APP_ROOT,
    encoding: "utf8",
    stdio: "inherit",
  })

  if (result.status !== 0) {
    fail(
      `npm audit found ${auditLevel} or higher vulnerabilities. ` +
        `Run: npm audit --audit-level=${auditLevel}`
    )
  }

  ok(`npm audit passed (no ${auditLevel}+ vulnerabilities)`)
}

function main() {
  console.log(`${GREEN}==> Kamal pre-deploy security check${RESET}`)
  console.log(`    App root: ${APP_ROOT}`)

  if (!existsSync(join(APP_ROOT, "package.json"))) {
    fail("package.json not found — run kamal deploy from the frontend directory")
  }

  if (!existsSync(BASELINE_PATH)) {
    fail(`Missing ${BASELINE_PATH}`)
  }

  const baseline = readJson(BASELINE_PATH)

  checkRequiredFiles(baseline.requiredFiles ?? [])
  checkBaseline(baseline)
  checkRegistryUpgrades(baseline)
  checkAudit(baseline)

  console.log(`\n${GREEN}Security checks passed — safe to deploy.${RESET}\n`)
}

main()
