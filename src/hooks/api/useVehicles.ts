import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  vehiclesApi,
  type CreateVehicleDto,
  type GetAdminVehiclesParams,
  type GetPublicVehiclesParams,
  type UpdateVehicleDto,
} from '../../api/vehicles.api';
import { queryKeys } from './useQueryKeys';

type VehicleId = number | string;

function hasVehicleId(id: VehicleId | undefined): id is VehicleId {
  return id !== undefined && id !== '';
}

function requireVehicleId(id: VehicleId | undefined): VehicleId {
  if (!hasVehicleId(id)) {
    throw new Error('Vehicle ID is required');
  }
  return id;
}

export function useVehicles(params?: GetAdminVehiclesParams) {
  return useQuery({
    queryKey: queryKeys.vehicles.list({ ...params, scope: 'admin' }),
    queryFn: async () => {
      const res = await vehiclesApi.getVehicles(params);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export const useAdminVehicles = useVehicles;

export function usePublicVehicles(params?: GetPublicVehiclesParams) {
  return useQuery({
    queryKey: queryKeys.vehicles.list({ ...params, scope: 'public' }),
    queryFn: ({ signal }) => vehiclesApi.getPublicVehicles(params, { signal }),
    staleTime: 30_000,
  });
}

export function usePublicVehicle(id: VehicleId | undefined) {
  return useQuery({
    queryKey: queryKeys.vehicles.publicDetail(id ?? ''),
    queryFn: async ({ signal }) => {
      const response = await vehiclesApi.getPublicVehicleById(
        requireVehicleId(id),
        { signal },
      );
      return response.data;
    },
    enabled: hasVehicleId(id),
    staleTime: 30_000,
  });
}

export function useAdminVehicle(id: VehicleId | undefined) {
  return useQuery({
    queryKey: queryKeys.vehicles.adminDetail(id ?? ''),
    queryFn: async () => {
      const response = await vehiclesApi.getAdminVehicleById(requireVehicleId(id));
      return response.data;
    },
    enabled: hasVehicleId(id),
    staleTime: 15_000,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData | CreateVehicleDto) => {
      const res = await vehiclesApi.createVehicle(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: VehicleId; data: FormData | UpdateVehicleDto }) => {
      const res = await vehiclesApi.updateVehicle(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() });
    },
  });
}

export function useDisableVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: VehicleId) => {
      const res = await vehiclesApi.disableVehicle(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() });
    },
  });
}
