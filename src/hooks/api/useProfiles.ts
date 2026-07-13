import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profilesApi, type UpdateProfileDto } from '../../api/profiles.api';
import { queryKeys } from './useQueryKeys';

type UserId = number | string;

function hasUserId(userId: UserId | undefined): userId is UserId {
  return userId !== undefined && userId !== '';
}

function requireUserId(userId: UserId | undefined): UserId {
  if (!hasUserId(userId)) {
    throw new Error('User ID is required');
  }
  return userId;
}

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.profiles.my(),
    queryFn: async () => {
      const response = await profilesApi.getMyProfile();
      return response.data;
    },
    staleTime: 30_000,
  });
}

export function useProfileByUserId(userId: UserId | undefined) {
  return useQuery({
    queryKey: queryKeys.profiles.detail(userId ?? ''),
    queryFn: async () => {
      const response = await profilesApi.getProfileByUserId(requireUserId(userId));
      return response.data;
    },
    enabled: hasUserId(userId),
    staleTime: 30_000,
  });
}

export const useProfile = useProfileByUserId;

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProfileDto | FormData) => {
      const response = await profilesApi.updateMyProfile(data);
      return response.data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profiles.my(), profile);
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
}
