const { test, expect } = require('@playwright/test');

test.describe('TASK-1725: Alicante English-speaking healthcare providers', () => {
  test('should display Alicante medical clinics category page', async ({ page }) => {
    await page.goto('/alicante/medical-clinics');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Medical Clinics');
    await expect(page.locator('text=Alicante')).toBeVisible();
  });

  test('should find Alicante Expat Medical Center in Alicante medical clinics listing', async ({ page }) => {
    await page.goto('/alicante/medical-clinics');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Alicante Expat Medical Center');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Alicante Expat Medical Center')).toBeVisible();
    await expect(page.locator('text=Medical Clinics')).toBeVisible();
  });

  test('should find Costa Blanca Health Clinic in Alicante medical clinics listing', async ({ page }) => {
    await page.goto('/alicante/medical-clinics');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'Costa Blanca Health Clinic');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('text=Costa Blanca Health Clinic')).toBeVisible();
    await expect(page.locator('text=Medical Clinics')).toBeVisible();
  });

  test('should display Alicante Expat Medical Center details page with contact info', async ({ page }) => {
    await page.goto('/alicante/medical-clinics');
    await page.waitForLoadState('networkidle');

    const card = page.locator('article:has-text("Alicante Expat Medical Center")');
    await card.locator('text=View Profile').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/listing\/\d+/);
    await expect(page.locator('h1')).toContainText('Alicante Expat Medical Center');
    await expect(page.locator('text=+34 965 12 34 56')).toBeVisible();
    await expect(page.locator('text=info@alicantexpatmedical.com')).toBeVisible();
  });

  test('should display Costa Blanca Health Clinic details page with contact info', async ({ page }) => {
    await page.goto('/alicante/medical-clinics');
    await page.waitForLoadState('networkidle');

    const card = page.locator('article:has-text("Costa Blanca Health Clinic")');
    await card.locator('text=View Profile').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/listing\/\d+/);
    await expect(page.locator('h1')).toContainText('Costa Blanca Health Clinic');
    await expect(page.locator('text=+34 965 98 76 54')).toBeVisible();
    await expect(page.locator('text=appointments@costablancahealth.es')).toBeVisible();
  });
});
