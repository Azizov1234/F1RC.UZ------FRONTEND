import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  leaderboardApi,
  type CreateLeaderboardEntryDto,
  type GetAdminLeaderboardParams,
  type GetLeaderboardParams,
  type UpdateLeaderboardEntryDto,
} from '../../api/leaderboard.api';
import { queryKeys } from './useQueryKeys';

type LeaderboardEntryId = number | string;

function hasLeaderboardEntryId(id: LeaderboardEntryId | undefined): id is LeaderboardEntryId {
  return id !== undefined && id !== '';
}

function requireLeaderboardEntryId(id: LeaderboardEntryId | undefined): LeaderboardEntryId {
  if (!hasLeaderboardEntryId(id)) {
    throw new Error('Leaderboard entry ID is required');
  }
  return id;
}

function hasValidLeaderboardParams(
  params: GetLeaderboardParams | undefined,
): params is GetLeaderboardParams {
  return Boolean(
    params &&
      Number.isFinite(params.seasonId) &&
      params.seasonId > 0 &&
      Number.isFinite(params.categoryId) &&
      params.categoryId > 0,
  );
}

export function useLeaderboard(params: GetLeaderboardParams | undefined) {
  return useQuery({
    queryKey: queryKeys.leaderboard.public({ ...params }),
    queryFn: () => {
      if (!hasValidLeaderboardParams(params)) {
        throw new Error('Leaderboard requires a valid season and category');
      }
      return leaderboardApi.getLeaderboard(params);
    },
    enabled: hasValidLeaderboardParams(params),
    staleTime: 15_000,
  });
}

export function useAdminLeaderboard(params?: GetAdminLeaderboardParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.leaderboard.admin({ ...params }),
    queryFn: () => leaderboardApi.getAdminLeaderboard(params),
    enabled,
    staleTime: 10_000,
  });
}

export function useAdminLeaderboardEntry(id: LeaderboardEntryId | undefined) {
  return useQuery({
    queryKey: queryKeys.leaderboard.detail(id ?? ''),
    queryFn: async () => {
      const response = await leaderboardApi.getAdminLeaderboardById(
        requireLeaderboardEntryId(id),
      );
      return response.data;
    },
    enabled: hasLeaderboardEntryId(id),
    staleTime: 10_000,
  });
}

export const useLeaderboardEntry = useAdminLeaderboardEntry;

export function useCreateLeaderboardEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLeaderboardEntryDto) => {
      const response = await leaderboardApi.createLeaderboardEntry(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.all() });
    },
  });
}

export function useUpdateLeaderboardEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: LeaderboardEntryId;
      data: UpdateLeaderboardEntryDto;
    }) => {
      const response = await leaderboardApi.updateLeaderboardEntry(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.all() });
    },
  });
}
