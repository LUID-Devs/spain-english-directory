const { test, expect } = require('@playwright/test');

test.describe('TASK-1666: Clinica Dental Barcelona', () => {
  test('should display Barcelona dentists category page', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Dentists');
    await expect(page.locator('h1')).toContainText('Barcelona');
  });

  test('should list Clinica Dental Barcelona in dentists listings', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Clinica Dental Barcelona')).toBeVisible();
  });

  test('should show Clinica Dental Barcelona profile details', async ({ page }) => {
    await page.goto('/barcelona/dentists');
    await page.waitForLoadState('networkidle');

    const card = page.locator('article:has-text("Clinica Dental Barcelona")');
    await expect(card).toBeVisible();
    await card.getByRole('link', { name: 'View Profile' }).click();

    await expect(page).toHaveURL(/\/listing\/\d+/);
    await expect(page.locator('h1')).toContainText('Clinica Dental Barcelona');
    await expect(page.locator('text=Carrer de Balmes, 152, 08008 Barcelona')).toBeVisible();

    const languagesSection = page.getByRole('heading', { name: 'Languages' }).locator('..');
    await expect(languagesSection.getByText('English')).toBeVisible();
    await expect(languagesSection.getByText('Spanish')).toBeVisible();

    await expect(page.locator('text=Visit Website')).toBeVisible();
  });
});
