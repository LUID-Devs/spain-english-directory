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

  test('should find Centre Dental Roca in Barcelona', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Centre Dental Roca')).toBeVisible();
  });

  test('should find Clínica Dental Urgencias Madrid', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Clínica Dental Urgencias Madrid')).toBeVisible();
  });

  test('should find Urgencias Dentales Barcelona', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Urgencias Dentales Barcelona')).toBeVisible();
  });

  test('should find Madrid Dental Emergency Center', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Madrid Dental Emergency Center')).toBeVisible();
  });

  test('should find The British Dental Clinic Barcelona', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=The British Dental Clinic Barcelona')).toBeVisible();
  });

  test('should find The English Dentist Madrid', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=The English Dentist Madrid')).toBeVisible();
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
    await expect(page.locator('text=+34 932 688 900')).toBeVisible();
  });

  test('should show contact information for Madrid emergency dental clinics', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    await page.click('text=Emergency Dentist Madrid');
    await expect(page.locator('text=+34 915 765 432')).toBeVisible();
  });
});
