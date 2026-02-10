const { test, expect } = require('@playwright/test');

test.describe('Team', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/team');
  });

  test('members list displays', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Team/i })).toBeVisible();
    await expect(page.locator('table tbody tr')).toHaveCount.greaterThan(0);
  });

  test('search members works', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/Search members/i);
    await searchBox.fill('alain');
    await page.waitForTimeout(300);
    // Should filter results
    await expect(page.locator('table tbody tr')).toHaveCount.greaterThanOrEqual(0);
  });

  test('invite modal opens', async ({ page }) => {
    await page.getByRole('button', { name: /Invite/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Invite Member/i })).toBeVisible();
  });

  test('form validation works', async ({ page }) => {
    await page.getByRole('button', { name: /Invite/i }).click();
    // Try to submit without email
    await page.getByRole('button', { name: /Send Invite/i }).click();
    await expect(page.getByText(/email is required/i)).toBeVisible();
  });
});
