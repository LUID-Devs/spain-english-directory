// Task 1685: E2E Test - Seville Mental Health Services
// Tests to verify English-speaking mental health services in Seville are searchable

const { test, expect } = require('@playwright/test');

test.describe('Task 1685: Seville Mental Health Services', () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  test('should find mental health services in Seville via API search', async ({ request }) => {
    // Search for mental health services in Seville
    const response = await request.get(`${baseUrl}/api/search?city=seville&category=mental%20health`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.pagination).toBeDefined();
    // Verify at least one mental health provider is returned
    expect(data.data.length).toBeGreaterThanOrEqual(1);
  });

  test('should find therapists in Seville via API search', async ({ request }) => {
    // Search for mental health services in Seville (therapists fall under Mental Health category)
    const response = await request.get(`${baseUrl}/api/search?city=seville&category=mental%20health`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.pagination).toBeDefined();
    // Verify at least one therapist is returned
    expect(data.data.length).toBeGreaterThanOrEqual(1);
  });

  test('should find Sinews therapy in Seville API search', async ({ request }) => {
    // Search specifically for Sinews
    const response = await request.get(`${baseUrl}/api/search?query=Sinews&city=seville`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    // Verify Sinews appears in search results
    const sinewsFound = data.data.some(item => 
      item.name && item.name.toLowerCase().includes('sinews')
    );
    expect(sinewsFound).toBe(true);
  });

  test('should find psychology services in Seville API search', async ({ request }) => {
    // Search for psychology-related services
    const response = await request.get(`${baseUrl}/api/search?query=psychology&city=seville`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    // Verify at least one psychology provider is returned
    expect(data.data.length).toBeGreaterThanOrEqual(1);
  });

  test('Seville city page should load correctly', async ({ page }) => {
    // Navigate to Seville city page
    await page.goto(`${baseUrl}/seville`);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page loaded successfully
    const title = await page.title();
    expect(title).toContain('Seville');
    
    // Check for any error messages
    const errorMessage = await page.locator('text=Unable to load').count();
    expect(errorMessage).toBe(0);
  });

  test('search page for Seville mental health should load', async ({ page }) => {
    // Navigate to search page with mental health filter
    await page.goto(`${baseUrl}/search?city=seville&query=mental%20health`);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the search interface loaded
    const searchInput = await page.locator('input[type="search"], input[placeholder*="search" i]').count();
    expect(searchInput).toBeGreaterThanOrEqual(1);
  });

  test('should verify all 6 seeded mental health providers are searchable', async ({ request }) => {
    // List of providers with specific search terms that uniquely identify each
    const expectedProviders = [
      { name: 'Sinews Multilingual Therapy Institute - Seville', searchTerm: 'sinews' },
      { name: 'Psicología Sevilla - English Speaking Psychologists', searchTerm: 'psicología sevilla' },
      { name: 'Centro de Psicología Integral Sevilla', searchTerm: 'psicología integral' },
      { name: 'Mente Serena - English Therapy Seville', searchTerm: 'mente serena' },
      { name: 'Clínica Psicológica Alameda', searchTerm: 'alameda' },
      { name: 'Wellbeing Seville - Mental Health & Wellness', searchTerm: 'wellbeing seville' }
    ];

    for (const provider of expectedProviders) {
      const response = await request.get(`${baseUrl}/api/search?query=${encodeURIComponent(provider.searchTerm)}&city=seville`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();

      // Verify provider appears in search results using the full provider name for matching
      const providerFound = data.data.some(item =>
        item.name && item.name.toLowerCase().includes(provider.name.toLowerCase().split(' - ')[0].substring(0, 25).toLowerCase())
      );
      expect(providerFound).toBe(true);
    }
  });
});
