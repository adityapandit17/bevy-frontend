#!/usr/bin/env bash
# Fails on high or critical npm audit findings (includes moderate when AUDIT_LEVEL=moderate).
# Prefer yarn deploy:check for Kamal; this script remains for local / pre-commit hooks.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

AUDIT_LEVEL="${NPM_AUDIT_LEVEL:-high}"

# Align with Kamal gate: production-only audit via a temporary lockfile.
# Avoid requiring a committed package-lock.json in this yarn-based repo.
TMPDIR="$(mktemp -d)"
cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

cp package.json "$TMPDIR/package.json"
(
  cd "$TMPDIR"
  npm i --package-lock-only --ignore-scripts --omit=dev --legacy-peer-deps --no-audit --no-fund
  echo "Running npm audit --omit=dev --audit-level=${AUDIT_LEVEL}..."
  npm audit --omit=dev --audit-level="${AUDIT_LEVEL}"
)
