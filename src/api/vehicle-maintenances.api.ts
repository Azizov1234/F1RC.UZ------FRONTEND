import { ApiClient } from './api';
import { buildQueryString } from './query';
import type {
  ApiResponse,
  PaginatedResponse,
  VehicleMaintenance,
  VehicleMaintenanceStatus,
} from '../types';

export interface GetMaintenancesParams {
  page?: number;
  limit?: number;
  vehicleId?: number;
  status?: VehicleMaintenanceStatus;
  search?: string;
  sortBy?: 'id' | 'startedAt' | 'resolvedAt' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMaintenanceDto {
  vehicleId: number;
  title: string;
  reason?: string;
  notes?: string;
}

export interface UpdateMaintenanceDto {
  title?: string;
  reason?: string;
  notes?: string;
  status?: VehicleMaintenanceStatus;
}

export const vehicleMaintenancesApi = {
  getMaintenances(
    params?: GetMaintenancesParams,
  ): Promise<PaginatedResponse<VehicleMaintenance>> {
    return ApiClient.get(
      `/admin/vehicle-maintenances/all${buildQueryString(params)}`,
    );
  },

  getMaintenanceById(id: number | string): Promise<ApiResponse<VehicleMaintenance>> {
    return ApiClient.get(`/admin/vehicle-maintenances/one/${id}`);
  },

  createMaintenance(data: CreateMaintenanceDto): Promise<ApiResponse<VehicleMaintenance>> {
    return ApiClient.post('/admin/vehicle-maintenances/create', data);
  },

  updateMaintenance(
    id: number | string,
    data: UpdateMaintenanceDto,
  ): Promise<ApiResponse<VehicleMaintenance>> {
    return ApiClient.patch(`/admin/vehicle-maintenances/update/${id}`, data);
  },
};
