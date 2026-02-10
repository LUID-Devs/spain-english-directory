const { test, expect } = require('@playwright/test');

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first - you'll need to implement actual login
    await page.goto('/dashboard');
    // Handle auth if needed
  });

  test('stats cards display (4 cards)', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-card"]')).toHaveCount(4);
  });

  test('recent tasks table loads', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.locator('table tbody tr')).toHaveCount.greaterThan(0);
  });

  test('charts render', async ({ page }) => {
    await expect(page.locator('[data-testid="priority-chart"]')).toBeVisible();
  });

  test('sidebar navigation works', async ({ page }) => {
    await page.getByRole('link', { name: /My Tasks/i }).click();
    await expect(page).toHaveURL(/tasks/);
    
    await page.getByRole('link', { name: /Projects/i }).click();
    await expect(page).toHaveURL(/projects/);
  });

  test('pinned projects display', async ({ page }) => {
    const pinnedSection = page.locator('[data-testid="pinned-projects"]');
    await expect(pinnedSection).toBeVisible();
  });
});
