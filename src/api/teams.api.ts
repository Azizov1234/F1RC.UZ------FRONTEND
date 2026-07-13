import { ApiClient } from './api';
import { appendFormField, buildQueryString } from './query';
import type { ApiResponse, PaginatedResponse, Team, TeamMember } from '../types';

export interface GetTeamsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  managerId?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTeamDto {
  managerId: number;
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: File;
  isActive?: boolean;
}

export type UpdateTeamDto = Partial<CreateTeamDto>;

function teamFormData(data: CreateTeamDto | UpdateTeamDto): FormData {
  const formData = new FormData();
  appendFormField(formData, 'managerId', data.managerId);
  appendFormField(formData, 'name', data.name);
  appendFormField(formData, 'slug', data.slug);
  appendFormField(formData, 'description', data.description);
  appendFormField(formData, 'logoUrl', data.logoUrl);
  appendFormField(formData, 'isActive', data.isActive);
  return formData;
}

export const teamsApi = {
  getAdminTeams(params?: GetTeamsParams): Promise<PaginatedResponse<Team>> {
    return ApiClient.get(`/admin/teams${buildQueryString(params)}`);
  },

  createTeam(data: CreateTeamDto | FormData): Promise<ApiResponse<Team>> {
    return ApiClient.post(
      '/admin/teams',
      data instanceof FormData ? data : teamFormData(data),
    );
  },

  getAdminTeamById(id: number | string): Promise<ApiResponse<Team>> {
    return ApiClient.get(`/admin/teams/${id}`);
  },

  updateAdminTeam(
    id: number | string,
    data: UpdateTeamDto | FormData,
  ): Promise<ApiResponse<Team>> {
    return ApiClient.patch(
      `/admin/teams/${id}`,
      data instanceof FormData ? data : teamFormData(data),
    );
  },

  toggleTeam(id: number | string, isActive: boolean): Promise<ApiResponse<Team>> {
    return ApiClient.patch(`/admin/teams/${id}/active-or-disactive`, { isActive });
  },

  getMyTeams(params?: GetTeamsParams): Promise<PaginatedResponse<Team>> {
    return ApiClient.get(`/teams${buildQueryString(params)}`);
  },

  getMyTeamById(id: number | string): Promise<ApiResponse<Team>> {
    return ApiClient.get(`/teams/${id}`);
  },

  updateMyTeam(
    id: number | string,
    data: UpdateTeamDto | FormData,
  ): Promise<ApiResponse<Team>> {
    return ApiClient.patch(
      `/teams/${id}`,
      data instanceof FormData ? data : teamFormData(data),
    );
  },

  addMember(
    teamId: number | string,
    userId: number,
  ): Promise<ApiResponse<TeamMember>> {
    return ApiClient.post(`/teams/${teamId}/members`, { userId });
  },

  removeMember(
    teamId: number | string,
    userId: number | string,
  ): Promise<ApiResponse<TeamMember>> {
    return ApiClient.patch(`/teams/${teamId}/members/${userId}/remove`);
  },
};
