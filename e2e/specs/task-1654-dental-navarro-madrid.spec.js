const { test, expect } = require('@playwright/test');

test.describe('TASK-1654: Dental Clinic Navarro Madrid', () => {
  
  test('should display Madrid dentists category page', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText('Dentists');
  });

  test('should find Dental Clinic Navarro in Madrid', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=Dental Clinic Navarro')).toBeVisible();
  });

  test('should display Dental Clinic Navarro details', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Dental Clinic Navarro');
    
    await expect(page.locator('h1')).toContainText('Dental Clinic Navarro');
    await expect(page.locator('text=+34 913 642 872')).toBeVisible();
  });

  test('should find Dental Clinic Navarro via search', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    
    await page.fill('[data-testid="search-input"]', 'Dental Clinic Navarro');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    await expect(page.locator('text=Dental Clinic Navarro')).toBeVisible();
  });

  test('should have no console errors on Madrid dental pages', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');
    
    expect(consoleErrors).toHaveLength(0);
  });
});
