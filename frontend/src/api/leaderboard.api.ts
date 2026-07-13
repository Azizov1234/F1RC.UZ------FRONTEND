import { ApiClient } from './api';
import { buildQueryString } from './query';
import type { ApiResponse, LeaderboardEntry, PaginatedResponse } from '../types';

export interface GetLeaderboardParams {
  seasonId: number;
  categoryId: number;
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetAdminLeaderboardParams {
  page?: number;
  limit?: number;
  search?: string;
  seasonId?: number;
  categoryId?: number;
  userId?: number;
  sortBy?: 'totalPoints' | 'winsCount' | 'bestLapMs' | 'racesCount' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateLeaderboardEntryDto {
  seasonId: number;
  categoryId: number;
  userId: number;
  totalPoints?: number;
  racesCount?: number;
  winsCount?: number;
  podiumsCount?: number;
  bestLapMs?: number;
}

export type UpdateLeaderboardEntryDto = Partial<CreateLeaderboardEntryDto>;

export const leaderboardApi = {
  getLeaderboard(
    params: GetLeaderboardParams,
  ): Promise<PaginatedResponse<LeaderboardEntry>> {
    return ApiClient.get(`/leaderboard${buildQueryString(params)}`);
  },

  getAdminLeaderboard(
    params?: GetAdminLeaderboardParams,
  ): Promise<PaginatedResponse<LeaderboardEntry>> {
    return ApiClient.get(`/admin/leaderboard${buildQueryString(params)}`);
  },

  createLeaderboardEntry(
    data: CreateLeaderboardEntryDto,
  ): Promise<ApiResponse<LeaderboardEntry>> {
    return ApiClient.post('/admin/leaderboard', data);
  },

  getAdminLeaderboardById(id: number | string): Promise<ApiResponse<LeaderboardEntry>> {
    return ApiClient.get(`/admin/leaderboard/${id}`);
  },

  updateLeaderboardEntry(
    id: number | string,
    data: UpdateLeaderboardEntryDto,
  ): Promise<ApiResponse<LeaderboardEntry>> {
    return ApiClient.patch(`/admin/leaderboard/${id}`, data);
  },
};
