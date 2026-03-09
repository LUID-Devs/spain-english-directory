const { test, expect } = require('@playwright/test');

test.describe('TASK-1732: Trivium Abogados - Palma de Mallorca', () => {
  test('should display Palma de Mallorca lawyers category page', async ({ page }) => {
    await page.goto('/palma-de-mallorca/lawyers');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Lawyers');
    await expect(page.locator('text=Palma de Mallorca')).toBeVisible();
  });

  test('should find Trivium Abogados in Palma de Mallorca lawyers listing', async ({ page }) => {
    await page.goto('/palma-de-mallorca/lawyers');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Trivium Abogados');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Trivium Abogados')).toBeVisible();
    await expect(page.locator('text=Lawyers')).toBeVisible();
  });

  test('should display Trivium Abogados details page with contact info', async ({ page }) => {
    await page.goto('/palma-de-mallorca/lawyers');
    await page.waitForLoadState('networkidle');

    const card = page.locator('article:has-text("Trivium Abogados")');
    await card.locator('text=View Profile').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/listing\/\d+/);
    await expect(page.locator('h1')).toContainText('Trivium Abogados');
    await expect(page.locator('text=+34 971 21 05 40')).toBeVisible();
    await expect(page.locator('text=info@triviumabogados.com')).toBeVisible();
  });

  test('should display Trivium Abogados with English-speaking flag', async ({ page }) => {
    await page.goto('/palma-de-mallorca/lawyers');
    await page.waitForLoadState('networkidle');

    const card = page.locator('article:has-text("Trivium Abogados")');
    await expect(card.locator('text=English')).toBeVisible();
  });

  test('should display Trivium Abogados specialties', async ({ page }) => {
    await page.goto('/palma-de-mallorca/lawyers');
    await page.waitForLoadState('networkidle');

    const card = page.locator('article:has-text("Trivium Abogados")');
    await card.locator('text=View Profile').click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Immigration')).toBeVisible();
    await expect(page.locator('text=Real Estate')).toBeVisible();
    await expect(page.locator('text=Business Law')).toBeVisible();
  });
});
