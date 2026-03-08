const { test, expect } = require('@playwright/test');

// Use saved auth state
test.use({ storageState: 'e2e/.auth/user.json' });

test.describe('Business CRUD Operations', () => {
  const TEST_BUSINESS = {
    name: 'Test Dental Clinic ' + Date.now(),
    category: 'Dental',
    city: 'Madrid',
    address: 'Calle Test 123, Madrid',
    phone: '+34 600 000 000',
    email: 'test@dental.com',
    website: 'https://testdental.com',
    description: 'A test dental clinic for E2E testing',
    languages: ['English', 'Spanish']
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/businesses');
    // Wait for page load and check no console errors
    await page.waitForLoadState('networkidle');
  });

  test('CREATE - should add new business', async ({ page }) => {
    // Click add new
    await page.click('[data-testid="add-business-button"]');
    await expect(page).toHaveURL('/businesses/new');

    // Fill form
    await page.fill('[data-testid="business-name"]', TEST_BUSINESS.name);
    await page.selectOption('[data-testid="business-category"]', TEST_BUSINESS.category);
    await page.selectOption('[data-testid="business-city"]', TEST_BUSINESS.city);
    await page.fill('[data-testid="business-address"]', TEST_BUSINESS.address);
    await page.fill('[data-testid="business-phone"]', TEST_BUSINESS.phone);
    await page.fill('[data-testid="business-email"]', TEST_BUSINESS.email);
    await page.fill('[data-testid="business-website"]', TEST_BUSINESS.website);
    await page.fill('[data-testid="business-description"]', TEST_BUSINESS.description);
    
    // Select languages
    await page.click('[data-testid="language-english"]');
    await page.click('[data-testid="language-spanish"]');

    // Submit
    await page.click('[data-testid="submit-business"]');

    // Verify redirect and success
    await expect(page).toHaveURL(/\/businesses$/);
    await expect(page.locator(`text=${TEST_BUSINESS.name}`)).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('created');
  });

  test('READ - should view business details', async ({ page }) => {
    // Search for created business
    await page.fill('[data-testid="search-input"]', TEST_BUSINESS.name);
    await page.press('[data-testid="search-input"]', 'Enter');

    // Click on result
    await page.click(`text=${TEST_BUSINESS.name}`);

    // Verify details page
    await expect(page.locator('h1')).toContainText(TEST_BUSINESS.name);
    await expect(page.locator('[data-testid="business-category"]')).toContainText(TEST_BUSINESS.category);
    await expect(page.locator('[data-testid="business-address"]')).toContainText(TEST_BUSINESS.address);
    await expect(page.locator('[data-testid="business-phone"]')).toContainText(TEST_BUSINESS.phone);
  });

  test('UPDATE - should edit business', async ({ page }) => {
    const UPDATED_NAME = TEST_BUSINESS.name + ' Updated';

    // Navigate to business
    await page.fill('[data-testid="search-input"]', TEST_BUSINESS.name);
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click(`text=${TEST_BUSINESS.name}`);

    // Click edit
    await page.click('[data-testid="edit-business-button"]');
    await expect(page).toHaveURL(/\/edit$/);

    // Update name
    await page.fill('[data-testid="business-name"]', UPDATED_NAME);
    
    // Save
    await page.click('[data-testid="save-business"]');

    // Verify update
    await expect(page.locator('h1')).toContainText(UPDATED_NAME);
    await expect(page.locator('[data-testid="success-message"]')).toContainText('updated');
  });

  test('DELETE - should remove business', async ({ page }) => {
    // Navigate to business
    await page.fill('[data-testid="search-input"]', TEST_BUSINESS.name);
    await page.press('[data-testid="search-input"]', 'Enter');
    await page.click(`text=${TEST_BUSINESS.name}`);

    // Click delete
    await page.click('[data-testid="delete-business-button"]');

    // Confirm deletion
    await page.click('[data-testid="confirm-delete"]');

    // Verify redirect and success
    await expect(page).toHaveURL('/businesses');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('deleted');
    await expect(page.locator(`text=${TEST_BUSINESS.name}`)).not.toBeVisible();
  });

  test('VALIDATION - should show errors for invalid data', async ({ page }) => {
    await page.goto('/businesses/new');

    // Try submit empty form
    await page.click('[data-testid="submit-business"]');

    // Check validation errors
    await expect(page.locator('[data-testid="error-name"]')).toContainText('required');
    await expect(page.locator('[data-testid="error-category"]')).toContainText('required');
    await expect(page.locator('[data-testid="error-city"]')).toContainText('required');

    // Test invalid email
    await page.fill('[data-testid="business-email"]', 'invalid-email');
    await page.click('[data-testid="submit-business"]');
    await expect(page.locator('[data-testid="error-email"]')).toContainText('valid');

    // Test invalid phone
    await page.fill('[data-testid="business-phone"]', 'abc');
    await page.click('[data-testid="submit-business"]');
    await expect(page.locator('[data-testid="error-phone"]')).toContainText('valid');
  });

  test('SEARCH - should filter and find businesses', async ({ page }) => {
    // Type in search
    await page.fill('[data-testid="search-input"]', 'dental');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Check results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="result-count"]')).toContainText('results');

    // Filter by category
    await page.selectOption('[data-testid="filter-category"]', 'Dental');
    await expect(page.locator('[data-testid="business-card"]')).toHaveCount.greaterThan(0);

    // Filter by city
    await page.selectOption('[data-testid="filter-city"]', 'Madrid');
    await expect(page.locator('[data-testid="business-card"]')).toBeVisible();
  });

  test('SCROLL - should load more on scroll', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check if more content loaded
    await expect(page.locator('[data-testid="loading-more"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="business-card"]')).toHaveCount.greaterThanOrEqual(10);
  });

  test('CONSOLE ERRORS - should not have console errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate through pages
    await page.goto('/businesses');
    await page.goto('/businesses/new');
    await page.goto('/dashboard');

    // Assert no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('NETWORK ERRORS - should handle API failures gracefully', async ({ page }) => {
    // Intercept and fail the API call
    await page.route('**/api/businesses', route => route.abort('failed'));

    await page.goto('/businesses');

    // Should show error state, not crash
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });
});
