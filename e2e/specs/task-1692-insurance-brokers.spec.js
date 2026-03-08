const { test, expect } = require('@playwright/test');

test.describe('TASK-1692: Insurance Brokers - All Major Cities', () => {
  
  test('should display Insurance Brokers category page for Madrid', async ({ page }) => {
    await page.goto('/madrid/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Insurance Brokers');
    await expect(page.locator('text=Madrid')).toBeVisible();
  });

  test('should display Insurance Brokers category page for Barcelona', async ({ page }) => {
    await page.goto('/barcelona/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Insurance Brokers');
    await expect(page.locator('text=Barcelona')).toBeVisible();
  });

  test('should display Insurance Brokers category page for Valencia', async ({ page }) => {
    await page.goto('/valencia/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Insurance Brokers');
    await expect(page.locator('text=Valencia')).toBeVisible();
  });

  test('should display Insurance Brokers category page for Malaga', async ({ page }) => {
    await page.goto('/malaga/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Insurance Brokers');
    await expect(page.locator('text=Malaga')).toBeVisible();
  });

  test('should find Sanitas International in Madrid', async ({ page }) => {
    await page.goto('/madrid/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify business appears in results
    await expect(page.locator('text=Sanitas')).toBeVisible();
  });

  test('should find Adeslas in Madrid', async ({ page }) => {
    await page.goto('/madrid/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify business appears in results
    await expect(page.locator('text=Adeslas')).toBeVisible();
  });

  test('should find DKV Seguros in Barcelona', async ({ page }) => {
    await page.goto('/barcelona/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify business appears in results
    await expect(page.locator('text=DKV')).toBeVisible();
  });

  test('should find Cigna Global in Barcelona', async ({ page }) => {
    await page.goto('/barcelona/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify business appears in results
    await expect(page.locator('text=Cigna')).toBeVisible();
  });

  test('should find AXA Seguros in Valencia', async ({ page }) => {
    await page.goto('/valencia/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify business appears in results
    await expect(page.locator('text=AXA')).toBeVisible();
  });

  test('should find Mapfre in Valencia', async ({ page }) => {
    await page.goto('/valencia/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify business appears in results
    await expect(page.locator('text=Mapfre')).toBeVisible();
  });

  test('should find Integra Global in Malaga', async ({ page }) => {
    await page.goto('/malaga/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify business appears in results
    await expect(page.locator('text=Integra Global')).toBeVisible();
  });

  test('should find Bupa Global in Malaga', async ({ page }) => {
    await page.goto('/malaga/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify business appears in results
    await expect(page.locator('text=Bupa')).toBeVisible();
  });

  test('should find Iberian Insurance Services in Malaga', async ({ page }) => {
    await page.goto('/malaga/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify business appears in results
    await expect(page.locator('text=Iberian Insurance')).toBeVisible();
  });

  test('should find Expat Insurance Spain in Barcelona', async ({ page }) => {
    await page.goto('/barcelona/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify business appears in results
    await expect(page.locator('text=Expat Insurance')).toBeVisible();
  });

  test('should find Health Insurance Direct in Madrid', async ({ page }) => {
    await page.goto('/madrid/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Verify business appears in results
    await expect(page.locator('text=Health Insurance Direct')).toBeVisible();
  });

  test('should display Sanitas International details page', async ({ page }) => {
    await page.goto('/madrid/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Click on Sanitas
    await page.click('text=Sanitas International');
    
    // Verify details page
    await expect(page.locator('h1')).toContainText('Sanitas International');
    await expect(page.locator('text=+34 915 042 400')).toBeVisible();
    await expect(page.locator('text=Calle de Orense')).toBeVisible();
  });

  test('should display DKV Seguros Barcelona details page', async ({ page }) => {
    await page.goto('/barcelona/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Click on DKV
    await page.click('text=DKV Seguros Barcelona');
    
    // Verify details page
    await expect(page.locator('h1')).toContainText('DKV Seguros Barcelona');
    await expect(page.locator('text=Avinguda Diagonal')).toBeVisible();
    await expect(page.locator('text=+34 934 946 000')).toBeVisible();
  });

  test('should show health insurance specialties', async ({ page }) => {
    await page.goto('/madrid/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Click on Sanitas
    await page.click('text=Sanitas International');
    await page.waitForLoadState('networkidle');
    
    // Verify specialties are listed
    await expect(page.locator('text=Health Insurance')).toBeVisible();
  });

  test('should verify multilingual support for insurance brokers', async ({ page }) => {
    await page.goto('/barcelona/insurance-brokers');
    await page.waitForLoadState('networkidle');
    
    // Click on Cigna
    await page.click('text=Cigna Global Health Insurance');
    await page.waitForLoadState('networkidle');
    
    // Verify multiple languages
    await expect(page.locator('text=English')).toBeVisible();
  });

  test('should have no console errors on insurance brokers pages', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Test all city insurance broker pages
    const cities = ['madrid', 'barcelona', 'valencia', 'malaga'];
    
    for (const city of cities) {
      await page.goto(`/${city}/insurance-brokers`);
      await page.waitForLoadState('networkidle');
    }
    
    // Assert no console errors
    expect(consoleErrors).toHaveLength(0);
  });
});
