const { test, expect } = require('@playwright/test');

test.describe('TASK-1689: Costa del Sol Dental Tourism Clinics', () => {
  test('should display Marbella dentists category page', async ({ page }) => {
    await page.goto('/marbella/dentists');
    await page.waitForLoadState('networkidle');

    // Verify page loads
    await expect(page.locator('h1')).toContainText('Dentists');
    await expect(page.locator('text=Marbella')).toBeVisible();
  });

  test('should display Fuengirola dentists category page', async ({ page }) => {
    await page.goto('/fuengirola/dentists');
    await page.waitForLoadState('networkidle');

    // Verify page loads
    await expect(page.locator('h1')).toContainText('Dentists');
    await expect(page.locator('text=Fuengirola')).toBeVisible();
  });

  test('should display Malaga dentists category page', async ({ page }) => {
    await page.goto('/malaga/dentists');
    await page.waitForLoadState('networkidle');

    // Verify page loads
    await expect(page.locator('h1')).toContainText('Dentists');
    await expect(page.locator('text=Malaga')).toBeVisible();
  });

  test('should find Crooke & Laguna Dental Clinic in Marbella', async ({ page }) => {
    await page.goto('/marbella/dentists');
    await page.waitForLoadState('networkidle');

    // Search for Crooke & Laguna
    await page.fill('[data-testid="search-input"]', 'Crooke');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Verify clinic appears in results
    await expect(page.locator('text=Crooke & Laguna Dental Clinic')).toBeVisible();
    await expect(page.locator('text=dental implants')).toBeVisible();
  });

  test('should find British Dental Clinic in Fuengirola', async ({ page }) => {
    await page.goto('/fuengirola/dentists');
    await page.waitForLoadState('networkidle');

    // Search for British Dental
    await page.fill('[data-testid="search-input"]', 'British Dental');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Verify clinic appears in results
    await expect(page.locator('text=British Dental Clinic Costa del Sol')).toBeVisible();
    await expect(page.locator('text=UK-standard')).toBeVisible();
  });

  test('should find Malaga Dental Clinic', async ({ page }) => {
    await page.goto('/malaga/dentists');
    await page.waitForLoadState('networkidle');

    // Search for Malaga Dental
    await page.fill('[data-testid="search-input"]', 'Malaga Dental');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Verify clinic appears in results
    await expect(page.locator('text=Malaga Dental Clinic')).toBeVisible();
  });

  test('should display dental clinic details with English-speaking flag', async ({ page }) => {
    await page.goto('/marbella/dentists');
    await page.waitForLoadState('networkidle');

    // Click on Crooke & Laguna
    await page.click('text=Crooke & Laguna Dental Clinic');

    // Verify details page
    await expect(page.locator('h1')).toContainText('Crooke & Laguna Dental Clinic');
    await expect(page.locator('text=English-speaking')).toBeVisible();
    await expect(page.locator('text=Marbella')).toBeVisible();
  });

  test('should show contact information for Costa del Sol dental clinics', async ({ page }) => {
    await page.goto('/marbella/dentists');
    await page.waitForLoadState('networkidle');

    // Click on a dental clinic
    await page.click('text=Marbella Dental Center');

    // Verify contact details are visible
    await expect(page.locator('text=+34 952 825 400')).toBeVisible();
    await expect(page.locator('text=Calle José Meliá')).toBeVisible();
  });

  test('should verify dental tourism services are highlighted', async ({ page }) => {
    await page.goto('/marbella/dentists');
    await page.waitForLoadState('networkidle');

    // Search for dental tourism keywords
    await page.fill('[data-testid="search-input"]', 'implants');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Should find multiple results
    const resultCount = await page.locator('[data-testid="business-card"]').count();
    expect(resultCount).toBeGreaterThanOrEqual(2);
  });

  test('should find dental clinics in all three cities', async ({ page }) => {
    const cities = [
      { city: 'marbella', expected: ['Crooke & Laguna', 'Dental Care Marbella'] },
      { city: 'fuengirola', expected: ['British Dental', 'Costa Dental'] },
      { city: 'malaga', expected: ['Malaga Dental Clinic'] }
    ];

    for (const { city, expected } of cities) {
      await page.goto(`/${city}/dentists`);
      await page.waitForLoadState('networkidle');

      // Verify each expected clinic is visible
      for (const clinic of expected) {
        await expect(page.locator(`text=${clinic}`)).toBeVisible();
      }
    }
  });

  test('should navigate from Marbella main page to dentists category', async ({ page }) => {
    await page.goto('/marbella');
    await page.waitForLoadState('networkidle');

    // Click on dentists category
    await page.click('text=Dentists');

    // Verify navigation
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

    // Test Marbella
    await page.goto('/marbella/dentists');
    await page.waitForLoadState('networkidle');

    // Test Fuengirola
    await page.goto('/fuengirola/dentists');
    await page.waitForLoadState('networkidle');

    // Test Malaga
    await page.goto('/malaga/dentists');
    await page.waitForLoadState('networkidle');

    // Assert no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should verify Costa del Sol dental entries have required fields', async ({ page }) => {
    const clinics = [
      { name: 'Crooke & Laguna Dental Clinic', city: 'marbella', phone: '+34 952 864 848' },
      { name: 'Dental Care Marbella', city: 'marbella', phone: '+34 952 775 500' },
      { name: 'British Dental Clinic Costa del Sol', city: 'fuengirola', phone: '+34 952 467 500' },
      { name: 'Malaga Dental Clinic', city: 'malaga', phone: '+34 951 200 200' }
    ];

    for (const clinic of clinics) {
      await page.goto(`/${clinic.city}/dentists`);
      await page.waitForLoadState('networkidle');

      // Click on clinic
      await page.click(`text=${clinic.name}`);
      await page.waitForLoadState('networkidle');

      // Verify required fields
      await expect(page.locator('h1')).toContainText(clinic.name);
      await expect(page.locator(`text=${clinic.phone}`)).toBeVisible();
      await expect(page.locator('text=Dentists')).toBeVisible();

      // Go back
      await page.goto(`/${clinic.city}/dentists`);
    }
  });
});
