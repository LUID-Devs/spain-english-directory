const { test, expect } = require('@playwright/test');

test.describe('TASK-1688: Seville English-Speaking Healthcare Providers', () => {
  
  test('should display Seville healthcare category page', async ({ page }) => {
    await page.goto('/seville/doctors');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Doctors');
    await expect(page.locator('text=Seville')).toBeVisible();
  });

  test('should find Hospital Quirónsalud Sevilla', async ({ page }) => {
    await page.goto('/seville/doctors');
    await page.waitForLoadState('networkidle');
    
    // Search for Quirónsalud
    await page.fill('[data-testid="search-input"]', 'Quirónsalud');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify Quirónsalud appears in results
    await expect(page.locator('text=Hospital Quirónsalud Sevilla')).toBeVisible();
    await expect(page.locator('text=Hospital')).toBeVisible();
  });

  test('should find Hospital Vithas Sevilla', async ({ page }) => {
    await page.goto('/seville/doctors');
    await page.waitForLoadState('networkidle');
    
    // Search for Vithas
    await page.fill('[data-testid="search-input"]', 'Vithas');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify Vithas appears in results
    await expect(page.locator('text=Hospital Vithas Sevilla')).toBeVisible();
    await expect(page.locator('text=Private hospital')).toBeVisible();
  });

  test('should find all 10 Seville healthcare providers', async ({ page }) => {
    await page.goto('/seville/doctors');
    await page.waitForLoadState('networkidle');
    
    const expectedProviders = [
      'Hospital Quirónsalud Sevilla',
      'Hospital Vithas Sevilla',
      'Hospital Universitario HM Sevilla',
      'Clínica Santa Isabel',
      'Centro Médico Maestranza',
      'Dental Care Sevilla',
      'Clínica Dental Sevilla',
      'Psicología Sevilla',
      'Therapy in Spain - Seville',
      'International Doctor Sevilla'
    ];
    
    // Check each provider is listed
    for (const provider of expectedProviders) {
      await expect(page.locator(`text=${provider}`)).toBeVisible();
    }
  });

  test('should find dental clinics in Seville', async ({ page }) => {
    await page.goto('/seville/dentists');
    await page.waitForLoadState('networkidle');
    
    // Verify dental clinics appear
    await expect(page.locator('text=Dental Care Sevilla')).toBeVisible();
    await expect(page.locator('text=Clínica Dental Sevilla')).toBeVisible();
    await expect(page.locator('text=Dentist')).toBeVisible();
  });

  test('should find therapists in Seville', async ({ page }) => {
    await page.goto('/seville/therapists');
    await page.waitForLoadState('networkidle');
    
    // Verify therapists appear
    await expect(page.locator('text=Psicología Sevilla')).toBeVisible();
    await expect(page.locator('text=Therapy in Spain - Seville')).toBeVisible();
    await expect(page.locator('text=Therapist')).toBeVisible();
  });

  test('should display healthcare provider details with English-speaking flag', async ({ page }) => {
    await page.goto('/seville/doctors');
    await page.waitForLoadState('networkidle');
    
    // Click on first provider
    await page.click('text=Hospital Quirónsalud Sevilla');
    
    // Verify details page
    await expect(page.locator('h1')).toContainText('Hospital Quirónsalud Sevilla');
    await expect(page.locator('text=English-speaking')).toBeVisible();
    await expect(page.locator('text=Hospital')).toBeVisible();
  });

  test('should show contact information for Seville healthcare providers', async ({ page }) => {
    await page.goto('/seville/doctors');
    await page.waitForLoadState('networkidle');
    
    // Click on a provider
    await page.click('text=Hospital Quirónsalud Sevilla');
    
    // Verify contact details are visible
    await expect(page.locator('text=+34 954 918 000')).toBeVisible();
    await expect(page.locator('text=Calle San Juan de Dios')).toBeVisible();
    await expect(page.locator('text=Seville')).toBeVisible();
  });

  test('should verify hospital entries have comprehensive descriptions', async ({ page }) => {
    await page.goto('/seville/doctors');
    await page.waitForLoadState('networkidle');
    
    // Click on hospital
    await page.click('text=Hospital Vithas Sevilla');
    
    // Verify comprehensive description
    await expect(page.locator('text=private hospital')).toBeVisible();
    await expect(page.locator('text=international')).toBeVisible();
    await expect(page.locator('text=English-speaking')).toBeVisible();
  });

  test('should navigate from Seville main page to doctors category', async ({ page }) => {
    await page.goto('/seville');
    await page.waitForLoadState('networkidle');
    
    // Click on doctors category
    await page.click('text=Doctors');
    
    // Verify navigation
    await expect(page).toHaveURL(/\/seville\/doctors/);
    await expect(page.locator('h1')).toContainText('Doctors');
  });

  test('should have no console errors on Seville healthcare pages', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/seville/doctors');
    await page.waitForLoadState('networkidle');
    
    // Click through several providers
    await page.click('text=Hospital Quirónsalud Sevilla');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/seville/dentists');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/seville/therapists');
    await page.waitForLoadState('networkidle');
    
    // Assert no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should verify all Seville healthcare entries have required fields', async ({ page }) => {
    const providers = [
      { name: 'Hospital Quirónsalud Sevilla', phone: '+34 954 918 000', category: 'Hospitals' },
      { name: 'Hospital Vithas Sevilla', phone: '+34 954 571 400', category: 'Hospitals' },
      { name: 'Hospital Universitario HM Sevilla', phone: '+34 954 591 000', category: 'Hospitals' },
      { name: 'Clínica Santa Isabel', phone: '+34 954 221 200', category: 'Medical Clinics' },
      { name: 'Centro Médico Maestranza', phone: '+34 954 561 800', category: 'Medical Clinics' },
      { name: 'Dental Care Sevilla', phone: '+34 954 224 700', category: 'Dentists' },
      { name: 'Clínica Dental Sevilla', phone: '+34 954 501 200', category: 'Dentists' },
      { name: 'Psicología Sevilla', phone: '+34 954 277 300', category: 'Therapists' },
      { name: 'Therapy in Spain - Seville', phone: '+34 954 090 800', category: 'Therapists' },
      { name: 'International Doctor Sevilla', phone: '+34 900 909 500', category: 'Doctors' }
    ];
    
    for (const provider of providers) {
      await page.goto('/seville/doctors');
      await page.waitForLoadState('networkidle');
      
      // Search for provider
      await page.fill('[data-testid="search-input"]', provider.name);
      await page.press('[data-testid="search-input"]', 'Enter');
      
      // Click on provider
      await page.click(`text=${provider.name}`);
      await page.waitForLoadState('networkidle');
      
      // Verify required fields
      await expect(page.locator('h1')).toContainText(provider.name);
      await expect(page.locator(`text=${provider.phone}`)).toBeVisible();
      await expect(page.locator('text=Seville')).toBeVisible();
      await expect(page.locator('text=English-speaking')).toBeVisible();
    }
  });
});
