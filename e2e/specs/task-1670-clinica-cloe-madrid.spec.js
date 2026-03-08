const { test, expect } = require('@playwright/test');

test.describe('TASK-1670: Clinica Cloe Dental Madrid', () => {
  test('should display Madrid dentists category page', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Verify page loads with correct title
    await expect(page.locator('h1')).toContainText('Dentists');
    await expect(page.locator('text=Madrid')).toBeVisible();
  });

  test('should find Clinica Cloe in Madrid dentists listing', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Verify Clinica Cloe appears in results
    await expect(page.locator('text=Clinica Cloe')).toBeVisible();
  });

  test('should display Clinica Cloe details when clicked', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Click on Clinica Cloe
    await page.click('text=Clinica Cloe');
    await page.waitForLoadState('networkidle');

    // Verify details page shows the clinic name
    await expect(page.locator('h1')).toContainText('Clinica Cloe');
  });

  test('should show Clinica Cloe contact information', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Click on Clinica Cloe
    await page.click('text=Clinica Cloe');
    await page.waitForLoadState('networkidle');

    // Verify contact details are visible
    await expect(page.locator('text=+34 915 55 12 34')).toBeVisible();
    await expect(page.locator('text=Fuencarral')).toBeVisible();
  });

  test('should verify Clinica Cloe has English-speaking indication', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Click on Clinica Cloe
    await page.click('text=Clinica Cloe');
    await page.waitForLoadState('networkidle');

    // Verify English language is shown
    await expect(page.locator('text=English')).toBeVisible();
  });

  test('should filter Clinica Cloe by implants specialty', async ({ page }) => {
    await page.goto('/madrid/dentists?specialty=Implants');
    await page.waitForLoadState('networkidle');

    // Verify Clinica Cloe appears when filtering by implants
    await expect(page.locator('text=Clinica Cloe')).toBeVisible();
  });

  test('should filter Clinica Cloe by cosmetic dentistry specialty', async ({ page }) => {
    await page.goto('/madrid/dentists?specialty=Cosmetic+Dentistry');
    await page.waitForLoadState('networkidle');

    // Verify Clinica Cloe appears when filtering by cosmetic dentistry
    await expect(page.locator('text=Clinica Cloe')).toBeVisible();
  });

  test('should navigate from Madrid main page to dentists category', async ({ page }) => {
    await page.goto('/madrid');
    await page.waitForLoadState('networkidle');

    // Look for dentists link and click it
    await page.click('a[href*="dentists"]');
    await page.waitForLoadState('networkidle');

    // Verify navigation to dentists page
    await expect(page).toHaveURL(/\/madrid\/dentists/);
    await expect(page.locator('h1')).toContainText('Dentists');
  });

  test('should have no console errors on Clinica Cloe related pages', async ({ page }) => {
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Test Madrid dentists page
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Click on Clinica Cloe to check detail page
    await page.click('text=Clinica Cloe');
    await page.waitForLoadState('networkidle');

    // Assert no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should verify Clinica Cloe has all required fields', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Click on Clinica Cloe
    await page.click('text=Clinica Cloe');
    await page.waitForLoadState('networkidle');

    // Verify required fields on detail page
    await expect(page.locator('h1')).toContainText('Clinica Cloe');
    await expect(page.locator('text=+34 915 55 12 34')).toBeVisible();
    await expect(page.locator('text=Dentists')).toBeVisible();

    // Verify description contains key services
    await expect(page.locator('text=implants')).toBeVisible();
    await expect(page.locator('text=cosmetic')).toBeVisible();
  });

  test('should display Clinica Cloe with correct specialties', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Verify Clinica Cloe is visible
    await expect(page.locator('text=Clinica Cloe')).toBeVisible();

    // Click to see details
    await page.click('text=Clinica Cloe');
    await page.waitForLoadState('networkidle');

    // Verify specialties are shown
    await expect(page.locator('text=General Dentistry')).toBeVisible();
    await expect(page.locator('text=Implants')).toBeVisible();
  });
});
