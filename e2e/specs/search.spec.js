const { test, expect } = require('@playwright/test');

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('global search works', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/Search/i).first();
    await searchBox.fill('test');
    await page.waitForTimeout(300);
    // Should show search results dropdown
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('advanced search modal opens', async ({ page }) => {
    // Look for advanced search button/link
    await page.getByRole('button', { name: /Advanced/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Advanced Search/i })).toBeVisible();
  });

  test('filter by type works', async ({ page }) => {
    await page.getByRole('button', { name: /Advanced/i }).click();
    await page.getByLabel(/Type/i).selectOption('tasks');
    await expect(page.getByLabel(/Type/i)).toHaveValue('tasks');
  });

  test('filter by status works', async ({ page }) => {
    await page.getByRole('button', { name: /Advanced/i }).click();
    await page.getByLabel(/Status/i).selectOption('done');
    await expect(page.getByLabel(/Status/i)).toHaveValue('done');
  });
});
