const { test, expect } = require('@playwright/test');

test.describe('TASK-1652: Simple English Advice - Gestor Malaga', () => {
  
  test('should display Malaga gestors category page', async ({ page }) => {
    await page.goto('/malaga/gestors');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Gestors');
    await expect(page.locator('text=Malaga')).toBeVisible();
  });

  test('should find Simple English Advice in gestors listing', async ({ page }) => {
    await page.goto('/malaga/gestors');
    await page.waitForLoadState('networkidle');
    
    // Search for Simple English Advice
    await page.fill('[data-testid="search-input"]', 'Simple English Advice');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify business appears in results
    await expect(page.locator('text=Simple English Advice')).toBeVisible();
    await expect(page.locator('text=English-speaking')).toBeVisible();
  });

  test('should display Simple English Advice details page', async ({ page }) => {
    await page.goto('/malaga/gestors');
    await page.waitForLoadState('networkidle');
    
    // Search for and click on Simple English Advice
    await page.fill('[data-testid="search-input"]', 'Simple English Advice');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click('text=Simple English Advice');
    
    // Verify details page
    await expect(page.locator('h1')).toContainText('Simple English Advice');
    await expect(page.locator('text=English-speaking')).toBeVisible();
    await expect(page.locator('text=Malaga')).toBeVisible();
  });

  test('should show Simple English Advice contact information', async ({ page }) => {
    await page.goto('/malaga/gestors');
    await page.waitForLoadState('networkidle');
    
    // Search and navigate to business
    await page.fill('[data-testid="search-input"]', 'Simple English Advice');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click('text=Simple English Advice');
    await page.waitForLoadState('networkidle');
    
    // Verify contact details from listings.ts (rating 4.9, 100 reviews)
    await expect(page.locator('text=+34 951 74 51 68')).toBeVisible();
    await expect(page.locator('text=simpleenglishadvice.com')).toBeVisible();
    await expect(page.locator('text=info@simpleenglishadvice.com')).toBeVisible();
    // Verify rating and review count match listings.ts
    await expect(page.locator('text=4.9 (100 reviews)')).toBeVisible();
  });

  test('should display gestor services offered', async ({ page }) => {
    await page.goto('/malaga/gestors');
    await page.waitForLoadState('networkidle');
    
    // Search for Simple English Advice
    await page.fill('[data-testid="search-input"]', 'Simple English Advice');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click('text=Simple English Advice');
    await page.waitForLoadState('networkidle');
    
    // Verify services are listed
    await expect(page.locator('text=Vehicle Transfers')).toBeVisible();
    await expect(page.locator('text=Driving Licence Exchange')).toBeVisible();
    await expect(page.locator('text=Autónomo Registration')).toBeVisible();
  });

  test('should verify multilingual services are highlighted', async ({ page }) => {
    await page.goto('/malaga/gestors');
    await page.waitForLoadState('networkidle');
    
    // Search for Simple English Advice
    await page.fill('[data-testid="search-input"]', 'Simple English Advice');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click('text=Simple English Advice');
    await page.waitForLoadState('networkidle');
    
    // Verify languages
    await expect(page.locator('text=English')).toBeVisible();
    await expect(page.locator('text=Spanish')).toBeVisible();
  });

  test('should navigate from Malaga main page to gestors category', async ({ page }) => {
    await page.goto('/malaga');
    await page.waitForLoadState('networkidle');
    
    // Click on gestors category
    await page.click('text=Gestors');
    
    // Verify navigation
    await expect(page).toHaveURL(/\/malaga\/gestors/);
    await expect(page.locator('h1')).toContainText('Gestors');
  });

  test('should have no console errors on gestor pages', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/malaga/gestors');
    await page.waitForLoadState('networkidle');
    
    // Search and navigate
    await page.fill('[data-testid="search-input"]', 'Simple English Advice');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click('text=Simple English Advice');
    await page.waitForLoadState('networkidle');
    
    // Assert no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should verify description mentions award-winning service', async ({ page }) => {
    await page.goto('/malaga/gestors');
    await page.waitForLoadState('networkidle');
    
    // Search for Simple English Advice
    await page.fill('[data-testid="search-input"]', 'Simple English Advice');
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click('text=Simple English Advice');
    await page.waitForLoadState('networkidle');
    
    // Verify description contains key information from listings.ts
    await expect(page.locator('text=award-winning', { ignoreCase: true })).toBeVisible();
    await expect(page.locator('text=expat', { ignoreCase: true })).toBeVisible();
    await expect(page.locator('text=Digital Nomad Visa')).toBeVisible();
  });
});
