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
  });
});
