import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient } from '../../api/api';

describe('ApiClient tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Authorization header is added automatically when token is in localStorage', async () => {
    localStorage.setItem('f1rc_access_token', 'valid-token-123');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'success' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await ApiClient.get('/test');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-token-123',
        }),
      })
    );
  });

  test('POST sends JSON payload correctly with headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await ApiClient.post('/submit', { key: 'value' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/submit'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  test('POST with FormData does not override Content-Type', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const formData = new FormData();
    formData.append('file', new Blob(['data'], { type: 'text/plain' }), 'file.txt');

    await ApiClient.post('/upload', formData);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/upload'),
      expect.objectContaining({
        method: 'POST',
        body: formData,
      })
    );

    const callHeaders = fetchMock.mock.calls[0][1].headers;
    expect(callHeaders['Content-Type']).toBeUndefined();
  });

  test('401 triggers token refresh and retries the original request', async () => {
    localStorage.setItem('f1rc_refresh_token', 'valid-refresh-token');

    let requestCount = 0;
    const fetchMock = vi.fn().mockImplementation((url) => {
      requestCount++;
      if (url.includes('/auth/refresh')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ accessToken: 'new-access-token', refreshToken: 'new-refresh-token' }),
        });
      }
      if (requestCount === 1) {
        return Promise.resolve({ status: 401, ok: false });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await ApiClient.get<{ success: boolean }>('/data');

    expect(res.success).toBe(true);
    expect(localStorage.getItem('f1rc_access_token')).toBe('new-access-token');
    expect(localStorage.getItem('f1rc_refresh_token')).toBe('new-refresh-token');
  });

  test('Refresh token failure triggers logout and clears auth state', async () => {
    localStorage.setItem('f1rc_refresh_token', 'invalid-refresh-token');
    localStorage.setItem('f1rc_access_token', 'old-access-token');

    const fetchMock = vi.fn().mockImplementation((url) => {
      if (url.includes('/auth/refresh')) {
        return Promise.resolve({ status: 400, ok: false });
      }
      return Promise.resolve({ status: 401, ok: false });
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(ApiClient.get('/data')).rejects.toThrow();

    expect(localStorage.getItem('f1rc_access_token')).toBeNull();
    expect(localStorage.getItem('f1rc_refresh_token')).toBeNull();
  });
});
