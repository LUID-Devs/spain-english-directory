const { test, expect } = require('@playwright/test');

test.describe('TASK-1669: Therapy in Barcelona - Mental Health', () => {
  
  test('should display Barcelona mental health category page', async ({ page }) => {
    await page.goto('/barcelona/mental-health');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Mental Health');
    await expect(page.locator('text=Barcelona')).toBeVisible();
  });

  test('should find Therapy in Barcelona in mental health listing', async ({ page }) => {
    await page.goto('/barcelona/mental-health');
    await page.waitForLoadState('networkidle');
    
    // Search for Therapy in Barcelona
    await page.fill('[data-testid="search-input"]', 'Therapy in Barcelona');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify business appears in results
    await expect(page.locator('text=Therapy in Barcelona')).toBeVisible();
    await expect(page.locator('text=English-speaking')).toBeVisible();
  });

  test('should display Therapy in Barcelona details page', async ({ page }) => {
    await page.goto('/barcelona/mental-health');
    await page.waitForLoadState('networkidle');
    
    // Search for and click on Therapy in Barcelona
    await page.fill('[data-testid="search-input"]', 'Therapy in Barcelona');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click('text=Therapy in Barcelona');
    
    // Verify details page
    await expect(page.locator('h1')).toContainText('Therapy in Barcelona');
    await expect(page.locator('text=English-speaking')).toBeVisible();
    await expect(page.locator('text=Barcelona')).toBeVisible();
  });

  test('should show Therapy in Barcelona contact information', async ({ page }) => {
    await page.goto('/barcelona/mental-health');
    await page.waitForLoadState('networkidle');
    
    // Search and navigate to business
    await page.fill('[data-testid="search-input"]', 'Therapy in Barcelona');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click('text=Therapy in Barcelona');
    await page.waitForLoadState('networkidle');
    
    // Verify contact details
    await expect(page.locator('text=+34 644 522 369')).toBeVisible();
    await expect(page.locator('text=therapyinbarcelona.com')).toBeVisible();
    await expect(page.locator('text=Carrer de Paris')).toBeVisible();
  });

  test('should display mental health services offered', async ({ page }) => {
    await page.goto('/barcelona/mental-health');
    await page.waitForLoadState('networkidle');
    
    // Search for Therapy in Barcelona
    await page.fill('[data-testid="search-input"]', 'Therapy in Barcelona');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click('text=Therapy in Barcelona');
    await page.waitForLoadState('networkidle');
    
    // Verify services are listed
    await expect(page.locator('text=Individual Therapy')).toBeVisible();
    await expect(page.locator('text=Couples Counseling')).toBeVisible();
    await expect(page.locator('text=Online Therapy')).toBeVisible();
  });

  test('should verify multilingual services are highlighted', async ({ page }) => {
    await page.goto('/barcelona/mental-health');
    await page.waitForLoadState('networkidle');
    
    // Search for Therapy in Barcelona
    await page.fill('[data-testid="search-input"]', 'Therapy in Barcelona');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click('text=Therapy in Barcelona');
    await page.waitForLoadState('networkidle');
    
    // Verify multiple languages
    await expect(page.locator('text=English')).toBeVisible();
    await expect(page.locator('text=French')).toBeVisible();
    await expect(page.locator('text=German')).toBeVisible();
  });

  test('should navigate from Barcelona main page to mental health category', async ({ page }) => {
    await page.goto('/barcelona');
    await page.waitForLoadState('networkidle');
    
    // Click on mental health category
    await page.click('text=Mental Health');
    
    // Verify navigation
    await expect(page).toHaveURL(/\/barcelona\/mental-health/);
    await expect(page.locator('h1')).toContainText('Mental Health');
  });

  test('should have no console errors on mental health pages', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/barcelona/mental-health');
    await page.waitForLoadState('networkidle');
    
    // Search and navigate
    await page.fill('[data-testid="search-input"]', 'Therapy in Barcelona');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click('text=Therapy in Barcelona');
    await page.waitForLoadState('networkidle');
    
    // Assert no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should verify award information is displayed', async ({ page }) => {
    await page.goto('/barcelona/mental-health');
    await page.waitForLoadState('networkidle');
    
    // Search for Therapy in Barcelona
    await page.fill('[data-testid="search-input"]', 'Therapy in Barcelona');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click('text=Therapy in Barcelona');
    await page.waitForLoadState('networkidle');
    
    // Verify awards are mentioned
    await expect(page.locator('text=award-winning')).toBeVisible();
    await expect(page.locator('text=Most Compassionate')).toBeVisible();
  });
});
