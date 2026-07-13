import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trackLayoutsApi, type GetTrackLayoutsParams } from '../../api/track-layouts.api';
import { queryKeys } from './useQueryKeys';

type TrackLayoutId = number | string;

function hasTrackLayoutId(id: TrackLayoutId | undefined): id is TrackLayoutId {
  return id !== undefined && id !== '';
}

function requireTrackLayoutId(id: TrackLayoutId | undefined): TrackLayoutId {
  if (!hasTrackLayoutId(id)) {
    throw new Error('Track layout ID is required');
  }
  return id;
}

export function usePublicTrackLayouts(params?: GetTrackLayoutsParams) {
  return useQuery({
    queryKey: queryKeys.trackLayouts.list({ ...params, scope: 'public' }),
    queryFn: () => trackLayoutsApi.getPublicTrackLayouts(params),
    staleTime: 30_000,
  });
}

export const useTrackLayouts = usePublicTrackLayouts;

export function usePublicTrackLayout(id: TrackLayoutId | undefined) {
  return useQuery({
    queryKey: queryKeys.trackLayouts.publicDetail(id ?? ''),
    queryFn: async () => {
      const response = await trackLayoutsApi.getPublicTrackLayoutById(requireTrackLayoutId(id));
      return response.data;
    },
    enabled: hasTrackLayoutId(id),
    staleTime: 30_000,
  });
}

export function useAdminTrackLayouts(params?: GetTrackLayoutsParams) {
  return useQuery({
    queryKey: queryKeys.trackLayouts.list({ ...params, scope: 'admin' }),
    queryFn: () => trackLayoutsApi.getAdminTrackLayouts(params),
    staleTime: 15_000,
  });
}

export function useAdminTrackLayout(id: TrackLayoutId | undefined) {
  return useQuery({
    queryKey: queryKeys.trackLayouts.adminDetail(id ?? ''),
    queryFn: async () => {
      const response = await trackLayoutsApi.getAdminTrackLayoutById(requireTrackLayoutId(id));
      return response.data;
    },
    enabled: hasTrackLayoutId(id),
    staleTime: 15_000,
  });
}

export const useTrackLayoutDetail = useAdminTrackLayout;

export function useCreateTrackLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await trackLayoutsApi.createTrackLayout(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackLayouts.all() });
    },
  });
}

export function useUpdateTrackLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: TrackLayoutId; data: FormData }) => {
      const response = await trackLayoutsApi.updateTrackLayout(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackLayouts.all() });
    },
  });
}

export function useToggleTrackLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: TrackLayoutId; isActive: boolean }) => {
      const response = await trackLayoutsApi.toggleTrackLayout(id, isActive);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackLayouts.all() });
    },
  });
}
