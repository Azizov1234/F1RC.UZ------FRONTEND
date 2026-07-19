import { ApiClient } from './api';
import { buildQueryString } from './query';
import {
  normalizePublicActive,
  normalizePublicDetail,
  normalizePublicPage,
  type PublicActiveWire,
  type PublicDetailEnvelope,
} from './public-response';
import type { ApiResponse, PaginatedResponse, Season } from '../types';

export interface GetPublicSeasonsParams {
  page?: number;
  limit?: number;
}

export interface GetAdminSeasonsParams extends GetPublicSeasonsParams {
  search?: string;
  isActive?: boolean;
  startsFrom?: string;
  endsTo?: string;
  sortBy?: 'id' | 'name' | 'startDate' | 'endDate' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateSeasonDto {
  name: string;
  slug?: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export type UpdateSeasonDto = Partial<CreateSeasonDto>;

type PublicSeasonWire = PublicActiveWire<Season>;

const normalizePublicSeason = (season: PublicSeasonWire): Season =>
  normalizePublicActive<Season>(season);

export const seasonsApi = {
  async getPublicSeasons(
    params?: GetPublicSeasonsParams,
    options?: RequestInit,
  ): Promise<PaginatedResponse<Season>> {
    const response = await ApiClient.get<PaginatedResponse<PublicSeasonWire>>(
      `/seasons${buildQueryString(params)}`,
      options,
    );
    return normalizePublicPage(response, normalizePublicSeason);
  },

  async getPublicSeasonById(
    id: number | string,
    options?: RequestInit,
  ): Promise<ApiResponse<Season>> {
    const response = await ApiClient.get<
      PublicDetailEnvelope<'season', PublicSeasonWire>
    >(`/seasons/${id}`, options);
    return normalizePublicDetail(response, 'season', normalizePublicSeason);
  },

  getAdminSeasons(
    params?: GetAdminSeasonsParams,
  ): Promise<PaginatedResponse<Season>> {
    return ApiClient.get(`/admin/seasons${buildQueryString(params)}`);
  },

  getAdminSeasonById(id: number | string): Promise<ApiResponse<Season>> {
    return ApiClient.get(`/admin/seasons/${id}`);
  },

  createSeason(data: CreateSeasonDto): Promise<ApiResponse<Season>> {
    return ApiClient.post('/admin/seasons', data);
  },

  updateSeason(
    id: number | string,
    data: UpdateSeasonDto,
  ): Promise<ApiResponse<Season>> {
    return ApiClient.patch(`/admin/seasons/${id}`, data);
  },

  toggleSeasonStatus(
    id: number | string,
    isActive: boolean,
  ): Promise<ApiResponse<Season>> {
    return ApiClient.patch(`/admin/seasons/${id}/active-or-disactive`, { isActive });
  },
};
