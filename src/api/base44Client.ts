/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Compatibility facade used by the original application shell.
 * Real backend calls are always preferred and executed.
 */
import { authApi, type RegisterDto, type RegisterResponse } from './auth.api';
import { settingsApi } from './settings.api';
import { queryClientInstance } from '../lib/query-client';
import type { UserRole as BackendUserRole } from '../types';

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

if (!import.meta.env.VITE_API_URL) {
  throw new Error(
    '[F1RC] VITE_API_URL is not set. The application requires the real backend API.',
  );
}

function normalizeBackendRole(role: string | BackendUserRole): UserRole {
  const upperRole = String(role).toUpperCase();
  switch (upperRole) {
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
      return 'racer';
  }
}

function mapBackendUser(user: any): F1User {
  if (!user) {
    return {
      id: '',
      email: '',
      name: '',
      full_name: '',
      role: 'racer',
      createdAt: '',
    };
  }
  const fullName = user.fullName ?? user.name ?? user.full_name ?? user.phone ?? '';
  return {
    id: String(user.id ?? ''),
    email: user.email ?? '',
    name: fullName,
    full_name: fullName,
    role: normalizeBackendRole(user.role ?? 'RACER'),
    createdAt: user.createdAt ?? user.created_date ?? '',
    created_date: user.createdAt ?? user.created_date ?? '',
    avatar: user.avatarUrl ?? user.avatar ?? undefined,
  };
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
      try {
        const response = await authApi.loginViaPhone(phone, password);
        const data = (response as any).data ?? response;
        const accessToken = data.accessToken ?? response.accessToken;
        const refreshToken = data.refreshToken ?? response.refreshToken;
        const rawUser = data.user ?? response.user;

        if (accessToken) {
          authApi.setTokens(accessToken, refreshToken);
        }
        const user = mapBackendUser(rawUser);
        localStorage.setItem('f1rc_user', JSON.stringify(user));
        return { user };
      } catch (error: unknown) {
        return {
          error: getErrorMessage(error),
        };
      }
    },

    async getUser(): Promise<F1User | null> {
      const response = await authApi.getUser();
      const rawUser = (response as any).user ?? (response as any).data?.user ?? (response as any).data ?? response;
      if (!rawUser || typeof rawUser !== 'object') return null;
      const user = mapBackendUser(rawUser);
      localStorage.setItem('f1rc_user', JSON.stringify(user));
      return user;
    },

    async logout(redirectUrl = '/'): Promise<void> {
      try {
        await authApi.logout(redirectUrl);
      } finally {
        queryClientInstance.clear();
      }
    },

    async register(data: RegisterDto): Promise<RegisterResponse | void> {
      const response = await authApi.register(data);
      const resData = (response as any).data ?? response;
      const accessToken = resData.accessToken ?? response.accessToken;
      const refreshToken = resData.refreshToken ?? response.refreshToken;
      const rawUser = resData.user ?? response.user;

      if (accessToken && refreshToken) {
        authApi.setTokens(accessToken, refreshToken);
      }
      if (rawUser) {
        localStorage.setItem(
          'f1rc_user',
          JSON.stringify(mapBackendUser(rawUser)),
        );
      }
      return response;
    },

    setToken(token: string): void {
      authApi.setToken(token);
    },
  },

  getPublicSettings() {
    return settingsApi.getPublicSettings({ limit: 100 });
  },
};
