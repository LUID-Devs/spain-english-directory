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

  test('should find Urgencias Dentales Barcelona', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Urgencias Dentales Barcelona')).toBeVisible();
  });

  test('should find Dr. Sarah Thompson in Barcelona', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Dr. Sarah Thompson')).toBeVisible();
  });

  test('should find Barcelona Dental Urgency', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Barcelona Dental Urgency')).toBeVisible();
  });

  test('should find Madrid 24h Dental Emergency', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Madrid 24h Dental Emergency')).toBeVisible();
  });

  test('should find Dr. Michael O\'Brien in Madrid', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator("text=Dr. Michael O'Brien")).toBeVisible();
  });

  test('should find Madrid Dental SOS', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Madrid Dental SOS')).toBeVisible();
  });

  test('should find International Dental Emergency Madrid', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=International Dental Emergency Madrid')).toBeVisible();
  });

  test('should find Urgencia Dental 24h Madrid', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Urgencia Dental 24h Madrid')).toBeVisible();
  });

  test('should display emergency dental clinic details', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');
    await page.click('text=Dental Emergency Barcelona');
    await expect(page.locator('h1')).toContainText('Dental Emergency Barcelona');
  });

  test('should show contact information for Barcelona emergency dental clinics', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');
    await page.click('text=Dental Emergency Barcelona');
    await expect(page.locator('text=+34 931 234 567')).toBeVisible();
  });

  test('should show contact information for Madrid emergency dental clinics', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    await page.click('text=Emergency Dentist Madrid');
    await expect(page.locator('text=+34 914 321 876')).toBeVisible();
  });
});
