/**
 * base44ClientMock — FAQAT DEVELOPMENT va TEST muhitida ishlatilsin.
 *
 * MUHIM: Bu fayl productionga import qilinmasin.
 * `base44Client.ts` import qilishdan oldin VITE_ENABLE_MOCKS environment
 * variable'ni tekshiradi. Production buildda bu mock hech qachon ishlamasligi kerak.
 */

const isDev = import.meta.env.DEV;
const mocksEnabled = import.meta.env.VITE_ENABLE_MOCKS === 'true';

if (!isDev && !mocksEnabled) {
  // Production da bu fayl import qilinmasligi kerak
  // Bu xato esa konfiguratsiya muammosini anglatadi
  console.warn('[F1RC] WARNING: base44ClientMock is being loaded in a non-dev/non-mock environment!');
}

export interface F1User {
  id: string;
  email: string;
  name: string;
  full_name: string;
  role: 'admin' | 'superadmin' | 'operator' | 'team_manager' | 'racer' | 'viewer';
  createdAt: string;
  created_date?: string;
  avatar?: string;
}

const STORAGE_KEY = 'f1rc_user';
const TOKEN_KEY = 'f1rc_token';

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

export const mockUsers: F1User[] = [
  { id: '0', name: 'Super Admin', full_name: 'Super Admin', email: 'superadmin@f1rc.uz', role: 'superadmin', createdAt: '2026-06-01T09:00:00Z', created_date: '2026-06-01T09:00:00Z' },
  { id: '1', name: 'Jahongir T.', full_name: 'Jahongir T.', email: 'admin@f1rc.uz', role: 'admin', createdAt: '2026-06-01T10:00:00Z', created_date: '2026-06-01T10:00:00Z' },
  { id: '2', name: 'Sardor M.', full_name: 'Sardor M.', email: 'operator@f1rc.uz', role: 'operator', createdAt: '2026-06-02T11:00:00Z', created_date: '2026-06-02T11:00:00Z' },
  { id: '3', name: 'Aziz K.', full_name: 'Aziz K.', email: 'manager@f1rc.uz', role: 'team_manager', createdAt: '2026-06-03T12:00:00Z', created_date: '2026-06-03T12:00:00Z' },
  { id: '4', name: 'Bobur H.', full_name: 'Bobur H.', email: 'racer@f1rc.uz', role: 'racer', createdAt: '2026-06-04T13:00:00Z', created_date: '2026-06-04T13:00:00Z' },
  { id: '5', name: 'Viewer User', full_name: 'Viewer User', email: 'viewer@f1rc.uz', role: 'viewer', createdAt: '2026-06-05T14:00:00Z', created_date: '2026-06-05T14:00:00Z' },
];

export const mockCategories = [
  {
    id: 'c1', name: 'Formula RC', code: 'FRC', active: true, color: '#FF0000',
    description: 'Open-wheel Formula tarzida RC poyga. Eng tezkor sinf.',
    laps: 20, maxSpeed: '80 km/h', vehicleCount: 6, minAge: 14, entryFee: '$45',
  },
  {
    id: 'c2', name: 'GT Race', code: 'GTR', active: true, color: '#0066FF',
    description: 'Gran Turismo uslubidagi RC poyga. Sport mashinalar sinfi.',
    laps: 15, maxSpeed: '75 km/h', vehicleCount: 6, minAge: 12, entryFee: '$35',
  },
  {
    id: 'c3', name: 'Rally RC', code: 'RRC', active: true, color: '#FF6600',
    description: 'Offroad va gravel yo\'llar uchun rally sinfi.',
    laps: 12, maxSpeed: '70 km/h', vehicleCount: 4, minAge: 12, entryFee: '$30',
  },
  {
    id: 'c4', name: 'Hypercar', code: 'HYP', active: true, color: '#9900FF',
    description: 'Ultra-tezkor hypercar RC sinfi. Tajribali racerlar uchun.',
    laps: 25, maxSpeed: '160 km/h', vehicleCount: 4, minAge: 16, entryFee: '$80',
  },
  {
    id: 'c5', name: 'Junior RC', code: 'JRC', active: false, color: '#00CC44',
    description: 'Yosh racerlar uchun mo\'tadil tezlikdagi sinf.',
    laps: 10, maxSpeed: '40 km/h', vehicleCount: 6, minAge: 8, entryFee: '$20',
  },
];

export const mockVehicles = [
  { id: 'v1', number: '#001', model: 'Tamiya F104 Pro',  category: 'Formula RC', status: 'AVAILABLE',   batteryLevel: 95, totalRaces: 142, lastUsed: '2026-06-16', speed: '80 km/h',  color: '#FF0000' },
  { id: 'v2', number: '#002', model: 'Kyosho Inferno',   category: 'GT Race',    status: 'IN_USE',      batteryLevel: 42, totalRaces: 98,  lastUsed: '2026-06-16', speed: '75 km/h',  color: '#0066FF' },
  { id: 'v3', number: '#003', model: 'HPI Baja 5B',      category: 'Rally RC',   status: 'MAINTENANCE', batteryLevel: 0,  totalRaces: 210, lastUsed: '2026-06-14', speed: '70 km/h',  color: '#FF6600' },
  { id: 'v4', number: '#004', model: 'Traxxas XO-1',     category: 'Hypercar',   status: 'AVAILABLE',   batteryLevel: 88, totalRaces: 65,  lastUsed: '2026-06-15', speed: '160 km/h', color: '#FFCC00' },
  { id: 'v5', number: '#005', model: 'Tamiya F104 Pro',  category: 'Formula RC', status: 'AVAILABLE',   batteryLevel: 72, totalRaces: 88,  lastUsed: '2026-06-15', speed: '80 km/h',  color: '#FFFFFF' },
  { id: 'v6', number: '#006', model: 'Kyosho Inferno',   category: 'GT Race',    status: 'IN_USE',      batteryLevel: 55, totalRaces: 134, lastUsed: '2026-06-16', speed: '75 km/h',  color: '#00CC44' },
  { id: 'v7', number: '#007', model: 'Losi 5IVE-T',      category: 'Rally RC',   status: 'AVAILABLE',   batteryLevel: 100, totalRaces: 47, lastUsed: '2026-06-13', speed: '68 km/h',  color: '#9900FF' },
  { id: 'v8', number: '#008', model: 'Traxxas XO-1',     category: 'Hypercar',   status: 'MAINTENANCE', batteryLevel: 0,  totalRaces: 180, lastUsed: '2026-06-12', speed: '160 km/h', color: '#FF0066' },
];

export const base44Mock = {
  auth: {
    async loginViaEmailPassword(phone: string, password: string): Promise<{ user?: F1User; error?: string }> {
      if (!phone || !password) {
        return { error: 'Telefon va parol kiritilishi shart' };
      }
      // NOTE: Mock login — role telefon raqamiga qarab aniqlanmaydi.
      // Development uchun default admin login.
      const stored = getStoredUser();
      if (stored) {
        return { user: stored };
      }
      const user: F1User = {
        id: 'dev-admin-1',
        email: 'admin@f1rc.uz',
        name: 'Dev Admin',
        full_name: 'Dev Admin',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      storeUser(user);
      localStorage.setItem(TOKEN_KEY, 'dev-mock-token-xxx');
      return { user };
    },

    async getUser(): Promise<F1User | null> {
      return getStoredUser();
    },

    logout(redirectUrl = '/login'): void {
      clearUser();
      window.location.href = redirectUrl;
    },

    async register(data: { email: string }): Promise<void> {
      // Dev mock — faqat log
      console.info('[DEV MOCK] register:', data.email);
    },

    async verifyOtp(_data: { email: string; otpCode: string }): Promise<{ access_token: string }> {
      return { access_token: 'dev-mock-token-xxx' };
    },

    setToken(token: string): void {
      localStorage.setItem(TOKEN_KEY, token);
    },

    async resendOtp(_email: string): Promise<void> {
      console.info('[DEV MOCK] resendOtp called');
    },

    loginWithProvider(_provider: string, _redirectUrl: string): void {
      console.info('[DEV MOCK] loginWithProvider called');
    },

    async resetPasswordRequest(_email: string): Promise<void> {
      console.info('[DEV MOCK] resetPasswordRequest called');
    },

    async resetPassword(_data: { resetToken?: string; newPassword?: string }): Promise<void> {
      console.info('[DEV MOCK] resetPassword called');
    },
  },

  users: {
    async inviteUser(_email: string, _role: string): Promise<void> {
      console.info('[DEV MOCK] inviteUser called');
    },
  },

  entities: {
    User: {
      async list(_sort?: string, limit?: number): Promise<F1User[]> {
        return mockUsers.slice(0, limit ?? mockUsers.length);
      },
    },
    Event: {
      async list(_sort?: string, _limit?: number): Promise<unknown[]> {
        return [];
      },
    },
    Booking: {
      async list(_sort?: string, _limit?: number): Promise<unknown[]> {
        return [];
      },
    },
  },

  async getPublicSettings(): Promise<{ siteName: string; theme: string }> {
    return { siteName: 'F1RC.UZ', theme: 'dark' };
  },
};
