// Base44 mock client — API URL envdan olinadi, hardcode qilinmaydi

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const STORAGE_KEY = 'f1rc_user';
const TOKEN_KEY = 'f1rc_token';

export interface F1User {
  id: string;
  email: string;
  name: string;
  full_name: string;
  role: 'admin' | 'superadmin' | 'operator' | 'team_manager' | 'racer' | 'viewer';
  createdAt: string;
  created_date?: string; // for UsersPage list compatibility
  avatar?: string;
}

interface LoginResult {
  user?: F1User;
  error?: string;
}

export type UserRole = F1User['role'];

function getStoredUser(): F1User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as F1User) : null;
  } catch {
    return null;
  }
}

function storeUser(user: F1User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

// Demo: rolni emailga qarab aniqlash
function resolveRole(email: string): UserRole {
  if (email.includes('superadmin')) return 'superadmin';
  if (email.includes('operator')) return 'operator';
  if (email.includes('manager')) return 'team_manager';
  if (email.includes('racer')) return 'racer';
  if (email.includes('viewer')) return 'viewer';
  if (email.includes('admin')) return 'admin';
  return 'admin'; // default
}

const mockUsers: F1User[] = [
  { id: '0', name: 'Super Admin', full_name: 'Super Admin', email: 'superadmin@f1rc.uz', role: 'superadmin', createdAt: '2026-06-01T09:00:00Z', created_date: '2026-06-01T09:00:00Z' },
  { id: '1', name: 'Jahongir T.', full_name: 'Jahongir T.', email: 'admin@f1rc.uz', role: 'admin', createdAt: '2026-06-01T10:00:00Z', created_date: '2026-06-01T10:00:00Z' },
  { id: '2', name: 'Sardor M.', full_name: 'Sardor M.', email: 'operator@f1rc.uz', role: 'operator', createdAt: '2026-06-02T11:00:00Z', created_date: '2026-06-02T11:00:00Z' },
  { id: '3', name: 'Aziz K.', full_name: 'Aziz K.', email: 'manager@f1rc.uz', role: 'team_manager', createdAt: '2026-06-03T12:00:00Z', created_date: '2026-06-03T12:00:00Z' },
  { id: '4', name: 'Bobur H.', full_name: 'Bobur H.', email: 'racer@f1rc.uz', role: 'racer', createdAt: '2026-06-04T13:00:00Z', created_date: '2026-06-04T13:00:00Z' },
  { id: '5', name: 'Viewer User', full_name: 'Viewer User', email: 'viewer@f1rc.uz', role: 'viewer', createdAt: '2026-06-05T14:00:00Z', created_date: '2026-06-05T14:00:00Z' },
];

export const base44 = {
  /** API base URL — env orqali olinadi */
  apiBaseUrl: API_BASE_URL,

  auth: {
    async loginViaEmailPassword(email: string, password: string): Promise<LoginResult> {
      if (!email || !password) {
        return { error: 'Email va parol kiritilishi shart' };
      }
      const name = email.split('@')[0];
      const user: F1User = {
        id: 'demo-user-1',
        email,
        name,
        full_name: name,
        role: resolveRole(email),
        createdAt: new Date().toISOString(),
      };
      storeUser(user);
      return { user };
    },

    async getUser(): Promise<F1User | null> {
      return getStoredUser();
    },

    logout(redirectUrl = '/login'): void {
      clearUser();
      window.location.href = redirectUrl;
    },

    async register({ email }: { email: string; password?: string }): Promise<void> {
      console.log(`Mock registration for ${email}`);
    },

    async verifyOtp({ email, otpCode }: { email: string; otpCode: string }): Promise<{ access_token: string }> {
      console.log(`Mock OTP verification for ${email} with code ${otpCode}`);
      return { access_token: 'mock-jwt-token' };
    },

    setToken(token: string): void {
      localStorage.setItem(TOKEN_KEY, token);
    },

    async resendOtp(email: string): Promise<void> {
      console.log(`Mock resend OTP for ${email}`);
    },

    loginWithProvider(provider: string, redirectUrl: string): void {
      console.log(`Mock login with provider ${provider}`);
      const user: F1User = {
        id: 'google-user-123',
        email: 'google.user@example.com',
        name: 'Google User',
        full_name: 'Google User',
        role: 'racer',
        createdAt: new Date().toISOString(),
      };
      storeUser(user);
      window.location.href = redirectUrl;
    },

    async resetPasswordRequest(email: string): Promise<void> {
      console.log(`Mock password reset request for ${email}`);
    },

    async resetPassword({ resetToken, newPassword }: { resetToken?: string; newPassword?: string }): Promise<void> {
      console.log(`Mock reset password: token: ${resetToken}, password: ${newPassword}`);
    },
  },

  users: {
    async inviteUser(email: string, role: string): Promise<void> {
      console.log(`Mock invite user: email: ${email}, role: ${role}`);
    },
  },

  entities: {
    User: {
      async list(sort?: string, limit?: number): Promise<F1User[]> {
        return mockUsers.slice(0, limit);
      },
    },
    Event: {
      async list(sort?: string, limit?: number): Promise<any[]> {
        return [
          { id: 'e1', title: 'Formula RC Sprint', status: 'UPCOMING', created_date: '2026-06-01T10:00:00Z' },
          { id: 'e2', title: 'GT Race Night', status: 'ACTIVE', created_date: '2026-06-02T10:00:00Z' },
          { id: 'e3', title: 'Rally Endurance', status: 'FINISHED', created_date: '2026-06-03T10:00:00Z' },
        ].slice(0, limit);
      },
    },
    Booking: {
      async list(sort?: string, limit?: number): Promise<any[]> {
        return [
          { id: 'b1', status: 'PENDING', amount: '$45', user: 'Aziz K.', event: 'Rally Endurance' },
          { id: 'b2', status: 'CONFIRMED', amount: '$60', user: 'Jahongir T.', event: 'Formula RC Sprint' },
          { id: 'b3', status: 'CHECKED_IN', amount: '$35', user: 'Sardor M.', event: 'GT Race Night' },
        ].slice(0, limit);
      },
    },
  },

  async getPublicSettings(): Promise<{ siteName: string; theme: string }> {
    return { siteName: import.meta.env.VITE_APP_NAME ?? 'F1RC.UZ', theme: 'dark' };
  },
};
