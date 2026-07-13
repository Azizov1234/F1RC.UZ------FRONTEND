import { ApiClient } from './api';
import { appendFormField } from './query';
import type { ApiResponse, ExperienceLevel, Profile } from '../types';

export interface UpdateProfileDto {
  nickname?: string;
  bio?: string;
  experienceLevel?: ExperienceLevel;
  avatarUrl?: File;
}

function profileFormData(data: UpdateProfileDto): FormData {
  const formData = new FormData();
  appendFormField(formData, 'nickname', data.nickname);
  appendFormField(formData, 'bio', data.bio);
  appendFormField(formData, 'experienceLevel', data.experienceLevel);
  appendFormField(formData, 'avatarUrl', data.avatarUrl);
  return formData;
}

export const profilesApi = {
  getMyProfile(): Promise<ApiResponse<Profile>> {
    return ApiClient.get('/profiles/me');
  },

  updateMyProfile(data: UpdateProfileDto | FormData): Promise<ApiResponse<Profile>> {
    return ApiClient.patch(
      '/profiles/me',
      data instanceof FormData ? data : profileFormData(data),
    );
  },

  getProfileByUserId(userId: number | string): Promise<ApiResponse<Profile>> {
    return ApiClient.get(`/profiles/one/${userId}`);
  },
};
