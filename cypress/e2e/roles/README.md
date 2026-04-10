## Cypress role-based specs

This folder groups E2E specs by **user perspective** so it’s easy to run/inspect scenarios by role in the Cypress runner.

- `shared/`: cross-role flows (auth, general navigation, basic module smoke tests)
- `super-admin/`: company setup / settings / global management
- `hr/`: onboarding, employee management, leave approvals, etc.
- `dept-head/`: team views, approvals for department/team (if enabled)
- `employee/`: attendance (clock in/out), leave apply, self-service settings

### Modules to cover (planned)
- **Employee management**: directory, add/update, org structure, onboarding/offboarding
- **Assets**: add assets, allocate/unassign, maintenance, reporting
- **Attendance**: clock in/out, calendar, corrections, approvals
- **Leave**: apply, balances, approvals/rejections, calendar
- **Settings / Company**: policies, working hours, notifications, role/permission effects

