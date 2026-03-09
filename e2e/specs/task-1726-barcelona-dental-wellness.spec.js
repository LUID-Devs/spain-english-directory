const { test, expect } = require('@playwright/test');

test.describe('TASK-1726: Barcelona dental and wellness services', () => {
  test('should display Barcelona dentists category page', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Dentists');
  });

  test('should find Barcelona Smile Studio in Barcelona listings', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Barcelona Smile Studio')).toBeVisible();
  });

  test('should display Barcelona Smile Studio details', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');

    await page.click('text=Barcelona Smile Studio');

    await expect(page.locator('h1')).toContainText('Barcelona Smile Studio');
    await expect(page.locator('text=+34 932 723 890')).toBeVisible();
  });

  test('should find Dr. Emily Chen Dental Care in Barcelona listings', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Dr. Emily Chen Dental Care')).toBeVisible();
  });

  test('should find dental services via search', async ({ page }) => {
    await page.goto('/barcelona');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Smile Studio');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Barcelona Smile Studio')).toBeVisible();
  });

  test('should have no console errors on Barcelona dental pages', async ({ page }) => {
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });
});
