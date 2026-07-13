import { ApiClient } from './api';
import { buildQueryString } from './query';
import type {
  ApiResponse,
  ArenaZone,
  ArenaZoneType,
  PaginatedResponse,
} from '../types';

export interface GetArenaZonesParams {
  page?: number;
  limit?: number;
  search?: string;
  arenaId?: number;
  trackLayoutId?: number;
  zoneType?: ArenaZoneType;
  isActive?: boolean;
  sortBy?: 'id' | 'name' | 'zoneType' | 'sortOrder' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateArenaZoneDto {
  arenaId: number;
  trackLayoutId?: number | null;
  name: string;
  description?: string;
  zoneType: ArenaZoneType;
  imageUrl?: File;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateArenaZoneDto = Partial<CreateArenaZoneDto>;

export const arenaZonesApi = {
  getAdminArenaZones(
    params?: GetArenaZonesParams,
  ): Promise<PaginatedResponse<ArenaZone>> {
    return ApiClient.get(`/admin/arena-zones${buildQueryString(params)}`);
  },

  createArenaZone(data: FormData): Promise<ApiResponse<ArenaZone>> {
    return ApiClient.post('/admin/arena-zones', data);
  },

  getAdminArenaZoneById(id: number | string): Promise<ApiResponse<ArenaZone>> {
    return ApiClient.get(`/admin/arena-zones/${id}`);
  },

  updateArenaZone(id: number | string, data: FormData): Promise<ApiResponse<ArenaZone>> {
    return ApiClient.patch(`/admin/arena-zones/${id}`, data);
  },

  toggleArenaZone(
    id: number | string,
    isActive: boolean,
  ): Promise<ApiResponse<ArenaZone>> {
    return ApiClient.patch(`/admin/arena-zones/${id}/active-or-disactive`, { isActive });
  },
};
