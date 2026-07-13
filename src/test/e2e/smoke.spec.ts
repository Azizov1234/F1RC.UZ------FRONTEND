import { test, expect } from '@playwright/test';

test.describe('F1RC.UZ Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/settings', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 100,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }),
      });
    });

    await page.route('**/auth/me', async route => {
      const authorization = route.request().headers().authorization;
      if (authorization === 'Bearer mock_racer_token') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 41,
              fullName: 'Racer User',
              phone: '+998901234567',
              email: 'racer@f1rc.uz',
              avatarUrl: null,
              role: 'RACER',
              status: 'ACTIVE',
              lastLoginAt: '2026-07-13T04:00:00.000Z',
              deletedAt: null,
              createdAt: '2026-07-01T04:00:00.000Z',
              updatedAt: '2026-07-13T04:00:00.000Z',
            },
          }),
        });
      } else if (authorization === 'Bearer mock_operator_token') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 42,
              fullName: 'Operator User',
              phone: '+998907654321',
              email: 'operator@f1rc.uz',
              avatarUrl: null,
              role: 'OPERATOR',
              status: 'ACTIVE',
              lastLoginAt: '2026-07-13T04:00:00.000Z',
              deletedAt: null,
              createdAt: '2026-07-01T04:00:00.000Z',
              updatedAt: '2026-07-13T04:00:00.000Z',
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Unauthorized' })
        });
      }
    });

    await page.route('**/admin/race-sessions*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 100,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }),
      });
    });
  });

  test('login page opens and elements are visible', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/F1RC.UZ/i);
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('production mock login is not accessible in production mode', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Demo Login')).not.toBeVisible();
  });

  test('racer accessing admin route triggers 403 redirect', async ({ page }) => {
    await page.goto('/login');
    
    await page.evaluate(() => {
      localStorage.setItem('f1rc_access_token', 'mock_racer_token');
    });

    await page.goto('/admin');

    await expect(page).toHaveURL(/\/403/);
    await expect(page.getByRole('heading', { name: /Ruxsat berilmadi/ })).toBeVisible();
  });

  test('mobile navigation menu toggles correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    await page.evaluate(() => {
      localStorage.setItem('f1rc_access_token', 'mock_operator_token');
    });

    await page.goto('/operator');
    await expect(page).toHaveURL(/\/operator$/);
    await expect(page.getByRole('heading', { name: 'Salom, Operator User' })).toBeVisible();

    const bottomNav = page.locator('nav.fixed.bottom-0');
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole('link')).toHaveCount(5);
    await expect(bottomNav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/operator');
    await expect(bottomNav.getByRole('link', { name: 'Bookinglar' })).toHaveAttribute('href', '/operator/bookings');
    await expect(bottomNav.getByRole('link', { name: 'Poyga Sessiyalar' })).toHaveAttribute('href', '/operator/sessions');
    await expect(bottomNav.getByRole('link', { name: 'Check-In' })).toHaveAttribute('href', '/operator/checkin');
    await expect(bottomNav.getByRole('link', { name: 'Bildirishnomalar' })).toHaveAttribute('href', '/operator/notifications');

    const sidebar = page.locator('aside');
    await expect(sidebar).not.toBeInViewport();
    await page.locator('header > button').first().click();
    await expect(sidebar).toBeInViewport();
    await sidebar.locator('button').first().click();
    await expect(sidebar).not.toBeInViewport();

    await bottomNav.getByRole('link', { name: 'Check-In' }).click();
    await expect(page).toHaveURL(/\/operator\/checkin$/);
    await expect(page.getByRole('heading', { name: 'Booking ID check-in' })).toBeVisible();
  });
});
