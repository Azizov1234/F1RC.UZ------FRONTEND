import { ApiClient } from './api';
import { buildQueryString } from './query';
import type { ApiResponse, PaginatedResponse, RaceResult } from '../types';

export interface GetRaceResultsParams {
  page?: number;
  limit?: number;
  search?: string;
  raceSessionId?: number;
  userId?: number;
  sortBy?: 'createdAt' | 'position' | 'points' | 'totalTimeMs';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateRaceResultDto {
  raceSessionId: number;
  participantId: number;
  userId: number;
  position?: number;
  points?: number;
  isWinner?: boolean;
}

export interface UpdateRaceResultDto {
  position?: number;
  points?: number;
  isWinner?: boolean;
}

export const raceResultsApi = {
  getRaceResults(
    params?: GetRaceResultsParams,
  ): Promise<PaginatedResponse<RaceResult>> {
    return ApiClient.get(`/admin/race-results${buildQueryString(params)}`);
  },

  createRaceResult(data: CreateRaceResultDto): Promise<ApiResponse<RaceResult>> {
    return ApiClient.post('/admin/race-results', data);
  },

  getRaceResultById(id: number | string): Promise<ApiResponse<RaceResult>> {
    return ApiClient.get(`/admin/race-results/${id}`);
  },

  updateRaceResult(
    id: number | string,
    data: UpdateRaceResultDto,
  ): Promise<ApiResponse<RaceResult>> {
    return ApiClient.patch(`/admin/race-results/${id}`, data);
  },
};
