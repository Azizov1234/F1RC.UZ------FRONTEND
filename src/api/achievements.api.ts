import { ApiClient } from './api';
import { appendFormField, buildQueryString } from './query';
import type {
  Achievement,
  AchievementType,
  ApiResponse,
  PaginatedResponse,
} from '../types';

export interface GetAchievementsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  type?: AchievementType;
  sortBy?: 'createdAt' | 'name' | 'points' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAchievementDto {
  code: string;
  name: string;
  description?: string;
  type: AchievementType;
  iconUrl?: File;
  criteria?: Record<string, unknown>;
  points?: number;
  isActive?: boolean;
}

export type UpdateAchievementDto = Partial<CreateAchievementDto>;

export interface AwardAchievementDto {
  userId: number;
  metadata?: Record<string, unknown>;
}

function achievementFormData(
  data: CreateAchievementDto | UpdateAchievementDto,
): FormData {
  const formData = new FormData();
  appendFormField(formData, 'code', data.code);
  appendFormField(formData, 'name', data.name);
  appendFormField(formData, 'description', data.description);
  appendFormField(formData, 'type', data.type);
  appendFormField(formData, 'iconUrl', data.iconUrl);
  if (data.criteria !== undefined) {
    formData.append('criteria', JSON.stringify(data.criteria));
  }
  appendFormField(formData, 'points', data.points);
  appendFormField(formData, 'isActive', data.isActive);
  return formData;
}

export const achievementsApi = {
  getPublicAchievements(
    params?: GetAchievementsParams,
  ): Promise<PaginatedResponse<Achievement>> {
    return ApiClient.get(`/achievements${buildQueryString(params)}`);
  },

  getAdminAchievements(
    params?: GetAchievementsParams,
  ): Promise<PaginatedResponse<Achievement>> {
    return ApiClient.get(`/admin/achievements${buildQueryString(params)}`);
  },

  createAchievement(
    data: CreateAchievementDto | FormData,
  ): Promise<ApiResponse<Achievement>> {
    return ApiClient.post(
      '/admin/achievements',
      data instanceof FormData ? data : achievementFormData(data),
    );
  },

  getAdminAchievementById(id: number | string): Promise<ApiResponse<Achievement>> {
    return ApiClient.get(`/admin/achievements/${id}`);
  },

  updateAchievement(
    id: number | string,
    data: UpdateAchievementDto | FormData,
  ): Promise<ApiResponse<Achievement>> {
    return ApiClient.patch(
      `/admin/achievements/${id}`,
      data instanceof FormData ? data : achievementFormData(data),
    );
  },

  toggleAchievement(
    id: number | string,
    isActive: boolean,
  ): Promise<ApiResponse<Achievement>> {
    return ApiClient.patch(`/admin/achievements/${id}/active-or-disactive`, {
      isActive,
    });
  },

  awardAchievement(
    achievementId: number | string,
    data: AwardAchievementDto,
  ): Promise<ApiResponse<Achievement>> {
    return ApiClient.post(`/admin/achievements/${achievementId}/award`, data);
  },

  getMyAchievements(
    params?: GetAchievementsParams,
  ): Promise<PaginatedResponse<Achievement>> {
    return ApiClient.get(`/me/achievements${buildQueryString(params)}`);
  },
};
