const { test, expect } = require('@playwright/test');

test.describe('TASK-1674: Tejada Solicitors Malaga City (By Appointment)', () => {
  test('should display Malaga lawyers category page', async ({ page }) => {
    await page.goto('/malaga/lawyers');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Lawyers');
    await expect(page.locator('h1')).toContainText('Malaga');
  });

  test('should find Tejada Solicitors in Malaga lawyers listing', async ({ page }) => {
    await page.goto('/malaga/lawyers');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Tejada');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Tejada Solicitors - Malaga City (By Appointment)')).toBeVisible();
    await expect(page.locator('text=Lawyers')).toBeVisible();
    await expect(page.locator('text=Tejada Solicitors - Malaga City Office')).toHaveCount(0);
  });

  test('should display updated appointment-only address on listing card', async ({ page }) => {
    await page.goto('/malaga/lawyers');
    await page.waitForLoadState('networkidle');

    const card = page.locator('article:has-text("Tejada Solicitors - Malaga City (By Appointment)")');
    await expect(card.locator('text=Malaga city consultations by appointment only (main office in Vélez-Málaga)')).toBeVisible();
  });

  test('should show Tejada Solicitors details page with contact info', async ({ page }) => {
    await page.goto('/malaga/lawyers');
    await page.waitForLoadState('networkidle');

    const card = page.locator('article:has-text("Tejada Solicitors - Malaga City (By Appointment)")');
    await card.locator('text=View Profile').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/listing\/\d+/);
    await expect(page.locator('h1')).toContainText('Tejada Solicitors - Malaga City (By Appointment)');
    await expect(page.locator('text=+34 952 55 82 28')).toBeVisible();
    await expect(page.locator('text=info@tejadasolicitors.com')).toBeVisible();
    await expect(page.locator('text=appointment only')).toBeVisible();
  });
});
