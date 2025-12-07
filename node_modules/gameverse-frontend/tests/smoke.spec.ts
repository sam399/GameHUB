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

// Helpers
const adminCreds = { email: 'admin@example.com', password: '123456789' };

async function loginAsAdmin(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', adminCreds.email);
  await page.fill('input[name="password"]', adminCreds.password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.click('button:has-text("Login")')
  ]);
}

test('admin can log in and reach dashboard', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/dashboard');
  await expect(page.getByText(/admin dashboard/i)).toBeVisible();
});

test('admin can view reports and assign/resolve when present', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/reports');

  const cards = page.locator('.report-card');
  const count = await cards.count();
  if (count === 0) {
    test.info().skip('No reports available to assign/resolve');
    return;
  }

  const first = cards.first();
  const assignButton = first.getByRole('button', { name: /assign/i });
  const resolveButton = first.getByRole('button', { name: /resolve/i });

  // Assign to first moderator option if available
  const moderatorSelect = first.locator('select').first();
  if (await moderatorSelect.isVisible() && (await moderatorSelect.locator('option').count()) > 0) {
    await moderatorSelect.selectOption({ index: 0 });
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/admin/reports') && resp.request().method() === 'GET'),
      assignButton.click()
    ]);
  }

  // Resolve with default action
  const resolutionSelect = first.locator('select').nth(1);
  if (await resolutionSelect.isVisible()) {
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/admin/reports') && resp.request().method() === 'GET'),
      resolveButton.click()
    ]);
  }

  await expect(first).toBeVisible();
});

test('wishlist privacy toggle works for logged-in user', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/profile');

  const toggle = page.getByRole('button', { name: /make private|make public|saving.../i });
  await expect(toggle).toBeVisible();

  const before = await toggle.textContent();
  await toggle.click();
  await expect(toggle).toBeEnabled({ timeout: 10_000 });
  await expect(toggle).not.toHaveText(before || '', { timeout: 10_000 });
});
