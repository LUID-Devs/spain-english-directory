const { test, expect } = require('@playwright/test');

test.describe('TASK-1695: Bilbao English-Speaking Healthcare Providers', () => {
  test('should render Bilbao hospitals page with Quironsalud listing', async ({ page }) => {
    await page.goto('/bilbao/hospitals');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Hospitals');
    const card = page.locator('article:has-text("Hospital Quirónsalud Bizkaia")');
    await expect(card).toBeVisible();
    await expect(card.locator('text=+34 944 00 70 00')).toBeVisible();
    await expect(card.locator('text=English')).toBeVisible();
  });

  test('should render Bilbao medical clinics page with IMQ listings', async ({ page }) => {
    await page.goto('/bilbao/medical-clinics');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Medical Clinics');
    await expect(page.locator('article:has-text("IMQ Zorrotzaurre Klinika")')).toBeVisible();
    await expect(page.locator('article:has-text("Clínica Virgen Blanca")')).toBeVisible();
  });

  test('should find Bilbao providers from city search', async ({ page }) => {
    await page.goto('/bilbao');
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="search-input"]', 'IMQ Zorrotzaurre Klinika');
    await page.press('[data-testid="search-input"]', 'Enter');
    await expect(page.locator('article:has-text("IMQ Zorrotzaurre Klinika")')).toBeVisible();

    await page.fill('[data-testid="search-input"]', 'Hospital Quirónsalud Bizkaia');
    await page.press('[data-testid="search-input"]', 'Enter');
    await expect(page.locator('article:has-text("Hospital Quirónsalud Bizkaia")')).toBeVisible();
  });

  test('should open Bilbao hospital detail page', async ({ page }) => {
    await page.goto('/bilbao/hospitals');
    await page.waitForLoadState('networkidle');

    const card = page.locator('article:has-text("Hospital Quirónsalud Bizkaia")');
    await card.locator('text=View Profile').click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Hospital Quirónsalud Bizkaia');
    await expect(page.locator('text=Carretera de Leioa-Unbe 33')).toBeVisible();
    await expect(page.locator('text=Biscay')).toBeVisible();
  });
});
