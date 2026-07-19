import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ApiClient } from '@/api/api';
import { eventsApi } from '@/api/events.api';
import { arenasApi } from '@/api/arenas.api';
import { categoriesApi } from '@/api/categories.api';
import { vehiclesApi } from '@/api/vehicles.api';
import { seasonsApi } from '@/api/seasons.api';
import { leaderboardApi } from '@/api/leaderboard.api';
import { useLeaderboard } from '@/hooks/api/useLeaderboard';
import PublicTeamsPage from '@/pages/public/PublicTeamsPage';
import PublicTeamDetailPage from '@/pages/public/PublicTeamDetailPage';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('public API response contracts', () => {
  it('normalizes the named event detail envelope and public slot state', async () => {
    vi.spyOn(ApiClient, 'get').mockResolvedValueOnce({
      success: true,
      event: {
        id: 9,
        name: 'Public event',
        scheduleSlots: [{ id: 3, status: 'OPEN' }],
      },
    } as never);

    const response = await eventsApi.getPublicEventById(9);

    expect(response.data.id).toBe(9);
    expect(response.data.isActive).toBe(true);
    expect(response.data.scheduleSlots?.[0].isActive).toBe(true);
  });

  it('preserves arena counts and aliases live zones for existing consumers', async () => {
    vi.spyOn(ApiClient, 'get').mockResolvedValueOnce({
      success: true,
      arena: {
        id: 1,
        name: 'Arena',
        trackLayoutsCount: 2,
        zonesCount: 1,
        zones: [{ id: 5, name: 'Pit lane' }],
        events: [{ id: 8, name: 'Race' }],
      },
    } as never);

    const response = await arenasApi.getPublicArenaById(1);

    expect(response.data.trackLayoutsCount).toBe(2);
    expect(response.data.zonesCount).toBe(1);
    expect(response.data.arenaZones).toEqual(response.data.zones);
    expect(response.data.events?.[0].id).toBe(8);
  });

  it('normalizes category, vehicle, and season resource keys', async () => {
    const get = vi.spyOn(ApiClient, 'get');
    get.mockResolvedValueOnce({ success: true, category: { id: 2, name: 'GT' } } as never);
    get.mockResolvedValueOnce({ success: true, vehicle: { id: 3, name: 'RC', status: 'AVAILABLE' } } as never);
    get.mockResolvedValueOnce({ success: true, season: { id: 4, name: '2026', eventsCount: 7 } } as never);

    const category = await categoriesApi.getPublicCategoryById(2);
    const vehicle = await vehiclesApi.getPublicVehicleById(3);
    const season = await seasonsApi.getPublicSeasonById(4);

    expect(category.data.isActive).toBe(true);
    expect(vehicle.data.isActive).toBe(true);
    expect(season.data.eventsCount).toBe(7);
    expect(season.data.isActive).toBe(true);
  });

  it('passes React Query abort signals through public list requests', async () => {
    const get = vi.spyOn(ApiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [],
      meta: { total: 0, page: 1, limit: 1, totalPages: 0, hasNextPage: false, hasPrevPage: false },
    } as never);
    const controller = new AbortController();

    await arenasApi.getPublicArenas({ limit: 1 }, { signal: controller.signal });

    expect(get).toHaveBeenCalledWith('/arenas?limit=1', { signal: controller.signal });
  });

  it('does not request leaderboard data until season and category are valid', () => {
    const request = vi.spyOn(leaderboardApi, 'getLeaderboard');
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useLeaderboard(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(request).not.toHaveBeenCalled();
  });

  it('requests leaderboard data with both IDs and an abort signal', async () => {
    const request = vi.spyOn(leaderboardApi, 'getLeaderboard').mockResolvedValueOnce({
      success: true,
      data: [],
      meta: { total: 0, page: 1, limit: 3, totalPages: 0, hasNextPage: false, hasPrevPage: false },
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    renderHook(() => useLeaderboard({ seasonId: 2, categoryId: 4, limit: 3 }), { wrapper });

    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request).toHaveBeenCalledWith(
      { seasonId: 2, categoryId: 4, limit: 3 },
      { signal: expect.any(AbortSignal) },
    );
  });
});

describe('public teams fallback', () => {
  it('renders list and detail states without any teams API request', () => {
    const get = vi.spyOn(ApiClient, 'get');
    const { unmount } = render(<MemoryRouter><PublicTeamsPage /></MemoryRouter>);
    expect(screen.getByText('Ochiq jamoalar katalogi hozircha mavjud emas')).toBeInTheDocument();
    unmount();

    render(
      <MemoryRouter initialEntries={['/teams/42']}>
        <Routes><Route path='/teams/:id' element={<PublicTeamDetailPage />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Jamoa tafsiloti guest rejimida ochiq emas')).toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
  });
});
