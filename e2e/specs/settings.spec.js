const { test, expect } = require('@playwright/test');

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/settings');
  });

  test('profile info displays', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
    await expect(page.getByText(/Profile/i)).toBeVisible();
  });

  test('security section loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Security/i })).toBeVisible();
  });

  test('workspace settings display', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Workspace/i })).toBeVisible();
  });

  test('subscription shows free plan', async ({ page }) => {
    await expect(page.getByText(/Free/i)).toBeVisible();
  });
});
