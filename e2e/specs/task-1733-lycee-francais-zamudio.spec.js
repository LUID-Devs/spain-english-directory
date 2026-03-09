const { test, expect } = require('@playwright/test');

test.describe('TASK-1733: Lycée Français de Zamudio', () => {
  test('should display Bilbao schools category page', async ({ page }) => {
    await page.goto('/bilbao/schools');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Schools');
    await expect(page.locator('h1')).toContainText('Bilbao');
  });

  test('should find Lycée Français de Zamudio in Bilbao listings', async ({ page }) => {
    await page.goto('/bilbao/schools');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('article:has-text("Lycée Français de Zamudio")')).toBeVisible();
  });

  test('should display Lycée Français de Zamudio details on listing card', async ({ page }) => {
    await page.goto('/bilbao/schools');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=+34 946 712 911')).toBeVisible();
    await expect(page.locator('text=Parque Tecnológico')).toBeVisible();
    await expect(page.locator('text=French international school')).toBeVisible();
  });

  test('should find Lycée Français de Zamudio via search', async ({ page }) => {
    await page.goto('/bilbao/schools');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Lycée Français');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Lycée Français de Zamudio')).toBeVisible();
  });

  test('should have no console errors on Bilbao schools page', async ({ page }) => {
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/bilbao/schools');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });
});
