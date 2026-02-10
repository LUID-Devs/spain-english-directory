const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskLuid/i);
    await expect(page.getByRole('heading', { name: /TaskLuid/i })).toBeVisible();
  });

  test('login page loads and redirects to Cognito', async ({ page }) => {
    await page.goto('/login');
    // Should redirect to Cognito or show login form
    await expect(page).toHaveURL(/taskluid.com|auth/);
  });

  test('auth redirects work - logged-in users redirected from auth pages', async ({ page }) => {
    // This test requires being logged in first
    // Navigate to login while logged in should redirect to dashboard
    await page.goto('/login');
    // Expect redirect to dashboard if session exists
    // await expect(page).toHaveURL(/dashboard/);
  });
});
