import { test, expect } from '@playwright/test';

test.describe('F1RC.UZ Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[BROWSER ERROR] ${msg.text()}`);
      }
    });
    page.on('pageerror', err => {
      console.error(`[BROWSER EXCEPTION] ${err.message}`);
    });

    await page.route('**/api/settings', async route => {
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

    await page.route('**/api/auth/me', async route => {
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

    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Authenticated',
          accessToken: 'mock_racer_token',
          refreshToken: 'mock_refresh_token',
          user: {
            id: 41,
            fullName: 'Racer User',
            phone: '+998901234567',
            email: 'racer@f1rc.uz',
            avatarUrl: null,
            role: 'RACER',
            status: 'ACTIVE',
            createdAt: '2026-07-01T04:00:00.000Z',
            updatedAt: '2026-07-13T04:00:00.000Z',
          },
        }),
      });
    });

    await page.route('**/api/auth/logout', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });

    await page.route('**/api/me/**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });

    await page.route('**/api/admin/race-sessions*', async route => {
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

    await page.route('**/api/events*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/arenas*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/categories/**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/achievements*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/teams*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/streams*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/seasons*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/leaderboard*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
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

  test('public landing page opens and displays F1RC.UZ branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=F1RC.UZ').first()).toBeVisible();
    await expect(page.locator('main').getByText(/Race Without Limits/i).first()).toBeVisible();
  });

  test('public navigation exposes streams and login without authentication', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header').getByRole('link', { name: 'Kirish' })).toHaveAttribute('href', '/login');

    await page.locator('header nav').getByRole('link', { name: /Eventlar|Events/i }).click();
    await expect(page).toHaveURL(/\/events$/);
    await expect(page.getByRole('heading', { name: /Poygalar va Musobaqalar/i })).toBeVisible();

    await page.goto('/streams');
    await expect(page.getByRole('heading', { name: /Videotranslyatsiyalar/i })).toBeVisible();
  });

  test('public mobile drawer works with reduced motion enabled', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await expect(page.locator('main').getByText(/Race Without Limits/i).first()).toBeVisible();
    await page.getByRole('button', { name: /Navigatsiya menyusini ochish/i }).click();
    const drawer = page.getByRole('dialog', { name: /Public navigatsiya/i });
    await expect(drawer).toBeVisible();
    await expect(page.locator('main .animate-pulse').first()).toHaveCSS('animation-name', 'none');
    await drawer.getByRole('link', { name: /Eventlar|Events/i }).click();
    await expect(page).toHaveURL(/\/events$/);
  });

  test('login succeeds to role dashboard and logout returns to landing', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="tel"]').fill('+998901234567');
    await page.locator('input[type="password"]').fill('secure-password');
    await page.getByRole('button', { name: /^Kirish$/ }).click();

    await expect(page).toHaveURL(/\/racer$/);
    const logout = page.getByRole('button', { name: /Chiqish|Logout/i });
    await expect(logout).toBeVisible();
    await logout.click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('main').getByRole('heading', { name: 'F1RC.UZ' })).toBeVisible();
  });

  test('direct public route refreshes return the SPA instead of 404', async ({ page }) => {
    await page.route('**/api/arenas/7', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          arena: { id: 7, name: 'Route Test Arena', city: 'Toshkent', trackLayouts: [], zones: [], events: [] },
        }),
      });
    });

    const routes = [
      { path: '/events', heading: /Poygalar va Musobaqalar/i },
      { path: '/leaderboard', heading: /Reyting Jadvali/i },
      { path: '/streams', heading: /Videotranslyatsiyalar/i },
      { path: '/arenas/7', heading: /Route Test Arena/i },
    ];

    for (const route of routes) {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { name: route.heading }).first()).toBeVisible();
    }
  });

  test('public landing isolates a failed section and never calls protected APIs', async ({ page }) => {
    const protectedRequests: string[] = [];
    page.on('request', request => {
      if (/\/api\/(?:admin|operator|me)(?:\/|\?|$)/.test(request.url())) {
        protectedRequests.push(request.url());
      }
    });
    await page.unroute('**/api/categories/**');
    await page.route('**/api/categories/**', async route => {
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Unavailable' }) });
    });

    await page.goto('/');
    await expect(page.getByText(/Poyga toifalari yuklanmadi/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Platforma nima/i })).toBeVisible();
    expect(protectedRequests).toEqual([]);
  });

  test('public sub-pages render properly without authentication', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByRole('heading', { name: /Ko'p beriladigan savollar/i })).toBeVisible();

    await page.goto('/about');
    await expect(page.getByText(/F1RC.UZ loyihasi haqida/i).first()).toBeVisible();

    await page.goto('/events');
    await expect(page.getByRole('heading', { name: /Poygalar va Musobaqalar/i })).toBeVisible();

    await page.goto('/leaderboard');
    await expect(page.getByRole('heading', { name: /Reyting Jadvali/i })).toBeVisible();
  });

  test('guest booking CTA triggers redirect to login with query param', async ({ page }) => {
    // Intercept event queries first
    await page.route('**/api/events*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{
            id: 99,
            name: 'Grand Prix Event Test',
            description: 'E2E Test Description',
            startsAt: '2026-07-20T10:00:00.000Z',
            status: 'REGISTRATION_OPEN',
            price: 10000,
          }]
        })
      });
    });

    await page.route('**/api/events/99', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          event: {
            id: 99,
            name: 'Grand Prix Event Test',
            description: 'E2E Test Description',
            startsAt: '2026-07-20T10:00:00.000Z',
            status: 'REGISTRATION_OPEN',
            price: 10000,
            arena: { id: 1, name: 'Tashkent Arena' },
            trackLayout: { id: 1, name: 'S-Track' },
            category: { id: 1, name: 'Formula RC' },
          }
        })
      });
    });

    await page.goto('/events');
    await expect(page.getByText(/Grand Prix Event Test/i)).toBeVisible();
    await page.getByRole('link', { name: /Batafsil ko'rish/i }).first().click();
    await expect(page).toHaveURL(/\/events\/99$/);
    await expect(page).toHaveTitle(/Grand Prix Event Test/i);

    await page.getByRole('button', { name: /Bron qilish/i }).first().click();
    await expect(page).toHaveURL(/\/login\?redirect=%2Fevents%2F99/);
  });
});
