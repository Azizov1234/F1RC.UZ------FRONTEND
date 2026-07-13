/**
 * Compatibility facade used by the original application shell.
 * Real backend calls are always preferred. Development mocks are loaded only
 * when they are explicitly enabled and no backend URL is configured.
 */
import { authApi, type RegisterDto, type RegisterResponse } from './auth.api';
import { settingsApi } from './settings.api';
import { queryClientInstance } from '../lib/query-client';
import type { User, UserRole as BackendUserRole } from '../types';

export type UserRole = Lowercase<BackendUserRole>;

export interface F1User {
  id: string;
  email: string;
  name: string;
  full_name: string;
  role: UserRole;
  createdAt: string;
  created_date?: string;
  avatar?: string;
}

interface LegacyMockUser {
  id: string;
  email: string;
  name: string;
  full_name: string;
  role: string;
  createdAt: string;
  created_date?: string;
  avatar?: string;
}

const isBackendConfigured = Boolean(import.meta.env.VITE_API_URL);
const canUseMock =
  import.meta.env.DEV &&
  import.meta.env.VITE_ENABLE_MOCKS === 'true' &&
  !isBackendConfigured;

if (import.meta.env.PROD && !isBackendConfigured) {
  throw new Error(
    '[F1RC] VITE_API_URL is not set. Production requires the real backend API.',
  );
}

function normalizeBackendRole(role: BackendUserRole): UserRole {
  switch (role) {
    case 'SUPERADMIN':
      return 'superadmin';
    case 'ADMIN':
      return 'admin';
    case 'OPERATOR':
      return 'operator';
    case 'RACER':
      return 'racer';
    case 'TEAM_MANAGER':
      return 'team_manager';
  }
}

function normalizeMockRole(role: string): UserRole | undefined {
  switch (role.toUpperCase()) {
    case 'SUPERADMIN':
      return 'superadmin';
    case 'ADMIN':
      return 'admin';
    case 'OPERATOR':
      return 'operator';
    case 'RACER':
      return 'racer';
    case 'TEAM_MANAGER':
      return 'team_manager';
    default:
      return undefined;
  }
}

function mapBackendUser(user: User): F1User {
  return {
    id: String(user.id),
    email: user.email ?? '',
    name: user.fullName,
    full_name: user.fullName,
    role: normalizeBackendRole(user.role),
    createdAt: user.createdAt,
    created_date: user.createdAt,
    avatar: user.avatarUrl ?? undefined,
  };
}

function mapMockUser(user: LegacyMockUser | null): F1User | null {
  if (!user) return null;
  const role = normalizeMockRole(user.role);
  if (!role) return null;
  return { ...user, role };
}

async function loadDevelopmentMock() {
  if (!canUseMock) {
    throw new Error(
      '[F1RC] Backend API is not configured and development mocks are disabled.',
    );
  }
  return import('../mocks/base44ClientMock');
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message;
    if (typeof message === 'string') return message;
  }
  return 'Xatolik yuz berdi';
}

export const base44 = {
  apiBaseUrl: import.meta.env.VITE_API_URL ?? '',

  auth: {
    async loginViaEmailPassword(
      phone: string,
      password: string,
    ): Promise<{ user?: F1User; error?: string }> {
      if (isBackendConfigured) {
        try {
          const response = await authApi.loginViaPhone(phone, password);
          authApi.setTokens(response.accessToken, response.refreshToken);
          const user = mapBackendUser(response.user);
          localStorage.setItem('f1rc_user', JSON.stringify(user));
          return { user };
        } catch (error: unknown) {
          return {
            error: getErrorMessage(error),
          };
        }
      }

      const { base44Mock } = await loadDevelopmentMock();
      const response = await base44Mock.auth.loginViaEmailPassword(phone, password);
      const user = mapMockUser(response.user ?? null);
      return response.error ? { error: response.error } : { user: user ?? undefined };
    },

    async getUser(): Promise<F1User | null> {
      if (isBackendConfigured) {
        const response = await authApi.getUser();
        const user = mapBackendUser(response.data);
        localStorage.setItem('f1rc_user', JSON.stringify(user));
        return user;
      }

      const { base44Mock } = await loadDevelopmentMock();
      return mapMockUser(await base44Mock.auth.getUser());
    },

    async logout(redirectUrl = '/login'): Promise<void> {
      if (isBackendConfigured) {
        try {
          await authApi.logout();
        } finally {
          queryClientInstance.clear();
        }
        return;
      }

      const { base44Mock } = await loadDevelopmentMock();
      queryClientInstance.clear();
      base44Mock.auth.logout(redirectUrl);
    },

    async register(data: RegisterDto): Promise<RegisterResponse | void> {
      if (isBackendConfigured) {
        const response = await authApi.register(data);
        if (response.accessToken && response.refreshToken) {
          authApi.setTokens(response.accessToken, response.refreshToken);
        }
        if (response.user) {
          localStorage.setItem(
            'f1rc_user',
            JSON.stringify(mapBackendUser(response.user)),
          );
        }
        return response;
      }

      const { base44Mock } = await loadDevelopmentMock();
      await base44Mock.auth.register({ email: data.email ?? '' });
    },

    setToken(token: string): void {
      authApi.setToken(token);
    },
  },

  getPublicSettings() {
    if (isBackendConfigured) {
      return settingsApi.getPublicSettings({ limit: 100 });
    }
    return loadDevelopmentMock().then(({ base44Mock }) =>
      base44Mock.getPublicSettings(),
    );
  },
};
