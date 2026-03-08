const { test, expect } = require('@playwright/test');

test.describe('TASK-1696: Granada Digital Nomad & Student Services', () => {
  
  // ==========================================
  // DIGITAL NOMAD SERVICES TESTS
  // ==========================================
  
  test('should display Granada co-working spaces category page', async ({ page }) => {
    await page.goto('/granada/co-working-spaces');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Co-working Spaces');
    await expect(page.locator('text=Granada')).toBeVisible();
  });

  test('should find Coworking Granada in listings', async ({ page }) => {
    await page.goto('/granada/co-working-spaces');
    await page.waitForLoadState('networkidle');
    
    // Search for Coworking Granada
    await page.fill('[data-testid="search-input"]', 'Coworking Granada');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify listing appears
    await expect(page.locator('text=Coworking Granada')).toBeVisible();
    await expect(page.locator('text=digital nomads')).toBeVisible();
  });

  test('should find WorkIN Granada co-working space', async ({ page }) => {
    await page.goto('/granada/co-working-spaces');
    await page.waitForLoadState('networkidle');
    
    // Verify WorkIN Granada appears
    await expect(page.locator('text=WorkIN Granada')).toBeVisible();
    await expect(page.locator('text=remote professionals')).toBeVisible();
  });

  test('should find The Nomad Hub with rooftop terrace', async ({ page }) => {
    await page.goto('/granada/co-working-spaces');
    await page.waitForLoadState('networkidle');
    
    // Search for Nomad Hub
    await page.fill('[data-testid="search-input"]', 'Nomad Hub');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify listing
    await expect(page.locator('text=The Nomad Hub')).toBeVisible();
    await expect(page.locator('text=Alhambra')).toBeVisible();
  });

  test('should find Lexidy Law Firm for Digital Nomad Visas', async ({ page }) => {
    await page.goto('/granada/legal');
    await page.waitForLoadState('networkidle');
    
    // Search for Lexidy
    await page.fill('[data-testid="search-input"]', 'Lexidy');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify Lexidy appears
    await expect(page.locator('text=Lexidy Law Firm')).toBeVisible();
    await expect(page.locator('text=Digital Nomad')).toBeVisible();
  });

  test('should find Spain Digital Nomad Visa Services', async ({ page }) => {
    await page.goto('/granada/legal');
    await page.waitForLoadState('networkidle');
    
    // Search for digital nomad visa
    await page.fill('[data-testid="search-input"]', 'Digital Nomad Visa');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify listing appears
    await expect(page.locator('text=Spain Digital Nomad Visa Services')).toBeVisible();
  });

  test('should find Nomad Tax Advisors for remote workers', async ({ page }) => {
    await page.goto('/granada/tax-advisors');
    await page.waitForLoadState('networkidle');
    
    // Search for Nomad Tax
    await page.fill('[data-testid="search-input"]', 'Nomad Tax');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify listing
    await expect(page.locator('text=Nomad Tax Advisors')).toBeVisible();
    await expect(page.locator('text=remote worker')).toBeVisible();
  });

  test('should find Remote Worker Resources business services', async ({ page }) => {
    await page.goto('/granada/business-services');
    await page.waitForLoadState('networkidle');
    
    // Search for Remote Worker
    await page.fill('[data-testid="search-input"]', 'Remote Worker Resources');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify listing
    await expect(page.locator('text=Remote Worker Resources')).toBeVisible();
    await expect(page.locator('text=digital nomads')).toBeVisible();
  });

  test('should display all 7 digital nomad service entries', async ({ page }) => {
    await page.goto('/granada');
    await page.waitForLoadState('networkidle');
    
    const nomadServices = [
      'Coworking Granada',
      'WorkIN Granada',
      'Lexidy Law Firm',
      'Spain Digital Nomad Visa Services',
      'Nomad Tax Advisors',
      'The Nomad Hub',
      'Remote Worker Resources'
    ];
    
    // Check each service category
    for (const service of nomadServices) {
      await page.goto('/granada');
      await page.waitForLoadState('networkidle');
      await page.fill('[data-testid="search-input"]', service);
      await page.press('[data-testid="search-input"]', 'Enter');
      await expect(page.locator(`text=${service}`).first()).toBeVisible();
    }
  });

  // ==========================================
  // STUDENT SERVICES TESTS
  // ==========================================

  test('should display University of Granada International Student Office', async ({ page }) => {
    await page.goto('/granada/educational-services');
    await page.waitForLoadState('networkidle');
    
    // Search for University of Granada
    await page.fill('[data-testid="search-input"]', 'University of Granada');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify listing
    await expect(page.locator('text=University of Granada')).toBeVisible();
    await expect(page.locator('text=International Student')).toBeVisible();
  });

  test('should find Granada Student Housing', async ({ page }) => {
    await page.goto('/granada/real-estate');
    await page.waitForLoadState('networkidle');
    
    // Search for student housing
    await page.fill('[data-testid="search-input"]', 'Student Housing');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify listing
    await expect(page.locator('text=Granada Student Housing')).toBeVisible();
    await expect(page.locator('text=international students')).toBeVisible();
  });

  test('should find Student Visa Granada immigration services', async ({ page }) => {
    await page.goto('/granada/legal');
    await page.waitForLoadState('networkidle');
    
    // Search for Student Visa
    await page.fill('[data-testid="search-input"]', 'Student Visa Granada');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify listing
    await expect(page.locator('text=Student Visa Granada')).toBeVisible();
    await expect(page.locator('text=student visas')).toBeVisible();
  });

  test('should find Granada Student Support Center', async ({ page }) => {
    await page.goto('/granada/educational-services');
    await page.waitForLoadState('networkidle');
    
    // Search for Student Support
    await page.fill('[data-testid="search-input"]', 'Student Support Center');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify listing
    await expect(page.locator('text=Granada Student Support Center')).toBeVisible();
    await expect(page.locator('text=NIE')).toBeVisible();
  });

  test('should find Campus Life Granada student services', async ({ page }) => {
    await page.goto('/granada/educational-services');
    await page.waitForLoadState('networkidle');
    
    // Search for Campus Life
    await page.fill('[data-testid="search-input"]', 'Campus Life');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify listing
    await expect(page.locator('text=Campus Life Granada')).toBeVisible();
    await expect(page.locator('text=international students')).toBeVisible();
  });

  test('should find Delengua Spanish School', async ({ page }) => {
    await page.goto('/granada/language-schools');
    await page.waitForLoadState('networkidle');
    
    // Search for Delengua
    await page.fill('[data-testid="search-input"]', 'Delengua');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify listing
    await expect(page.locator('text=Delengua Spanish School')).toBeVisible();
    await expect(page.locator('text=Instituto Cervantes')).toBeVisible();
  });

  test('should find Granada International Student Health Center', async ({ page }) => {
    await page.goto('/granada/medical-clinics');
    await page.waitForLoadState('networkidle');
    
    // Search for Student Health
    await page.fill('[data-testid="search-input"]', 'Student Health');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify listing
    await expect(page.locator('text=Granada International Student Health Center')).toBeVisible();
    await expect(page.locator('text=international students')).toBeVisible();
  });

  test('should find Study Granada accommodation', async ({ page }) => {
    await page.goto('/granada/real-estate');
    await page.waitForLoadState('networkidle');
    
    // Search for Study Granada
    await page.fill('[data-testid="search-input"]', 'Study Granada');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify listing
    await expect(page.locator('text=Study Granada')).toBeVisible();
    await expect(page.locator('text=student accommodation')).toBeVisible();
  });

  test('should display all 8 student service entries', async ({ page }) => {
    const studentServices = [
      'University of Granada',
      'Granada Student Housing',
      'Student Visa Granada',
      'Granada Student Support Center',
      'Campus Life Granada',
      'Delengua Spanish School',
      'Granada International Student Health Center',
      'Study Granada'
    ];
    
    for (const service of studentServices) {
      await page.goto('/granada');
      await page.waitForLoadState('networkidle');
      await page.fill('[data-testid="search-input"]', service);
      await page.press('[data-testid="search-input"]', 'Enter');
      await expect(page.locator(`text=${service}`).first()).toBeVisible();
    }
  });

  // ==========================================
  // CROSS-CUTTING TESTS
  // ==========================================

  test('should display English-speaking badges on nomad and student services', async ({ page }) => {
    await page.goto('/granada/co-working-spaces');
    await page.waitForLoadState('networkidle');
    
    // Click on a co-working space
    await page.click('text=Coworking Granada');
    await page.waitForLoadState('networkidle');
    
    // Verify English-speaking flag is visible
    await expect(page.locator('text=English-speaking')).toBeVisible();
    
    // Go to student services
    await page.goto('/granada/educational-services');
    await page.waitForLoadState('networkidle');
    await page.click('text=Delengua Spanish School');
    await page.waitForLoadState('networkidle');
    
    // Verify English-speaking flag
    await expect(page.locator('text=English-speaking')).toBeVisible();
  });

  test('should verify Granada city page loads correctly', async ({ page }) => {
    await page.goto('/granada');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads with correct content
    await expect(page.locator('h1')).toContainText('Granada');
    await expect(page.locator('text=Andalusia')).toBeVisible();
  });

  test('should search across all Granada nomad and student services', async ({ page }) => {
    await page.goto('/granada');
    await page.waitForLoadState('networkidle');
    
    // Search for digital nomad
    await page.fill('[data-testid="search-input"]', 'digital nomad');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Should find multiple results
    const nomadResults = await page.locator('[data-testid="business-card"]').count();
    expect(nomadResults).toBeGreaterThanOrEqual(3);
    
    // Clear and search for student
    await page.goto('/granada');
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="search-input"]', 'student');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Should find student-related results
    const studentResults = await page.locator('[data-testid="business-card"]').count();
    expect(studentResults).toBeGreaterThanOrEqual(3);
  });

  test('should verify contact information for key listings', async ({ page }) => {
    // Test Coworking Granada
    await page.goto('/granada/co-working-spaces');
    await page.waitForLoadState('networkidle');
    await page.click('text=Coworking Granada');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=+34 958 22 45 67')).toBeVisible();
    await expect(page.locator('text=coworkinggranada.es')).toBeVisible();
    
    // Test University of Granada
    await page.goto('/granada/educational-services');
    await page.waitForLoadState('networkidle');
    await page.click('text=University of Granada');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=+34 958 24 30 12')).toBeVisible();
    await expect(page.locator('text=ugr.es')).toBeVisible();
  });

  test('should have no console errors on Granada pages', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Visit multiple Granada pages
    await page.goto('/granada');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/granada/co-working-spaces');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/granada/educational-services');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/granada/legal');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/granada/real-estate');
    await page.waitForLoadState('networkidle');
    
    // Assert no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should verify all 15 entries have required fields', async ({ page }) => {
    const entries = [
      { name: 'Coworking Granada', category: 'co-working-spaces', phone: '+34 958 22 45 67' },
      { name: 'WorkIN Granada', category: 'co-working-spaces', phone: '+34 958 28 76 54' },
      { name: 'Lexidy Law Firm', category: 'legal', phone: '+34 958 05 12 34' },
      { name: 'Spain Digital Nomad Visa Services', category: 'legal', phone: '+34 958 19 28 37' },
      { name: 'Nomad Tax Advisors', category: 'tax-advisors', phone: '+34 958 26 45 89' },
      { name: 'The Nomad Hub', category: 'co-working-spaces', phone: '+34 958 88 76 54' },
      { name: 'Remote Worker Resources', category: 'business-services', phone: '+34 958 21 34 56' },
      { name: 'University of Granada', category: 'educational-services', phone: '+34 958 24 30 12' },
      { name: 'Granada Student Housing', category: 'real-estate', phone: '+34 958 27 56 78' },
      { name: 'Student Visa Granada', category: 'legal', phone: '+34 958 22 98 76' },
      { name: 'Granada Student Support Center', category: 'educational-services', phone: '+34 958 24 67 89' },
      { name: 'Campus Life Granada', category: 'educational-services', phone: '+34 958 29 45 23' },
      { name: 'Delengua Spanish School', category: 'language-schools', phone: '+34 958 20 41 32' },
      { name: 'Granada International Student Health Center', category: 'medical-clinics', phone: '+34 958 22 76 45' },
      { name: 'Study Granada', category: 'real-estate', phone: '+34 958 26 78 90' }
    ];
    
    for (const entry of entries) {
      await page.goto(`/granada/${entry.category}`);
      await page.waitForLoadState('networkidle');
      
      // Search for the entry
      await page.fill('[data-testid="search-input"]', entry.name);
      await page.press('[data-testid="search-input"]', 'Enter');
      
      // Click on the entry
      await page.click(`text=${entry.name}`);
      await page.waitForLoadState('networkidle');
      
      // Verify required fields
      await expect(page.locator('h1')).toContainText(entry.name.split(' - ')[0]);
      await expect(page.locator(`text=${entry.phone}`)).toBeVisible();
      await expect(page.locator('text=Granada')).toBeVisible();
    }
  });
});
