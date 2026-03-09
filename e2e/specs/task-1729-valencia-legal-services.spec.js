const { test, expect } = require('@playwright/test');

test.describe('TASK-1729: Valencia legal and professional services', () => {
  test('should display Valencia lawyers category page', async ({ page }) => {
    await page.goto('/valencia/lawyers');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Lawyers');
  });

  test('should find Valencia Legal Partners in Valencia listings', async ({ page }) => {
    await page.goto('/valencia/lawyers');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Valencia Legal Partners')).toBeVisible();
  });

  test('should display Valencia Legal Partners details', async ({ page }) => {
    await page.goto('/valencia/lawyers');
    await page.waitForLoadState('networkidle');

    await page.click('text=Valencia Legal Partners');

    await expect(page.locator('h1')).toContainText('Valencia Legal Partners');
    await expect(page.locator('text=+34 963 456 789')).toBeVisible();
  });

  test('should find Costa Blanca Lawyers in Valencia listings', async ({ page }) => {
    await page.goto('/valencia/lawyers');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Costa Blanca Lawyers')).toBeVisible();
  });

  test('should find legal services via search', async ({ page }) => {
    await page.goto('/valencia');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Valencia Legal Partners');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Valencia Legal Partners')).toBeVisible();
  });

  test('should have no console errors on Valencia legal services pages', async ({ page }) => {
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/valencia/lawyers');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });
});
