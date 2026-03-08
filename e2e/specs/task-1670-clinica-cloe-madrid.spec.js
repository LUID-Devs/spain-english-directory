const { test, expect } = require('@playwright/test');

test.describe('TASK-1670: Clinica Cloe Dental Madrid', () => {
  test('should display Madrid dentists category page', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Verify page loads with correct title
    await expect(page.locator('h1')).toContainText('Dentists');
    await expect(page.locator('h1')).toContainText('Madrid');
  });

  test('should find Clinica Cloe in Madrid dentists listing', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Verify Clinica Cloe appears in results
    await expect(page.locator('text=Clinica Cloe')).toBeVisible();
    await expect(page.locator('text=English')).toBeVisible();
  });

  test('should display Clinica Cloe details on listing card', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Verify Clinica Cloe card shows key information
    await expect(page.locator('text=Clinica Cloe')).toBeVisible();
    await expect(page.locator('text=General Dentistry')).toBeVisible();
    await expect(page.locator('text=Implants')).toBeVisible();
  });

  test('should show Clinica Cloe contact information', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Verify contact details are visible
    await expect(page.locator('text=+34 915 55 12 34')).toBeVisible();
    await expect(page.locator('text=Fuencarral')).toBeVisible();
  });

  test('should verify Clinica Cloe has English language badge', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Verify English badge is visible on the card
    const card = page.locator('article:has-text("Clinica Cloe")');
    await expect(card.locator('text=English')).toBeVisible();
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

    // Click on dentists category link
    await page.click('a[href="/madrid/dentists"]');
    await page.waitForLoadState('networkidle');

    // Verify navigation
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

    // Assert no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should verify Clinica Cloe has all required fields', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Verify required fields are present
    await expect(page.locator('text=Clinica Cloe')).toBeVisible();
    await expect(page.locator('text=+34 915 55 12 34')).toBeVisible();
    await expect(page.locator('text=English')).toBeVisible();
    await expect(page.locator('text=Spanish')).toBeVisible();

    // Verify description contains key services
    await expect(page.locator('text=Implants')).toBeVisible();
    await expect(page.locator('text=Cosmetic Dentistry')).toBeVisible();
  });

  test('should link to Clinica Cloe detail page', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    // Click on View Profile link for Clinica Cloe
    const card = page.locator('article:has-text("Clinica Cloe")');
    await card.locator('text=View Profile').click();
    await page.waitForLoadState('networkidle');

    // Verify we're on the detail page
    await expect(page).toHaveURL(/\/listing\/\d+/);
    await expect(page.locator('h1')).toContainText('Clinica Cloe');
  });
});
