import { ApiClient } from './api';
import { buildQueryString } from './query';
import type {
  ApiResponse,
  PaginatedResponse,
  TrackDifficulty,
  TrackLayout,
} from '../types';

export interface GetPublicTrackLayoutsParams {
  page?: number;
  limit?: number;
  arenaId?: number;
  categoryId?: number;
  difficulty?: TrackDifficulty;
}

export interface GetTrackLayoutsParams extends GetPublicTrackLayoutsParams {
  search?: string;
  isActive?: boolean;
  sortBy?: 'id' | 'name' | 'lengthMeters' | 'sortOrder' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTrackLayoutDto {
  arenaId: number;
  categoryId?: number;
  name: string;
  slug?: string;
  description?: string;
  lengthMeters?: number;
  difficulty?: TrackDifficulty;
  imageUrl?: File;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateTrackLayoutDto = Partial<CreateTrackLayoutDto>;

export const trackLayoutsApi = {
  getPublicTrackLayouts(
    params?: GetPublicTrackLayoutsParams,
  ): Promise<PaginatedResponse<TrackLayout>> {
    return ApiClient.get(`/track-layouts${buildQueryString(params)}`);
  },

  getPublicTrackLayoutById(id: number | string): Promise<ApiResponse<TrackLayout>> {
    return ApiClient.get(`/track-layouts/${id}`);
  },

  getAdminTrackLayouts(
    params?: GetTrackLayoutsParams,
  ): Promise<PaginatedResponse<TrackLayout>> {
    return ApiClient.get(`/admin/track-layouts${buildQueryString(params)}`);
  },

  createTrackLayout(data: FormData): Promise<ApiResponse<TrackLayout>> {
    return ApiClient.post('/admin/track-layouts', data);
  },

  getAdminTrackLayoutById(id: number | string): Promise<ApiResponse<TrackLayout>> {
    return ApiClient.get(`/admin/track-layouts/${id}`);
  },

  updateTrackLayout(id: number | string, data: FormData): Promise<ApiResponse<TrackLayout>> {
    return ApiClient.patch(`/admin/track-layouts/${id}`, data);
  },

  toggleTrackLayout(
    id: number | string,
    isActive: boolean,
  ): Promise<ApiResponse<TrackLayout>> {
    return ApiClient.patch(`/admin/track-layouts/${id}/active-or-disactive`, { isActive });
  },
};
