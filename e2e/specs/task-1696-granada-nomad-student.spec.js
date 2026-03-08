const { test, expect } = require('@playwright/test');

test.describe('TASK-1696: Granada Digital Nomad & Student Services', () => {
  test('should display Granada coworking category page', async ({ page }) => {
    await page.goto('/granada/coworking-spaces');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Coworking Spaces');
    await expect(page.locator('text=Granada')).toBeVisible();
  });

  test('should find Coworking Granada listing', async ({ page }) => {
    await page.goto('/granada/coworking-spaces');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Coworking Granada');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Coworking Granada')).toBeVisible();
    await expect(page.locator('text=community events')).toBeVisible();
  });

  test('should find Lexidy Law Firm in Granada lawyers category', async ({ page }) => {
    await page.goto('/granada/lawyers');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Lexidy');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Lexidy Law Firm - Granada')).toBeVisible();
  });

  test('should show Granada student housing in realtors category', async ({ page }) => {
    await page.goto('/granada/realtors');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Student Housing');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Granada Student Housing')).toBeVisible();
  });

  test('should find Delengua Spanish School in language schools', async ({ page }) => {
    await page.goto('/granada/language-schools');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Delengua');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Delengua Spanish School')).toBeVisible();
  });

  test('should display student health clinic details', async ({ page }) => {
    await page.goto('/granada/medical-clinics');
    await page.waitForLoadState('networkidle');

    await page.click('text=Granada International Student Health Center');

    await expect(page.locator('h1')).toContainText('Granada International Student Health Center');
    await expect(page.locator('text=English-speaking')).toBeVisible();
    await expect(page.locator('text=Granada')).toBeVisible();
  });
});
