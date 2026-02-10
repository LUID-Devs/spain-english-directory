# TaskLuid E2E Tests

End-to-end tests using Playwright.

## Setup

```bash
cd /root/.openclaw/agents/main/workspace/tests/e2e
npm install
npx playwright install
```

## Run Tests

```bash
# Run all tests
npm test

# Run with UI mode
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug

# Run specific spec file
npx playwright test specs/auth.spec.js

# Run on specific project
npx playwright test --project=chromium
```

## Test Structure

- `auth.spec.js` - Authentication flows
- `dashboard.spec.js` - Dashboard functionality
- `tasks.spec.js` - Task management
- `projects.spec.js` - Project management
- `search.spec.js` - Search functionality
- `team.spec.js` - Team management
- `settings.spec.js` - User settings

## Notes

- Tests run against https://taskluid.com
- Screenshots saved on failure
- HTML report generated in `playwright-report/`
