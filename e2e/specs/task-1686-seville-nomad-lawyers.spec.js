const { test, expect } = require('@playwright/test');

test.describe('TASK-1686: Seville Digital Nomad Visa Lawyers', () => {
  
  test('should display Seville legal category page', async ({ page }) => {
    await page.goto('/seville/lawyers');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Lawyers');
    await expect(page.locator('text=Seville')).toBeVisible();
  });

  test('should find Lexidy Law Firm in Seville', async ({ page }) => {
    await page.goto('/seville/lawyers');
    await page.waitForLoadState('networkidle');
    
    // Search for Lexidy
    await page.fill('[data-testid="search-input"]', 'Lexidy');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify Lexidy appears in results
    await expect(page.locator('text=Lexidy Law Firm')).toBeVisible();
    await expect(page.locator('text=Digital Nomad')).toBeVisible();
  });

  test('should find Giambrone International Law Firm in Seville', async ({ page }) => {
    await page.goto('/seville/lawyers');
    await page.waitForLoadState('networkidle');
    
    // Search for Giambrone
    await page.fill('[data-testid="search-input"]', 'Giambrone');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify Giambrone appears in results
    await expect(page.locator('text=Giambrone International Law Firm')).toBeVisible();
    await expect(page.locator('text=Digital Nomad')).toBeVisible();
  });

  test('should find both Seville immigration law firms', async ({ page }) => {
    await page.goto('/seville/lawyers');
    await page.waitForLoadState('networkidle');
    
    const expectedFirms = [
      'Lexidy Law Firm',
      'Giambrone International Law Firm'
    ];
    
    // Check each firm is listed
    for (const firm of expectedFirms) {
      await expect(page.locator(`text=${firm}`)).toBeVisible();
    }
  });

  test('should display lawyer details with English-speaking flag', async ({ page }) => {
    await page.goto('/seville/lawyers');
    await page.waitForLoadState('networkidle');
    
    // Click on first lawyer
    await page.click('text=Lexidy Law Firm');
    
    // Verify details page
    await expect(page.locator('h1')).toContainText('Lexidy Law Firm');
    await expect(page.locator('text=English-speaking')).toBeVisible();
    await expect(page.locator('text=Digital Nomad Visa')).toBeVisible();
  });

  test('should show contact information for Seville lawyers', async ({ page }) => {
    await page.goto('/seville/lawyers');
    await page.waitForLoadState('networkidle');
    
    // Click on a lawyer
    await page.click('text=Lexidy Law Firm');
    
    // Verify contact details are visible
    await expect(page.locator('text=+34 915 367 806')).toBeVisible();
    await expect(page.locator('text=lexidy.com')).toBeVisible();
    await expect(page.locator('text=Remote service')).toBeVisible();
  });

  test('should verify Digital Nomad Visa specialization is highlighted', async ({ page }) => {
    await page.goto('/seville/lawyers');
    await page.waitForLoadState('networkidle');
    
    // Search for digital nomad
    await page.fill('[data-testid="search-input"]', 'digital nomad');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Should find results
    const resultCount = await page.locator('[data-testid="business-card"]').count();
    expect(resultCount).toBeGreaterThanOrEqual(1);
  });

  test('should navigate from Seville main page to lawyers category', async ({ page }) => {
    await page.goto('/seville');
    await page.waitForLoadState('networkidle');
    
    // Click on lawyers category
    await page.click('text=Lawyers');
    
    // Verify navigation
    await expect(page).toHaveURL(/\/seville\/lawyers/);
    await expect(page.locator('h1')).toContainText('Lawyers');
  });

  test('should have no console errors on Seville lawyers page', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/seville/lawyers');
    await page.waitForLoadState('networkidle');
    
    // Click through lawyers
    await page.click('text=Lexidy Law Firm');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/seville/lawyers');
    await page.click('text=Giambrone International Law Firm');
    await page.waitForLoadState('networkidle');
    
    // Assert no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should verify all Seville lawyer entries have required fields', async ({ page }) => {
    const firms = [
      { name: 'Lexidy Law Firm', phone: '+34 915 367 806', email: 'info@lexidy.com' },
      { name: 'Giambrone International Law Firm', phone: '+34 932 201 627', email: 'info@giambronelaw.com' }
    ];
    
    for (const firm of firms) {
      await page.goto('/seville/lawyers');
      await page.waitForLoadState('networkidle');
      
      // Click on firm
      await page.click(`text=${firm.name}`);
      await page.waitForLoadState('networkidle');
      
      // Verify required fields
      await expect(page.locator('h1')).toContainText(firm.name);
      await expect(page.locator(`text=${firm.phone}`)).toBeVisible();
      await expect(page.locator('text=Legal')).toBeVisible();
      await expect(page.locator('text=Seville')).toBeVisible();
      
      // Go back
      await page.goto('/seville/lawyers');
    }
  });
});
