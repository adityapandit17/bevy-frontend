# Playwright E2E (BevyHR)

Separate from Cypress. Each core feature has its own spec file so you can run suites independently.

## Prerequisites

1. Backend: `cd backend && bundle exec rails server -p 3000`
2. Frontend: `cd frontend && yarn dev:3001`
3. Bevy Admin (for `bevy-admin` project): `cd bevy-admin && yarn dev`
4. Seeded DB: `cd backend && bundle exec rails db:seed`

## Install browsers (once)

```bash
cd frontend
yarn playwright:install
```

## Run all HRMS tests

```bash
yarn playwright
```

## Run a single feature suite

```bash
yarn playwright:auth
yarn playwright:dashboard
yarn playwright:employees
yarn playwright:attendance
yarn playwright:leave
yarn playwright:payroll
yarn playwright:recruitment
yarn playwright:settings
yarn playwright:signup
yarn playwright:bevy-admin
```

## UI mode (interactive debugging)

```bash
yarn playwright:ui
```

## HTML report (after a run)

```bash
yarn playwright:report
```

## Record a review / demo video

Runs tests in a visible browser with video capture (slow motion for readability):

```bash
yarn playwright:record
# or one suite:
yarn playwright:record:auth
```

Videos are saved under `frontend/test-results/**/video.webm`.

Open the HTML report for traces and screenshots:

```bash
yarn playwright:report
```

## Environment overrides

| Variable | Default |
|----------|---------|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:3001` |
| `PLAYWRIGHT_API_BASE_URL` | `http://localhost:3000` |
| `PLAYWRIGHT_BEVY_ADMIN_URL` | `http://localhost:3002` |
| `PLAYWRIGHT_ADMIN_EMAIL` | `admin@hrms.com` |
| `PLAYWRIGHT_ADMIN_PASSWORD` | `admin123` |
