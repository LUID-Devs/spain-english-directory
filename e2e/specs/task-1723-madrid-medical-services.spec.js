const { test, expect } = require('@playwright/test');

test.describe('TASK-1723: Madrid English-speaking medical services', () => {
  test('should display Madrid doctors category page', async ({ page }) => {
    await page.goto('/madrid/doctors');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Doctors');
  });

  test('should find Dr. Sarah Williams Medical Practice in Madrid listings', async ({ page }) => {
    await page.goto('/madrid/doctors');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Dr. Sarah Williams Medical Practice')).toBeVisible();
  });

  test('should display Dr. Sarah Williams details', async ({ page }) => {
    await page.goto('/madrid/doctors');
    await page.waitForLoadState('networkidle');

    await page.click('text=Dr. Sarah Williams Medical Practice');

    await expect(page.locator('h1')).toContainText('Dr. Sarah Williams Medical Practice');
    await expect(page.locator('text=+34 915 678 234')).toBeVisible();
  });

  test('should find Madrid Expat Health Center in Madrid medical clinics', async ({ page }) => {
    await page.goto('/madrid/medical-clinics');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Madrid Expat Health Center')).toBeVisible();
  });

  test('should find medical services via search', async ({ page }) => {
    await page.goto('/madrid');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Sarah Williams');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Dr. Sarah Williams Medical Practice')).toBeVisible();
  });

  test('should have no console errors on Madrid medical services pages', async ({ page }) => {
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/madrid/doctors');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });
});
