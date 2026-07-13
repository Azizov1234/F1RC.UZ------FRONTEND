const BASE_URL = import.meta.env.VITE_API_URL ?? '';

const getResolvedBaseUrl = (): string => {
  if (!BASE_URL) return '';
  if (/^https?:\/\//i.test(BASE_URL)) return BASE_URL;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  return `${origin}${BASE_URL.startsWith('/') ? '' : '/'}${BASE_URL}`;
};

const RESOLVED_BASE_URL = getResolvedBaseUrl();
const ACCESS_TOKEN_KEY = 'f1rc_access_token';
const REFRESH_TOKEN_KEY = 'f1rc_refresh_token';
const LEGACY_TOKEN_KEY = 'f1rc_token';
const USER_KEY = 'f1rc_user';

export type ApiError = {
  status: number;
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
  details?: unknown;
};

interface RefreshQueueEntry {
  resolve: () => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: RefreshQueueEntry[] = [];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  return typeof value === 'string' ? value : undefined;
}

function readFieldErrors(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) return undefined;

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function extractTokens(payload: unknown): {
  accessToken?: string;
  refreshToken?: string;
} {
  if (!isRecord(payload)) return {};
  const nested = isRecord(payload.data) ? payload.data : undefined;

  return {
    accessToken:
      readString(payload, 'accessToken') ??
      (nested ? readString(nested, 'accessToken') : undefined),
    refreshToken:
      readString(payload, 'refreshToken') ??
      (nested ? readString(nested, 'refreshToken') : undefined),
  };
}

function processQueue(error?: unknown): void {
  for (const entry of failedQueue) {
    if (error !== undefined) entry.reject(error);
    else entry.resolve();
  }
  failedQueue = [];
}

async function readResponseBody(response: Response): Promise<unknown> {
  if (typeof response.text === 'function') {
    const rawBody = await response.text();
    if (!rawBody) return undefined;
    try {
      return JSON.parse(rawBody) as unknown;
    } catch {
      return rawBody;
    }
  }

  // Some test doubles expose only json(); real Fetch responses expose both.
  if (typeof response.json === 'function') {
    return response.json() as Promise<unknown>;
  }
  return undefined;
}

export class ApiClient {
  private static getHeaders(
    options?: RequestInit,
    path?: string,
  ): Record<string, string> {
    const headers: Record<string, string> = {};
    new Headers(options?.headers).forEach((value, key) => {
      headers[key] = value;
    });

    if (!(options?.body instanceof FormData) && headers['Content-Type'] === undefined) {
      headers['Content-Type'] = 'application/json';
    }

    let isInternal = true;
    if (path && /^https?:\/\//i.test(path)) {
      if (!RESOLVED_BASE_URL) {
        isInternal = false;
      } else {
        try {
          isInternal = new URL(path).origin === new URL(RESOLVED_BASE_URL).origin;
        } catch {
          isInternal = false;
        }
      }
    }

    if (isInternal) {
      const token =
        localStorage.getItem(ACCESS_TOKEN_KEY) ??
        localStorage.getItem(LEGACY_TOKEN_KEY);
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private static async request<T>(path: string, options: RequestInit): Promise<T> {
    const url = /^https?:\/\//i.test(path) ? path : `${BASE_URL}${path}`;
    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        headers: this.getHeaders(options, path),
      });
    } catch (error: unknown) {
      const networkError: ApiError = {
        status: 0,
        message: errorMessage(error, 'Tarmoq ulanishida xatolik'),
      };
      throw networkError;
    }

    const canRefresh =
      response.status === 401 &&
      !path.includes('/auth/login') &&
      !path.includes('/auth/refresh') &&
      !path.includes('/auth/register');

    if (canRefresh) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        this.clearAuth();
        throw { status: 401, message: 'Unauthorized' } satisfies ApiError;
      }

      if (isRefreshing) {
        await new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        return this.request<T>(path, options);
      }

      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Token yangilash muvaffaqiyatsiz tugadi');
        }

        const payload: unknown = await refreshResponse.json();
        const tokens = extractTokens(payload);
        if (!tokens.accessToken) {
          throw new Error('Token formati noto‘g‘ri');
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(LEGACY_TOKEN_KEY, tokens.accessToken);
        if (tokens.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        }
        isRefreshing = false;
        processQueue();
        return this.request<T>(path, options);
      } catch (error: unknown) {
        processQueue(error);
        this.clearAuth();
        throw {
          status: 401,
          message: 'Sessiya muddati tugadi',
        } satisfies ApiError;
      } finally {
        isRefreshing = false;
      }
    }

    const body = await readResponseBody(response);

    if (!response.ok) {
      const errorBody = isRecord(body) ? body : {};
      const messageValue = errorBody.message;
      const message =
        (typeof messageValue === 'string' ? messageValue : undefined) ??
        (Array.isArray(messageValue)
          ? messageValue.filter((item): item is string => typeof item === 'string').join(', ')
          : undefined) ??
        readString(errorBody, 'error') ??
        `HTTP error! status: ${response.status}`;

      throw {
        status: response.status,
        message,
        code: readString(errorBody, 'code'),
        fieldErrors:
          readFieldErrors(errorBody.fieldErrors) ?? readFieldErrors(errorBody.errors),
        details: errorBody.details,
      } satisfies ApiError;
    }

    return body as T;
  }

  private static clearAuth(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (import.meta.env.MODE !== 'test' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  static get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  static post<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  static put<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  static patch<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  static delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}
