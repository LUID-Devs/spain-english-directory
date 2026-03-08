const { test, expect } = require('@playwright/test');

test.describe('TASK-1689: Costa del Sol Dental Tourism Clinics', () => {
  
  test('should display Marbella dentists category page', async ({ page }) => {
    await page.goto('/marbella/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Dentists');
  });

  test('should display Fuengirola dentists category page', async ({ page }) => {
    await page.goto('/fuengirola/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Dentists');
  });

  test('should display Malaga dentists category page', async ({ page }) => {
    await page.goto('/malaga/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Dentists');
  });

  test('should find Crooke & Laguna Dental Clinic in Marbella', async ({ page }) => {
    await page.goto('/marbella/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Crooke & Laguna Dental Clinic')).toBeVisible();
  });

  test('should find British Dental Clinic in Fuengirola', async ({ page }) => {
    await page.goto('/fuengirola/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=British Dental Clinic Costa del Sol')).toBeVisible();
  });

  test('should find Malaga Dental Clinic', async ({ page }) => {
    await page.goto('/malaga/dentists');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Malaga Dental Clinic')).toBeVisible();
  });

  test('should have no console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.goto('/marbella/dentists');
    await page.waitForLoadState('networkidle');
    expect(consoleErrors).toHaveLength(0);
  });
});
