#!/usr/bin/env bash
# Fails on high or critical npm audit findings (includes moderate when AUDIT_LEVEL=moderate).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

AUDIT_LEVEL="${NPM_AUDIT_LEVEL:-high}"

if [ ! -f package-lock.json ]; then
  echo "package-lock.json missing — generating with npm i --package-lock-only..." >&2
  npm i --package-lock-only
fi

if [ ! -d node_modules ]; then
  echo "node_modules missing — running npm ci..." >&2
  npm ci
fi

echo "Running npm audit --audit-level=${AUDIT_LEVEL}..."
npm audit --audit-level="${AUDIT_LEVEL}"
