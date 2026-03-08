const { test, expect } = require('@playwright/test');

test.describe('TASK-1668: My Medica Medical Clinic Valencia', () => {
  test('should display Valencia doctors category page', async ({ page }) => {
    await page.goto('/valencia/doctors');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Doctors');
    await expect(page.locator('text=Valencia')).toBeVisible();
  });

  test('should find My Medica Medical Clinic in Valencia doctors listing', async ({ page }) => {
    await page.goto('/valencia/doctors');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=My Medica Medical Clinic')).toBeVisible();
  });

  test('should display My Medica Medical Clinic contact information', async ({ page }) => {
    await page.goto('/valencia/doctors');
    await page.waitForLoadState('networkidle');

    await page.click('text=My Medica Medical Clinic');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('My Medica Medical Clinic');
    await expect(page.locator('text=+34 963 145 000')).toBeVisible();
    await expect(page.locator('text=Plaza Ayuntamiento 26')).toBeVisible();
    await expect(page.locator('text=English')).toBeVisible();
  });
});
