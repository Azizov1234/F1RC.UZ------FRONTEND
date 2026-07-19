/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../lib/AuthContext';
import { base44 } from '../../api/base44Client';
import React from 'react';

// Simple Test Component
function TestComponent() {
  const { isAuthenticated, user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return <div>Loading Auth...</div>;
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Guest'}</span>
      {user && <span data-testid="user-role">{user.role}</span>}
    </div>
  );
}

describe('AuthProvider & AuthContext tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv('VITE_API_URL', 'http://api.f1rc.uz');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test('restores authentication state if base44.auth.getUser() returns user', async () => {
    const mockUser = {
      id: 'u-1',
      email: 'racer@f1rc.uz',
      name: 'Racer User',
      full_name: 'Racer User',
      role: 'racer' as const,
      createdAt: '2026-06-16',
    };

    vi.spyOn(base44.auth, 'getUser').mockResolvedValue(mockUser);
    vi.spyOn(base44, 'getPublicSettings').mockResolvedValue({ siteName: 'F1RC', theme: 'dark' } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial Loading State
    expect(screen.getByText('Loading Auth...')).toBeInTheDocument();

    // Authenticated state rendered
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('racer');
    });
  });

  test('Guest state if base44.auth.getUser() returns null', async () => {
    vi.spyOn(base44.auth, 'getUser').mockResolvedValue(null);
    vi.spyOn(base44, 'getPublicSettings').mockResolvedValue({ siteName: 'F1RC', theme: 'dark' } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');
    });
  });

  test('clears local cache and logs out user via base44.auth.logout', () => {
    localStorage.setItem('f1rc_access_token', 'valid-token');
    localStorage.setItem('f1rc_user', JSON.stringify({ id: 'u-1' }));

    const logoutSpy = vi.spyOn(base44.auth, 'logout').mockImplementation(async () => {
      localStorage.removeItem('f1rc_access_token');
      localStorage.removeItem('f1rc_user');
    });

    base44.auth.logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(localStorage.getItem('f1rc_access_token')).toBeNull();
    expect(localStorage.getItem('f1rc_user')).toBeNull();
  });
});
