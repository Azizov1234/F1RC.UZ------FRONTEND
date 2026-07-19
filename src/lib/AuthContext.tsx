import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { base44, type F1User } from '@/api/base44Client';

interface AuthError {
  type: 'user_not_registered' | 'auth_required' | 'unknown';
  message?: string;
}

interface AuthContextValue {
  user: F1User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authChecked: boolean;
  authError: AuthError | null;
  navigateToLogin: () => void;
  checkUserAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<F1User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  useEffect(() => {
    base44
      .getPublicSettings()
      .then(() => setIsLoadingPublicSettings(false))
      .catch(() => setIsLoadingPublicSettings(false));
  }, []);

  const checkUserAuth = useCallback(async () => {
    const isTest = import.meta.env.MODE === 'test';
    const hasToken = localStorage.getItem('f1rc_access_token') || localStorage.getItem('f1rc_token');
    if (!hasToken && !isTest) {
      setUser(null);
      setAuthError(null);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }

    setIsLoadingAuth(true);
    try {
      const currentUser = await base44.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        setAuthError(null);
      } else {
        setUser(null);
        setAuthError(null);
      }
    } catch {
      setUser(null);
      setAuthError(null);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  useEffect(() => {
    const handleAuthCleared = () => {
      setUser(null);
      setAuthError(null);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    };

    window.addEventListener('f1rc:auth-cleared', handleAuthCleared);
    return () => window.removeEventListener('f1rc:auth-cleared', handleAuthCleared);
  }, []);

  const navigateToLogin = useCallback(() => {
    window.location.href = '/login';
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoadingAuth,
    isLoadingPublicSettings,
    authChecked,
    authError,
    navigateToLogin,
    checkUserAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
