const { test, expect } = require('@playwright/test');

test.describe('TASK-1730: Clínica Dental B&J (Las Gabias)', () => {
  test('should display Las Gabias dentists category page', async ({ page }) => {
    await page.goto('/las-gabias/dentists');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Dentists');
    await expect(page.locator('h1')).toContainText('Las Gabias');
  });

  test('should find Clínica Dental B&J in Las Gabias listings', async ({ page }) => {
    await page.goto('/las-gabias/dentists');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('article:has-text("Clínica Dental B&J")')).toBeVisible();
  });

  test('should display Clínica Dental B&J details on listing card', async ({ page }) => {
    await page.goto('/las-gabias/dentists');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=+34 958 58 41 26')).toBeVisible();
    await expect(page.locator('text=Calle Real de Málaga')).toBeVisible();
    await expect(page.locator('text=Emergency Dentistry')).toBeVisible();
  });

  test('should find Clínica Dental B&J via search', async ({ page }) => {
    await page.goto('/las-gabias/dentists');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Clínica Dental B&J');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Clínica Dental B&J')).toBeVisible();
  });

  test('should have no console errors on Las Gabias dentists page', async ({ page }) => {
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/las-gabias/dentists');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });
});
