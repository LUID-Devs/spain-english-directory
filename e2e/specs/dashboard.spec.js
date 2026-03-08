const { test, expect } = require('@playwright/test');

// Use saved auth state for all tests in this file
test.use({ storageState: 'e2e/.auth/user.json' });

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should load dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-cards"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-businesses"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
  });

  test('should navigate to businesses', async ({ page }) => {
    await page.click('[data-testid="nav-businesses"]');
    await expect(page).toHaveURL('/businesses');
    await expect(page.locator('h1')).toContainText('Businesses');
  });

  test('should search businesses', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'dental');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('visual regression - dashboard', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard.png', {
      threshold: 0.2
    });
  });

  test('should add new business button work', async ({ page }) => {
    await page.click('[data-testid="add-business-button"]');
    await expect(page).toHaveURL('/businesses/new');
    await expect(page.locator('[data-testid="business-form"]')).toBeVisible();
  });
});
