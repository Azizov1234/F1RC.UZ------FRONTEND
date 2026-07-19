import { ApiClient } from './api';
import { appendFormField, buildQueryString } from './query';
import {
  normalizePublicActive,
  normalizePublicDetail,
  normalizePublicPage,
  type PublicActiveWire,
  type PublicDetailEnvelope,
} from './public-response';
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

type PublicArenaWire = PublicActiveWire<Arena>;

function normalizePublicArena(arena: PublicArenaWire): Arena {
  const normalized = normalizePublicActive<Arena>(arena);
  const zones = normalized.zones ?? normalized.arenaZones;
  return {
    ...normalized,
    zones,
    arenaZones: zones,
  };
}

export const arenasApi = {
  async getPublicArenas(
    params?: GetPublicArenasParams,
    options?: RequestInit,
  ): Promise<PaginatedResponse<Arena>> {
    const response = await ApiClient.get<PaginatedResponse<PublicArenaWire>>(
      `/arenas${buildQueryString(params)}`,
      options,
    );
    return normalizePublicPage(response, normalizePublicArena);
  },

  async getPublicArenaById(
    id: number | string,
    options?: RequestInit,
  ): Promise<ApiResponse<Arena>> {
    const response = await ApiClient.get<
      PublicDetailEnvelope<'arena', PublicArenaWire>
    >(`/arenas/${id}`, options);
    return normalizePublicDetail(response, 'arena', normalizePublicArena);
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
