import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/AuthContext';
import type { F1User } from '../../api/base44Client';
import React from 'react';

// Mock useAuth
vi.mock('../../lib/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute Role-Based Routing tests', () => {
  const user = (role: F1User['role']): F1User => ({
    id: `u-${role}`,
    email: `${role}@f1rc.uz`,
    name: role,
    full_name: role,
    role,
    createdAt: '2026-07-13T00:00:00.000Z',
  });

  const authState = (overrides: Partial<ReturnType<typeof useAuth>>): ReturnType<typeof useAuth> => ({
    isAuthenticated: false,
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    authChecked: true,
    authError: null,
    user: null,
    navigateToLogin: vi.fn(),
    checkUserAuth: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders children (Outlet) if user is authenticated and role is allowed', async () => {
    vi.mocked(useAuth).mockReturnValue(authState({
      isAuthenticated: true,
      user: user('admin'),
    }));

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<div>Admin Area</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Area')).toBeInTheDocument();
  });

  test('redirects to /403 if user is authenticated but role is NOT allowed', async () => {
    vi.mocked(useAuth).mockReturnValue(authState({
      isAuthenticated: true,
      user: user('racer'),
    }));

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<div>Admin Area</div>} />
          </Route>
          <Route path="/403" element={<div>Access Denied</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Admin Area')).not.toBeInTheDocument();
  });

  test('redirects to /login if user is NOT authenticated', async () => {
    vi.mocked(useAuth).mockReturnValue(authState({ isAuthenticated: false, user: null }));

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} unauthenticatedElement={<div>Redirect to Login</div>} />}>
            <Route path="/admin" element={<div>Admin Area</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Redirect to Login')).toBeInTheDocument();
  });
});
