import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '@/pages/public/LandingPage';
import FAQPage from '@/pages/public/FAQPage';
import AboutPage from '@/pages/public/AboutPage';
import React from 'react';

// Mock hooks
vi.mock('@/hooks/api/useEvents', () => ({
  usePublicEvents: () => ({ data: { data: [] }, isLoading: false, isError: false }),
  usePublicEvent: () => ({ data: null, isLoading: false, isError: false }),
}));

vi.mock('@/hooks/api/useArenas', () => ({
  usePublicArenas: () => ({ data: { data: [] }, isLoading: false, isError: false }),
  usePublicArena: () => ({ data: null, isLoading: false, isError: false }),
}));

vi.mock('@/hooks/api/useCategories', () => ({
  usePublicCategories: () => ({ data: { data: [] }, isLoading: false, isError: false }),
  usePublicCategory: () => ({ data: null, isLoading: false, isError: false }),
}));

vi.mock('@/hooks/api/useAchievements', () => ({
  usePublicAchievements: () => ({ data: { data: [] }, isLoading: false, isError: false }),
}));

vi.mock('@/hooks/api/useTeams', () => ({
  useMyTeams: () => ({ data: { data: [] }, isLoading: false, isError: false }),
  useMyTeam: () => ({ data: null, isLoading: false, isError: false }),
}));

vi.mock('@/hooks/api/useStreams', () => ({
  usePublicStreams: () => ({ data: { data: [] }, isLoading: false, isError: false }),
}));

vi.mock('@/hooks/api/useSeasons', () => ({
  usePublicSeasons: () => ({ data: { data: [] }, isLoading: false, isError: false }),
}));

vi.mock('@/hooks/api/useLeaderboard', () => ({
  useLeaderboard: () => ({ data: { data: [] }, isLoading: false, isError: false }),
}));

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    checkUserAuth: vi.fn(),
  }),
}));

vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    locale: 'uz',
    t: {
      events: 'Eventlar',
      categories: 'Kategoriyalar',
      vehicles: 'Avtomobillar',
      leaderboard: 'Reyting',
      teams: 'Jamoalar',
    },
    setLocale: vi.fn(),
  }),
}));

describe('Public Viewer Pages Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders LandingPage with logo and main headings', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('F1RC.UZ')).toBeInTheDocument();
    expect(screen.getByText('Race Without Limits')).toBeInTheDocument();
    expect(screen.getByText('Platforma nima?')).toBeInTheDocument();
    expect(screen.getByText('Hozircha kelgusi event mavjud emas.')).toBeInTheDocument();
    expect(screen.getByText('Hozircha jonli efir mavjud emas.')).toBeInTheDocument();
  });

  test('renders FAQPage and keyboard-accessible accordion buttons', () => {
    render(
      <MemoryRouter>
        <FAQPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Ko'p beriladigan savollar")).toBeInTheDocument();
    const faqButton = screen.getByRole('button', { name: /F1RC.UZ nima\?/i });
    expect(faqButton).toBeInTheDocument();
    expect(faqButton.tagName.toLowerCase()).toBe('button');
  });

  test('renders AboutPage values without invented statistics', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    );

    expect(screen.getByText('F1RC.UZ loyihasi haqida')).toBeInTheDocument();
    expect(screen.queryByText('Real RC Arenas')).not.toBeInTheDocument();
    expect(screen.getByText('Haqiqiy Telemetriya')).toBeInTheDocument();
  });
});
