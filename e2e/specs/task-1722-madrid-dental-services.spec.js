const { test, expect } = require('@playwright/test');

test.describe('TASK-1722: Madrid English-speaking dental services', () => {
  test('should display Madrid dentists category page', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Dentists');
    await expect(page.locator('text=Madrid')).toBeVisible();
  });

  test('should find Madrid Dental Care in Madrid dentists listing', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Madrid Dental Care');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Madrid Dental Care')).toBeVisible();
    await expect(page.locator('text=Dentists')).toBeVisible();
  });

  test('should find Smile Studio Madrid in Madrid dentists listing', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Smile Studio Madrid');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Smile Studio Madrid')).toBeVisible();
    await expect(page.locator('text=Dentists')).toBeVisible();
  });

  test('should display Madrid Dental Care details page with contact info', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    const card = page.locator('article:has-text("Madrid Dental Care")');
    await card.locator('text=View Profile').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/listing\/\d+/);
    await expect(page.locator('h1')).toContainText('Madrid Dental Care');
    await expect(page.locator('text=+34 914 35 67 89')).toBeVisible();
    await expect(page.locator('text=info@madriddentalcare.es')).toBeVisible();
  });

  test('should display Smile Studio Madrid details page with contact info', async ({ page }) => {
    await page.goto('/madrid/dentists');
    await page.waitForLoadState('networkidle');

    const card = page.locator('article:has-text("Smile Studio Madrid")');
    await card.locator('text=View Profile').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/listing\/\d+/);
    await expect(page.locator('h1')).toContainText('Smile Studio Madrid');
    await expect(page.locator('text=+34 915 23 45 67')).toBeVisible();
    await expect(page.locator('text=appointments@smilestudiomadrid.com')).toBeVisible();
  });
});
