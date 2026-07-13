import { ApiClient } from './api';
import type { ApiResponse, User } from '../types';

const ACCESS_TOKEN_KEY = 'f1rc_access_token';
const REFRESH_TOKEN_KEY = 'f1rc_refresh_token';
const LEGACY_TOKEN_KEY = 'f1rc_token';
const USER_KEY = 'f1rc_user';

export interface LoginDto {
  phone: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

function clearStoredAuth(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const authApi = {
  loginViaPhone(phone: string, password: string): Promise<LoginResponse> {
    return ApiClient.post('/auth/login', { phone, password } satisfies LoginDto);
  },

  register(data: RegisterDto): Promise<RegisterResponse> {
    return ApiClient.post('/auth/register', data);
  },

  getUser(): Promise<ApiResponse<User>> {
    return ApiClient.get('/auth/me');
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      if (refreshToken) {
        await ApiClient.post('/auth/logout', { refreshToken });
      }
    } finally {
      clearStoredAuth();
      window.location.href = '/login';
    }
  },

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(LEGACY_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  setToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
  },
};
