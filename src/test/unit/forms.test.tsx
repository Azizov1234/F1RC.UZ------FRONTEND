/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../pages/Login';
import { base44 } from '../../api/base44Client';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../lib/AuthContext';

// Mock base44 auth client
vi.mock('../../api/base44Client', () => ({
  base44: {
    auth: {
      loginViaEmailPassword: vi.fn(),
      getUser: vi.fn().mockResolvedValue(null),
    },
    getPublicSettings: vi.fn().mockResolvedValue({ siteName: 'F1RC', theme: 'dark' } as any),
  },
}));

describe('Login Form tests', () => {
  const renderLogin = async () => {
    const view = render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );
    await waitFor(() => expect(base44.auth.getUser).toHaveBeenCalled());
    return view;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('displays error messages when fields are submitted empty', async () => {
    await renderLogin();

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Kirish/i });
    fireEvent.click(submitBtn);

    // Assert validation error messages appear
    await waitFor(() => {
      expect(screen.getByText('Telefon raqamini kiriting')).toBeInTheDocument();
      expect(screen.getByText('Parolni kiriting')).toBeInTheDocument();
    });
  });

  test('toggles password visibility when toggle button is clicked', async () => {
    await renderLogin();

    const passwordInput = screen.getByLabelText('Parol');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: /Parolni ko'rsatish/i });
    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('displays API error message on login failure', async () => {
    vi.mocked(base44.auth.loginViaEmailPassword).mockResolvedValue({
      error: 'Telefon raqami yoki parol noto\'g\'ri',
    });

    await renderLogin();

    const phoneInput = screen.getByLabelText('Telefon raqami');
    const passwordInput = screen.getByLabelText('Parol');
    const submitBtn = screen.getByRole('button', { name: /Kirish/i });

    await userEvent.type(phoneInput, '+998901234567');
    await userEvent.type(passwordInput, 'wrongpass');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Telefon raqami yoki parol noto'g'ri")).toBeInTheDocument();
    });
  });
});
