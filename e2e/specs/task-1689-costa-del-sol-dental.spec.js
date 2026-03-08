const { test, expect } = require('@playwright/test');

test.describe('TASK-1689: Costa del Sol Dental Tourism Clinics', () => {
  
  test('should display Marbella dentists category page', async ({ page }) => {
    await page.goto('/marbella/dentists');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText('Dentists');
    await expect(page.locator('text=Marbella')).toBeVisible();
  });

  test('should display Fuengirola dentists category page', async ({ page }) => {
    await page.goto('/fuengirola/dentists');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText('Dentists');
    await expect(page.locator('text=Fuengirola')).toBeVisible();
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

  test('should display dental clinic details', async ({ page }) => {
    await page.goto('/marbella/dentists');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Crooke & Laguna Dental Clinic');
    
    await expect(page.locator('h1')).toContainText('Crooke & Laguna Dental Clinic');
  });

  test('should show contact information for dental clinics', async ({ page }) => {
    await page.goto('/marbella/dentists');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Marbella Dental Center');
    
    await expect(page.locator('text=+34 952 825 400')).toBeVisible();
  });

  test('should find dental clinics in all three cities', async ({ page }) => {
    const cities = [
      { city: 'marbella', expected: 'Crooke' },
      { city: 'fuengirola', expected: 'British Dental' },
      { city: 'malaga', expected: 'Malaga Dental' }
    ];
    
    for (const { city, expected } of cities) {
      await page.goto(`/${city}/dentists`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator(`text=${expected}`)).toBeVisible();
    }
  });

  test('should navigate from Marbella main page to dentists category', async ({ page }) => {
    await page.goto('/marbella');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Dentists');
    
    await expect(page).toHaveURL(/\/marbella\/dentists/);
    await expect(page.locator('h1')).toContainText('Dentists');
  });

  test('should have no console errors on Costa del Sol dental pages', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/marbella/dentists');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/fuengirola/dentists');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/malaga/dentists');
    await page.waitForLoadState('networkidle');
    
    expect(consoleErrors).toHaveLength(0);
  });
});
