# E2E Testing Guide for Devs

## 🎯 Required: Run Tests Before Every PR

**NO PR should be created without passing E2E tests.**

## 📁 Directory Structure

```
e2e/
├── .auth/                    # Authentication state storage
│   └── user.json            # Saved auth state (gitignored)
├── audit/                    # Audit screenshots
├── playwright-report/        # HTML test reports
├── screenshots/              # Test failure screenshots
├── scripts/                  # Reusable test scripts
│   ├── audit-auth-routes.mjs
│   ├── capture-auth-page.mjs
│   ├── chaos-auth-crud.mjs
│   ├── save-auth-state.mjs
│   ├── stress-auth-workflows.mjs
│   ├── test-dashboard-actions.mjs
│   ├── test-dashboard-onboarding-button.mjs
│   ├── test-projects-deep.mjs
│   └── test-tasks-deep.mjs
├── specs/                    # Main test specs
│   ├── auth.spec.js
│   ├── dashboard.spec.js
│   ├── projects.spec.js
│   ├── search.spec.js
│   ├── settings.spec.js
│   ├── tasks.spec.js
│   └── team.spec.js
└── test-results/             # Test output
    └── .last-run.json
```

## 🚀 Quick Commands

```bash
# Run all tests
npm run test:e2e

# Run with UI (for debugging)
npm run test:e2e:ui

# Run specific spec
npx playwright test e2e/specs/auth.spec.js

# Run with screenshots on failure
npm run test:e2e:screenshots

# View report
npm run test:e2e:report
```

## 🔐 Authentication Setup

### Step 1: Capture Auth State (One-time)
```bash
node e2e/scripts/save-auth-state.mjs
```
This opens browser, you login manually, saves state to `e2e/.auth/user.json`

### Step 2: Use Auth in Tests
```javascript
// e2e/specs/dashboard.spec.js
test.use({ storageState: 'e2e/.auth/user.json' });

test('dashboard loads', async ({ page }) => {
  await page.goto('/dashboard');
  // Already logged in!
});
```

## 📸 Screenshot Verification

### Automatic Screenshots on Failure
Playwright auto-captures screenshots on test failure to `e2e/screenshots/`

### Manual Screenshot Comparison
```javascript
test('visual regression', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png', {
    threshold: 0.2
  });
});
```

### Audit Screenshots
```bash
# Capture current state for audit
node e2e/scripts/capture-auth-page.mjs
```

## ✅ Pre-PR Checklist

Before creating a PR, run:

```bash
# 1. Build passes
npm run build

# 2. Lint passes
npm run lint

# 3. Unit tests pass
npm test

# 4. E2E tests pass (REQUIRED)
npm run test:e2e

# 5. Check screenshots (if visual changes)
ls e2e/screenshots/
```

## 🧪 Writing Tests

### Basic Test Template
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/your-route');
  });

  test('should work correctly', async ({ page }) => {
    // Arrange
    await page.click('[data-testid="button"]');
    
    // Act
    await page.fill('[data-testid="input"]', 'test value');
    await page.click('[data-testid="submit"]');
    
    // Assert
    await expect(page.locator('[data-testid="success"]')).toBeVisible();
    await expect(page).toHaveURL('/success');
  });

  test('screenshot verification', async ({ page }) => {
    await expect(page).toHaveScreenshot('feature-page.png');
  });
});
```

### Testing CRUD Operations
```javascript
test('full CRUD flow', async ({ page }) => {
  // Create
  await page.click('text=Add New');
  await page.fill('[name="title"]', 'Test Item');
  await page.click('text=Save');
  await expect(page.locator('text=Test Item')).toBeVisible();
  
  // Read
  await page.click('text=Test Item');
  await expect(page.locator('h1')).toContainText('Test Item');
  
  // Update
  await page.click('text=Edit');
  await page.fill('[name="title"]', 'Updated Item');
  await page.click('text=Save');
  await expect(page.locator('text=Updated Item')).toBeVisible();
  
  // Delete
  await page.click('text=Delete');
  await page.click('text=Confirm');
  await expect(page.locator('text=Updated Item')).not.toBeVisible();
});
```

## 🔧 Utility Scripts

### Save Auth State
```javascript
// e2e/scripts/save-auth-state.mjs
const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000/login');
  
  // Manual login here
  console.log('Please login manually, then press Enter...');
  process.stdin.once('data', async () => {
    await context.storageState({ path: 'e2e/.auth/user.json' });
    await browser.close();
    console.log('Auth state saved!');
  });
})();
```

### Audit Script
```javascript
// e2e/scripts/audit-auth-routes.mjs
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'e2e/.auth/user.json'
  });
  const page = await context.newPage();
  
  const routes = ['/dashboard', '/profile', '/settings'];
  
  for (const route of routes) {
    await page.goto(`http://localhost:3000${route}`);
    await page.screenshot({ path: `e2e/audit/${route.replace('/', '')}.png` });
  }
  
  await browser.close();
})();
```

## ⚠️ Important Rules

1. **NEVER commit `e2e/.auth/user.json`** — it's gitignored
2. **ALWAYS use `data-testid`** attributes for selectors
3. **SCREENSHOT on failure** — check `e2e/screenshots/` when tests fail
4. **RUN tests before PR** — `npm run test:e2e` is REQUIRED
5. **UPDATE screenshots** if UI changes intentionally

## 🐛 Debugging Failed Tests

```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Run with debugger
npx playwright test --debug

# View trace
npx playwright show-trace e2e/test-results/trace.zip

# Check screenshots
ls -la e2e/screenshots/
open e2e/screenshots/*.png
```

## 📊 CI/CD Integration

Tests run automatically on PR:
- Fail = Block merge
- Pass = Allow merge

See `.github/workflows/e2e.yml`
