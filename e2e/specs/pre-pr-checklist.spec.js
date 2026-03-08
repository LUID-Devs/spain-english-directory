const { test, expect } = require('@playwright/test');

/**
 * Pre-PR Checklist Tests
 * Run this before every PR to ensure quality
 */

test.describe('Pre-PR Quality Checklist', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  test('✅ All pages load without errors', async ({ page }) => {
    const pages = ['/', '/businesses', '/dashboard', '/settings'];
    
    for (const url of pages) {
      await page.goto(url);
      await expect(page.locator('[data-testid="error-boundary"]')).not.toBeVisible();
      await expect(page.locator('body')).not.toContainText('Application error');
    }
  });

  test('✅ No console errors on navigation', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.click('[data-testid="nav-businesses"]');
    await page.click('[data-testid="nav-dashboard"]');
    await page.click('[data-testid="nav-settings"]');

    expect(errors).toHaveLength(0);
  });

  test('✅ All interactive elements are clickable', async ({ page }) => {
    await page.goto('/businesses');

    // Buttons
    await expect(page.locator('[data-testid="add-business-button"]')).toBeEnabled();
    await expect(page.locator('[data-testid="search-input"]')).toBeEnabled();
    await expect(page.locator('[data-testid="filter-category"]')).toBeEnabled();

    // Links
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-settings"]')).toBeVisible();
  });

  test('✅ Forms validate correctly', async ({ page }) => {
    await page.goto('/businesses/new');

    // Submit empty form
    await page.click('[data-testid="submit-business"]');

    // Check required fields show errors
    const requiredFields = [
      'business-name',
      'business-category',
      'business-city'
    ];

    for (const field of requiredFields) {
      await expect(page.locator(`[data-testid="error-${field}"]`)).toBeVisible();
    }
  });

  test('✅ API endpoints respond correctly', async ({ page }) => {
    const responses = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    await page.goto('/businesses');
    await page.waitForLoadState('networkidle');

    // Check all API calls succeeded
    for (const resp of responses) {
      expect(resp.status).toBeLessThan(400);
    }
  });

  test('✅ Mobile responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu works
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    
    // Check content is visible (not cut off)
    await expect(page.locator('h1')).toBeVisible();
  });

  test('✅ Accessibility - keyboard navigation', async ({ page }) => {
    await page.goto('/businesses');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).not.toBe('BODY');
  });

  test('✅ Loading states work correctly', async ({ page }) => {
    await page.goto('/businesses');
    
    // Should show loading initially
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Should hide loading when data loaded
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="business-list"]')).toBeVisible();
  });

  test('✅ Error boundaries catch errors', async ({ page }) => {
    // Navigate to a page that might error
    await page.goto('/businesses/invalid-id');
    
    // Should show error boundary, not crash
    const hasError = await page.locator('[data-testid="error-boundary"]').isVisible().catch(() => false);
    const hasContent = await page.locator('text=Not Found').isVisible().catch(() => false);
    
    expect(hasError || hasContent).toBeTruthy();
  });

  test('✅ Data persists after refresh', async ({ page }) => {
    // Create or navigate to data
    await page.goto('/businesses');
    const firstBusiness = await page.locator('[data-testid="business-card"]').first().textContent();
    
    // Refresh
    await page.reload();
    
    // Data should still be there
    await expect(page.locator('[data-testid="business-card"]').first()).toContainText(firstBusiness);
  });

  test('✅ Visual regression - no unintended changes', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png', { threshold: 0.2 });
    
    await page.goto('/businesses');
    await expect(page).toHaveScreenshot('businesses.png', { threshold: 0.2 });
    
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot('dashboard.png', { threshold: 0.2 });
  });
});
