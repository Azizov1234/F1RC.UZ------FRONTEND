import { ApiClient } from './api';
import { appendFormField, buildQueryString } from './query';
import type { ApiResponse, Arena, PaginatedResponse } from '../types';

export interface GetPublicArenasParams {
  page?: number;
  limit?: number;
}

export interface GetAdminArenasParams extends GetPublicArenasParams {
  search?: string;
  city?: string;
  isActive?: boolean;
  sortBy?: 'id' | 'name' | 'city' | 'sortOrder' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateArenaDto {
  name: string;
  slug?: string;
  address?: string;
  city?: string;
  description?: string;
  coverImageUrl?: File;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateArenaDto = Partial<CreateArenaDto>;

function arenaFormData(data: CreateArenaDto | UpdateArenaDto): FormData {
  const formData = new FormData();
  appendFormField(formData, 'name', data.name);
  appendFormField(formData, 'slug', data.slug);
  appendFormField(formData, 'address', data.address);
  appendFormField(formData, 'city', data.city);
  appendFormField(formData, 'description', data.description);
  appendFormField(formData, 'coverImageUrl', data.coverImageUrl);
  appendFormField(formData, 'isActive', data.isActive);
  appendFormField(formData, 'sortOrder', data.sortOrder);
  return formData;
}

export const arenasApi = {
  getPublicArenas(
    params?: GetPublicArenasParams,
  ): Promise<PaginatedResponse<Arena>> {
    return ApiClient.get(`/arenas${buildQueryString(params)}`);
  },

  getPublicArenaById(id: number | string): Promise<ApiResponse<Arena>> {
    return ApiClient.get(`/arenas/${id}`);
  },

  getAdminArenas(
    params?: GetAdminArenasParams,
  ): Promise<PaginatedResponse<Arena>> {
    return ApiClient.get(`/admin/arenas${buildQueryString(params)}`);
  },

  getAdminArenaById(id: number | string): Promise<ApiResponse<Arena>> {
    return ApiClient.get(`/admin/arenas/${id}`);
  },

  createArena(data: CreateArenaDto | FormData): Promise<ApiResponse<Arena>> {
    return ApiClient.post(
      '/admin/arenas',
      data instanceof FormData ? data : arenaFormData(data),
    );
  },

  updateArena(
    id: number | string,
    data: UpdateArenaDto | FormData,
  ): Promise<ApiResponse<Arena>> {
    return ApiClient.patch(
      `/admin/arenas/${id}`,
      data instanceof FormData ? data : arenaFormData(data),
    );
  },

  activeOrDisactiveArena(
    id: number | string,
    isActive: boolean,
  ): Promise<ApiResponse<Arena>> {
    return ApiClient.patch(`/admin/arenas/${id}/active-or-disactive`, { isActive });
  },

  // Compatibility for the existing admin arena hook.
  getArenas(params?: GetAdminArenasParams): Promise<PaginatedResponse<Arena>> {
    return this.getAdminArenas(params);
  },

  getArenaById(id: number | string): Promise<ApiResponse<Arena>> {
    return this.getAdminArenaById(id);
  },
};
