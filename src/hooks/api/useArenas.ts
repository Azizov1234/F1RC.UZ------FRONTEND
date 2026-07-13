import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  arenasApi,
  type CreateArenaDto,
  type GetAdminArenasParams,
  type GetPublicArenasParams,
  type UpdateArenaDto,
} from '../../api/arenas.api';
import { queryKeys } from './useQueryKeys';

type ArenaId = number | string;

function hasArenaId(id: ArenaId | undefined): id is ArenaId {
  return id !== undefined && id !== '';
}

function requireArenaId(id: ArenaId | undefined): ArenaId {
  if (!hasArenaId(id)) {
    throw new Error('Arena ID is required');
  }
  return id;
}

export function useArenas(params?: GetAdminArenasParams) {
  return useQuery({
    queryKey: queryKeys.arenas.list({ ...params, scope: 'admin' }),
    queryFn: async () => {
      const res = await arenasApi.getArenas(params);
      return res.data;
    }
  });
}

export const useAdminArenas = useArenas;

export function usePublicArenas(params?: GetPublicArenasParams) {
  return useQuery({
    queryKey: queryKeys.arenas.list({ ...params, scope: 'public' }),
    queryFn: () => arenasApi.getPublicArenas(params),
    staleTime: 30_000,
  });
}

export function usePublicArena(id: ArenaId | undefined) {
  return useQuery({
    queryKey: queryKeys.arenas.publicDetail(id ?? ''),
    queryFn: async () => {
      const response = await arenasApi.getPublicArenaById(requireArenaId(id));
      return response.data;
    },
    enabled: hasArenaId(id),
    staleTime: 30_000,
  });
}

export function useArenaDetail(id: ArenaId | undefined) {
  return useQuery({
    queryKey: queryKeys.arenas.adminDetail(id ?? ''),
    queryFn: async () => {
      const response = await arenasApi.getArenaById(requireArenaId(id));
      return response.data;
    },
    enabled: hasArenaId(id),
    staleTime: 30_000,
  });
}

export const useAdminArena = useArenaDetail;

export function useCreateArena() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData | CreateArenaDto) => {
      const res = await arenasApi.createArena(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.arenas.all() });
    }
  });
}

export function useUpdateArena() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: ArenaId; data: FormData | UpdateArenaDto }) => {
      const res = await arenasApi.updateArena(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.arenas.all() });
    }
  });
}

export function useToggleArena() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: ArenaId; active: boolean }) => {
      const res = await arenasApi.activeOrDisactiveArena(id, active);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.arenas.all() });
    }
  });
}
