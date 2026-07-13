import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  vehicleMaintenancesApi,
  type CreateMaintenanceDto,
  type GetMaintenancesParams,
  type UpdateMaintenanceDto,
} from '../../api/vehicle-maintenances.api';
import { queryKeys } from './useQueryKeys';

type MaintenanceId = number | string;

function hasMaintenanceId(id: MaintenanceId | undefined): id is MaintenanceId {
  return id !== undefined && id !== '';
}

function requireMaintenanceId(id: MaintenanceId | undefined): MaintenanceId {
  if (!hasMaintenanceId(id)) {
    throw new Error('Maintenance ID is required');
  }
  return id;
}

export function useVehicleMaintenances(params?: GetMaintenancesParams) {
  return useQuery({
    queryKey: queryKeys.maintenances.list({ ...params }),
    queryFn: () => vehicleMaintenancesApi.getMaintenances(params),
    staleTime: 10_000,
  });
}

export function useVehicleMaintenance(id: MaintenanceId | undefined) {
  return useQuery({
    queryKey: queryKeys.maintenances.detail(id ?? ''),
    queryFn: async () => {
      const response = await vehicleMaintenancesApi.getMaintenanceById(requireMaintenanceId(id));
      return response.data;
    },
    enabled: hasMaintenanceId(id),
    staleTime: 10_000,
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMaintenanceDto) => {
      const response = await vehicleMaintenancesApi.createMaintenance(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenances.all() });
    }
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: MaintenanceId; data: UpdateMaintenanceDto }) => {
      const response = await vehicleMaintenancesApi.updateMaintenance(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenances.all() });
    }
  });
}
