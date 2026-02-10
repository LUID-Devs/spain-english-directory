const { test, expect } = require('@playwright/test');

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/projects');
  });

  test('project list loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Projects/i })).toBeVisible();
    // Should show 3 projects with progress bars
    await expect(page.locator('[data-testid="project-card"]')).toHaveCount.greaterThan(0);
  });

  test('favorites/archived tabs toggle', async ({ page }) => {
    await page.getByRole('tab', { name: /Favorites/i }).click();
    await expect(page.getByRole('tabpanel')).toBeVisible();
    
    await page.getByRole('tab', { name: /Archived/i }).click();
    await expect(page.getByRole('tabpanel')).toBeVisible();
  });

  test('project detail page loads', async ({ page }) => {
    // Click first project
    await page.locator('[data-testid="project-card"]').first().click();
    await expect(page).toHaveURL(/projects\/\d+/);
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('kanban board renders', async ({ page }) => {
    await page.locator('[data-testid="project-card"]').first().click();
    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible();
    await expect(page.locator('[data-testid="kanban-column"]')).toHaveCount.greaterThan(0);
  });

  test('view switcher works', async ({ page }) => {
    await page.locator('[data-testid="project-card"]').first().click();
    
    await page.getByRole('button', { name: /List/i }).click();
    await expect(page.locator('[data-testid="list-view"]')).toBeVisible();
    
    await page.getByRole('button', { name: /Board/i }).click();
    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible();
  });
});
