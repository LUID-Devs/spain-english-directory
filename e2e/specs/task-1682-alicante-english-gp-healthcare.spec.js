// Task 1682: E2E Test - Alicante English-Speaking GP/Healthcare
// Verifies Alicante-area GP and healthcare providers are searchable via API

const { test, expect } = require('@playwright/test');

test.describe('Task 1682: Alicante English-Speaking GP/Healthcare', () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  test('should find healthcare providers in Alicante via API search', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/search?city=alicante&category=healthcare`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.pagination).toBeDefined();
    expect(data.data.length).toBeGreaterThanOrEqual(1);
  });

  test('should find Dr Alexandra Berger in Alicante search', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/search?query=Alexandra%20Berger&city=alicante`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    const providerFound = data.data.some(item =>
      item.name && item.name.toLowerCase().includes('alexandra berger')
    );
    expect(providerFound).toBe(true);
  });

  test('should find Medcare Medical Centre in Alicante search', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/search?query=Medcare%20Medical%20Centre&city=alicante`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    const providerFound = data.data.some(item =>
      item.name && item.name.toLowerCase().includes('medcare medical centre')
    );
    expect(providerFound).toBe(true);
  });

  test('should find Euro Clínica Albir in Alicante search', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/search?query=Euro%20Cl%C3%ADnica%20Albir&city=albir`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    const providerFound = data.data.some(item =>
      item.name && item.name.toLowerCase().includes('euro clínica albir')
    );
    expect(providerFound).toBe(true);
  });

  test('should find IMED Levante Hospital in Benidorm search', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/search?query=IMED%20Levante&city=benidorm`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    const providerFound = data.data.some(item =>
      item.name && item.name.toLowerCase().includes('imed levante hospital')
    );
    expect(providerFound).toBe(true);
  });

  test('Alicante city page should load correctly', async ({ page }) => {
    await page.goto(`${baseUrl}/alicante`);
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title).toContain('Alicante');

    const errorMessage = await page.locator('text=Unable to load').count();
    expect(errorMessage).toBe(0);
  });
});
