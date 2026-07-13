import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  achievementsApi,
  type AwardAchievementDto,
  type CreateAchievementDto,
  type GetAchievementsParams,
  type UpdateAchievementDto,
} from '../../api/achievements.api';
import { queryKeys } from './useQueryKeys';

type AchievementId = number | string;

function hasAchievementId(id: AchievementId | undefined): id is AchievementId {
  return id !== undefined && id !== '';
}

function requireAchievementId(id: AchievementId | undefined): AchievementId {
  if (!hasAchievementId(id)) {
    throw new Error('Achievement ID is required');
  }
  return id;
}

export function usePublicAchievements(params?: GetAchievementsParams) {
  return useQuery({
    queryKey: queryKeys.achievements.list({ ...params, scope: 'public' }),
    queryFn: () => achievementsApi.getPublicAchievements(params),
    staleTime: 30_000,
  });
}

export const useAchievements = usePublicAchievements;

export function useAdminAchievements(params?: GetAchievementsParams) {
  return useQuery({
    queryKey: queryKeys.achievements.adminList({ ...params }),
    queryFn: () => achievementsApi.getAdminAchievements(params),
    staleTime: 15_000,
  });
}

export function useAdminAchievement(id: AchievementId | undefined) {
  return useQuery({
    queryKey: queryKeys.achievements.detail(id ?? ''),
    queryFn: async () => {
      const response = await achievementsApi.getAdminAchievementById(requireAchievementId(id));
      return response.data;
    },
    enabled: hasAchievementId(id),
    staleTime: 15_000,
  });
}

export function useMyAchievements(params?: GetAchievementsParams) {
  return useQuery({
    queryKey: queryKeys.achievements.my({ ...params }),
    queryFn: () => achievementsApi.getMyAchievements(params),
    staleTime: 15_000,
  });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAchievementDto | FormData) => {
      const response = await achievementsApi.createAchievement(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all() });
    },
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: AchievementId;
      data: UpdateAchievementDto | FormData;
    }) => {
      const response = await achievementsApi.updateAchievement(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all() });
    },
  });
}

export function useToggleAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: AchievementId; isActive: boolean }) => {
      const response = await achievementsApi.toggleAchievement(id, isActive);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all() });
    },
  });
}

export function useAwardAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      achievementId,
      ...data
    }: AwardAchievementDto & { achievementId: AchievementId }) => {
      const response = await achievementsApi.awardAchievement(achievementId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all() });
    },
  });
}
