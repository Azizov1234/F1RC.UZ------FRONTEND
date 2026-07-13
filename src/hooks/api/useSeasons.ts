import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  seasonsApi,
  type CreateSeasonDto,
  type GetAdminSeasonsParams,
  type GetPublicSeasonsParams,
  type UpdateSeasonDto,
} from '../../api/seasons.api';
import { queryKeys } from './useQueryKeys';

type SeasonId = number | string;

function hasId(id: SeasonId | undefined): id is SeasonId {
  return id !== undefined && id !== '';
}

function requireId(id: SeasonId | undefined): SeasonId {
  if (!hasId(id)) throw new Error('Season ID is required');
  return id;
}

function invalidateSeasons(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.events.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.all() });
}

export function usePublicSeasons(params?: GetPublicSeasonsParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.seasons.list({ ...params, scope: 'public' }),
    queryFn: () => seasonsApi.getPublicSeasons(params),
    enabled,
    staleTime: 60_000,
  });
}

export function usePublicSeason(id: SeasonId | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.seasons.detail(`public:${id ?? ''}`),
    queryFn: async () => (await seasonsApi.getPublicSeasonById(requireId(id))).data,
    enabled: enabled && hasId(id),
    staleTime: 60_000,
  });
}

export function useAdminSeasons(params?: GetAdminSeasonsParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.seasons.list({ ...params, scope: 'admin' }),
    queryFn: () => seasonsApi.getAdminSeasons(params),
    enabled,
    staleTime: 30_000,
  });
}

export function useAdminSeason(id: SeasonId | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.seasons.detail(`admin:${id ?? ''}`),
    queryFn: async () => (await seasonsApi.getAdminSeasonById(requireId(id))).data,
    enabled: enabled && hasId(id),
    staleTime: 30_000,
  });
}

export function useCreateSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSeasonDto) =>
      (await seasonsApi.createSeason(data)).data,
    onSuccess: () => invalidateSeasons(queryClient),
  });
}

export function useUpdateSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: SeasonId; data: UpdateSeasonDto }) =>
      (await seasonsApi.updateSeason(id, data)).data,
    onSuccess: () => invalidateSeasons(queryClient),
  });
}

export function useToggleSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: SeasonId; isActive: boolean }) =>
      (await seasonsApi.toggleSeasonStatus(id, isActive)).data,
    onSuccess: () => invalidateSeasons(queryClient),
  });
}
