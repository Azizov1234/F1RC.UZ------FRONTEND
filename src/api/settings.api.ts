import { ApiClient } from './api';
import { buildQueryString } from './query';
import type {
  ApiResponse,
  PaginatedResponse,
  Setting,
  SettingValue,
  SettingValueType,
} from '../types';

export interface GetPublicSettingsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: 'asc' | 'desc';
  valueType?: SettingValueType;
}

export interface GetSettingsParams extends GetPublicSettingsParams {
  isPublic?: boolean;
  isActive?: boolean;
  sortBy?: 'id' | 'key' | 'valueType' | 'createdAt' | 'updatedAt';
}

export interface CreateSettingDto {
  key: string;
  value: SettingValue;
  valueType: SettingValueType;
  description?: string;
  isPublic?: boolean;
  isActive?: boolean;
}

export type UpdateSettingDto = Partial<CreateSettingDto>;

export const settingsApi = {
  getPublicSettings(
    params?: GetPublicSettingsParams,
  ): Promise<PaginatedResponse<Setting>> {
    return ApiClient.get(`/settings${buildQueryString(params)}`);
  },

  getAdminSettings(params?: GetSettingsParams): Promise<PaginatedResponse<Setting>> {
    return ApiClient.get(`/admin/settings${buildQueryString(params)}`);
  },

  createSetting(data: CreateSettingDto): Promise<ApiResponse<Setting>> {
    return ApiClient.post('/admin/settings', data);
  },

  getSettingById(id: number | string): Promise<ApiResponse<Setting>> {
    return ApiClient.get(`/admin/settings/${id}`);
  },

  updateSetting(
    id: number | string,
    data: UpdateSettingDto,
  ): Promise<ApiResponse<Setting>> {
    return ApiClient.patch(`/admin/settings/${id}`, data);
  },

  deleteSetting(id: number | string): Promise<ApiResponse<Setting>> {
    return ApiClient.delete(`/admin/settings/${id}`);
  },

  toggleSetting(id: number | string, isActive: boolean): Promise<ApiResponse<Setting>> {
    return ApiClient.patch(`/admin/settings/${id}/active-or-disactive`, { isActive });
  },
};
