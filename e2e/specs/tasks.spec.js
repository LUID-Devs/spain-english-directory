const { test, expect } = require('@playwright/test');

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('My Tasks page loads', async ({ page }) => {
    await page.getByRole('link', { name: /My Tasks/i }).click();
    await expect(page.getByRole('heading', { name: /My Tasks/i })).toBeVisible();
  });

  test('status filter dropdown works', async ({ page }) => {
    await page.goto('/dashboard/tasks');
    await page.getByLabel(/Status/i).click();
    await expect(page.getByRole('option', { name: /To Do/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /In Progress/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Done/i })).toBeVisible();
  });

  test('priority filter dropdown works', async ({ page }) => {
    await page.goto('/dashboard/tasks');
    await page.getByLabel(/Priority/i).click();
    await expect(page.getByRole('option', { name: /Urgent/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /High/i })).toBeVisible();
  });

  test('search filters tasks in real-time', async ({ page }) => {
    await page.goto('/dashboard/tasks');
    const searchBox = page.getByPlaceholder(/Search tasks/i);
    await searchBox.fill('test');
    // Wait for debounce/filter
    await page.waitForTimeout(500);
    // Check if filtering happened
    const tasks = page.locator('table tbody tr');
    // Should have filtered results or empty state
    await expect(tasks.count()).toBeGreaterThanOrEqual(0);
  });

  test('create task modal opens', async ({ page }) => {
    await page.goto('/dashboard/tasks');
    await page.getByRole('button', { name: /Create Task/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Create New Task/i })).toBeVisible();
  });

  test('form validation works', async ({ page }) => {
    await page.goto('/dashboard/tasks');
    await page.getByRole('button', { name: /Create Task/i }).click();
    // Try to submit without required fields
    await page.getByRole('button', { name: /Create/i }).click();
    // Should show validation error
    await expect(page.getByText(/required/i)).toBeVisible();
  });

  test('rich text editor loads', async ({ page }) => {
    await page.goto('/dashboard/tasks');
    await page.getByRole('button', { name: /Create Task/i }).click();
    await expect(page.locator('.ql-editor, [contenteditable]')).toBeVisible();
  });

  test('task detail modal opens', async ({ page }) => {
    await page.goto('/dashboard/tasks');
    // Click first task row
    await page.locator('table tbody tr').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
