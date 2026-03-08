# E2E Testing Requirements for Developers

## 🚨 CRITICAL: NO PR UNTIL ALL TESTS PASS

**If tests fail, FIX THEM FIRST. Do not create PR.**

---

## ✅ Pre-PR Checklist (MANDATORY)

```bash
# 1. Build passes
npm run build
# ✅ Must complete with 0 errors

# 2. Lint passes  
npm run lint
# ✅ Must have 0 errors, 0 warnings

# 3. E2E tests pass
npm run test:e2e
# ✅ Must have 0 failures
```

**Only when ALL THREE pass → Create PR**

---

## 🧪 What to Test

### 1. CRUD Operations
- **Create:** Can add new data (forms submit, API returns 201)
- **Read:** Can view data (lists load, details display)
- **Update:** Can edit data (changes save, API returns 200)
- **Delete:** Can remove data (confirm works, API returns 200)

### 2. User Interactions
- **Type:** All inputs accept text (no JS errors)
- **Click:** All buttons/links work (actions fire)
- **Select:** Dropdowns/radio/checkboxes work
- **Scroll:** Infinite scroll or long lists work
- **Hover:** Tooltips/dropdowns appear

### 3. Console & Network
- **Zero console errors** (check browser dev tools)
- **Zero network errors** (all API calls 200-299)
- **No 404s** for assets/images

### 4. Visual & Responsive
- **Desktop:** Looks good at 1280x720
- **Mobile:** Works at 375x667
- **No layout breaks** on resize

### 5. Data Integrity
- **Validation:** Forms reject invalid input
- **Persistence:** Data stays after refresh
- **Consistency:** No duplicate or missing data

---

## 📝 Writing Tests

### Basic Test Structure
```javascript
const { test, expect } = require('@playwright/test');

test('should do something', async ({ page }) => {
  // Arrange - setup
  await page.goto('/route');
  
  // Act - do the thing
  await page.click('[data-testid="button"]');
  await page.fill('[data-testid="input"]', 'value');
  
  // Assert - verify it worked
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
  await expect(page).toHaveURL('/new-route');
});
```

### Required Test Types

#### 1. Form Submission
```javascript
test('form submits correctly', async ({ page }) => {
  await page.goto('/form');
  
  // Fill all required fields
  await page.fill('[data-testid="name"]', 'Test Name');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.selectOption('[data-testid="category"]', 'Option');
  
  // Submit
  await page.click('[data-testid="submit"]');
  
  // Verify success
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
  await expect(page.locator('[data-testid="success"]')).toContainText('Created');
});
```

#### 2. API Error Handling
```javascript
test('shows error on API failure', async ({ page }) => {
  // Intercept and fail API
  await page.route('**/api/**', route => route.abort('failed'));
  
  await page.goto('/page');
  
  // Should show error UI, not crash
  await expect(page.locator('[data-testid="error"]')).toBeVisible();
  await expect(page.locator('[data-testid="retry"]')).toBeEnabled();
});
```

#### 3. Console Error Check
```javascript
test('no console errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.goto('/');
  await page.click('[data-testid="nav"]');
  
  expect(errors).toHaveLength(0);
});
```

---

## 🔍 Debugging Failed Tests

### Step 1: Check Screenshots
```bash
ls e2e/screenshots/
open e2e/screenshots/*.png  # See exactly what failed
```

### Step 2: View Test Report
```bash
npm run test:e2e:report
# Opens HTML report with details
```

### Step 3: Run Single Test with UI
```bash
npx playwright test e2e/specs/your-test.spec.js --ui
# Interactive debugging
```

### Step 4: Check Console
```bash
npx playwright test --headed
# Watch browser, check dev tools console
```

---

## 🛠️ Common Fixes

### Console Error: "Cannot read property of undefined"
```javascript
// Add null checks in your code
const value = data?.property?.nested;
```

### Test Timeout: Element not found
```javascript
// Add proper waits
await page.waitForSelector('[data-testid="element"]');
await page.click('[data-testid="element"]');
```

### Race Condition: Data not loaded
```javascript
// Wait for network idle
await page.goto('/');
await page.waitForLoadState('networkidle');
```

### Visual Regression: Screenshot mismatch
```bash
# If change is intentional:
npm run test:e2e:update-snapshots

# If not intentional:
# Fix the UI, re-run tests
```

---

## 📁 Test File Organization

```
e2e/specs/
├── auth.spec.js          # Login/logout
├── dashboard.spec.js     # Dashboard features
├── business-crud.spec.js # Create/read/update/delete
├── search.spec.js        # Search/filter
├── settings.spec.js      # User settings
└── pre-pr-checklist.spec.js # Quality checks
```

**Name your test file:** `e2e/specs/[feature-name].spec.js`

---

## 🎯 Example: Complete CRUD Test

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Business Management', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  const TEST_DATA = {
    name: 'Test Business ' + Date.now(),
    category: 'Healthcare',
    email: 'test@business.com'
  };

  test('full CRUD cycle', async ({ page }) => {
    // CREATE
    await page.goto('/businesses/new');
    await page.fill('[data-testid="name"]', TEST_DATA.name);
    await page.selectOption('[data-testid="category"]', TEST_DATA.category);
    await page.fill('[data-testid="email"]', TEST_DATA.email);
    await page.click('[data-testid="submit"]');
    
    await expect(page.locator('text=' + TEST_DATA.name)).toBeVisible();

    // READ
    await page.click('text=' + TEST_DATA.name);
    await expect(page.locator('h1')).toContainText(TEST_DATA.name);
    await expect(page.locator('[data-testid="email"]')).toContainText(TEST_DATA.email);

    // UPDATE
    await page.click('[data-testid="edit"]');
    const newName = TEST_DATA.name + ' Updated';
    await page.fill('[data-testid="name"]', newName);
    await page.click('[data-testid="save"]');
    
    await expect(page.locator('h1')).toContainText(newName);

    // DELETE
    await page.click('[data-testid="delete"]');
    await page.click('[data-testid="confirm"]');
    
    await expect(page.locator('text=' + newName)).not.toBeVisible();
  });
});
```

---

## ✅ Final Checklist Before PR

- [ ] `npm run build` passes
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run test:e2e` passes (0 failures)
- [ ] e2e/screenshots/ is empty (no failures)
- [ ] Browser console has 0 errors
- [ ] All API calls return 200-299
- [ ] Tests cover your changes
- [ ] Tests are in e2e/specs/ directory

**Only then → Create PR**

---

## 🆘 Help

**If stuck:**
1. Check screenshots in `e2e/screenshots/`
2. Run `npm run test:e2e:report` for HTML report
3. Add `await page.pause()` in test for debugging
4. Check Playwright docs: https://playwright.dev

**Remember: No PR until tests pass! 🚫**
