import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { arenaZonesApi, type GetArenaZonesParams } from '../../api/arena-zones.api';
import { queryKeys } from './useQueryKeys';

type ArenaZoneId = number | string;

function hasArenaZoneId(id: ArenaZoneId | undefined): id is ArenaZoneId {
  return id !== undefined && id !== '';
}

function requireArenaZoneId(id: ArenaZoneId | undefined): ArenaZoneId {
  if (!hasArenaZoneId(id)) {
    throw new Error('Arena zone ID is required');
  }
  return id;
}

export function useAdminArenaZones(params?: GetArenaZonesParams) {
  return useQuery({
    queryKey: queryKeys.arenaZones.list({ ...params }),
    queryFn: () => arenaZonesApi.getAdminArenaZones(params),
    staleTime: 15_000,
  });
}

export const useArenaZones = useAdminArenaZones;

export function useArenaZone(id: ArenaZoneId | undefined) {
  return useQuery({
    queryKey: queryKeys.arenaZones.detail(id ?? ''),
    queryFn: async () => {
      const response = await arenaZonesApi.getAdminArenaZoneById(requireArenaZoneId(id));
      return response.data;
    },
    enabled: hasArenaZoneId(id),
    staleTime: 15_000,
  });
}

export const useArenaZoneDetail = useArenaZone;

export function useCreateArenaZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await arenaZonesApi.createArenaZone(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.arenaZones.all() });
    },
  });
}

export function useUpdateArenaZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: ArenaZoneId; data: FormData }) => {
      const response = await arenaZonesApi.updateArenaZone(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.arenaZones.all() });
    },
  });
}

export function useToggleArenaZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: ArenaZoneId; isActive: boolean }) => {
      const response = await arenaZonesApi.toggleArenaZone(id, isActive);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.arenaZones.all() });
    },
  });
}
