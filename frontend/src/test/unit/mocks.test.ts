import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Production mock and configuration guards', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('startup fails in production if VITE_API_URL is missing and mocks are disabled', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_API_URL', '');
    vi.stubEnv('VITE_ENABLE_MOCKS', 'false');

    await expect(import('../../api/base44Client')).rejects.toThrow(
      /VITE_API_URL is not set/
    );
  });

  test('mock is allowed in dev environment when VITE_ENABLE_MOCKS is true', async () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_API_URL', '');
    vi.stubEnv('VITE_ENABLE_MOCKS', 'true');

    const client = await import('../../api/base44Client');
    expect(client.base44).toBeDefined();
  });
});
