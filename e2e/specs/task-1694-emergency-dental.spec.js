const { test, expect } = require('@playwright/test');

test.describe('TASK-1694: Emergency Dental Clinics - Barcelona & Madrid', () => {
  
  test('should display Barcelona dentists category page', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Dentists');
  });

  test('should display Madrid dentists category page', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Dentists');
  });

  test('should find Dental Emergency Barcelona in listings', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Dental Emergency Barcelona')).toBeVisible();
  });

  test('should find Emergency Dentist Madrid in listings', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Emergency Dentist Madrid')).toBeVisible();
  });
});
