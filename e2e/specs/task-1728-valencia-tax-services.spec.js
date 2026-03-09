const { test, expect } = require('@playwright/test');

test.describe('TASK-1728: Valencia English-speaking tax services', () => {
  test('should display Valencia tax services category page', async ({ page }) => {
    await page.goto('/valencia/tax-services');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Tax Services');
    await expect(page.locator('text=Valencia')).toBeVisible();
  });

  test('should find Valencia Expat Tax Advisors in Valencia tax services listing', async ({ page }) => {
    await page.goto('/valencia/tax-services');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Valencia Expat Tax Advisors');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Valencia Expat Tax Advisors')).toBeVisible();
    await expect(page.locator('text=Tax Services')).toBeVisible();
  });

  test('should find Gestoría Internacional Valencia in Valencia tax services listing', async ({ page }) => {
    await page.goto('/valencia/tax-services');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Gestoría Internacional Valencia');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Gestoría Internacional Valencia')).toBeVisible();
    await expect(page.locator('text=Tax Services')).toBeVisible();
  });

  test('should display Valencia Expat Tax Advisors details page with contact info', async ({ page }) => {
    await page.goto('/valencia/tax-services');
    await page.waitForLoadState('networkidle');

    const card = page.locator('article:has-text("Valencia Expat Tax Advisors")');
    await card.locator('text=View Profile').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/listing\/\d+/);
    await expect(page.locator('h1')).toContainText('Valencia Expat Tax Advisors');
    await expect(page.locator('text=+34 963 45 67 89')).toBeVisible();
    await expect(page.locator('text=info@valenciaexpattax.es')).toBeVisible();
  });

  test('should display Gestoría Internacional Valencia details page with contact info', async ({ page }) => {
    await page.goto('/valencia/tax-services');
    await page.waitForLoadState('networkidle');

    const card = page.locator('article:has-text("Gestoría Internacional Valencia")');
    await card.locator('text=View Profile').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/listing\/\d+/);
    await expect(page.locator('h1')).toContainText('Gestoría Internacional Valencia');
    await expect(page.locator('text=+34 963 87 65 43')).toBeVisible();
    await expect(page.locator('text=contact@gestoriavalencia.com')).toBeVisible();
  });
});
