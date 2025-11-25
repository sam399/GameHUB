import { test, expect } from '@playwright/test';

// Smoke tests: verify main pages render without auth

test('homepage loads and shows brand', async ({ page, baseURL }) => {
  await page.goto('/');
  await expect(page.locator('text=GameVerse')).toBeVisible();
});

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  // Check for a login form or email/password fields
  await expect(page.locator('input[name="email"], input[name="username"], input[type="email"]').first()).toBeVisible();
});

// Admin pages require auth; smoke test checks redirect to login for admin route
test('admin dashboard redirects when not authenticated', async ({ page }) => {
  await page.goto('/admin/dashboard');
  // Expect to be redirected to login
  await expect(page).toHaveURL(/login/);
});
