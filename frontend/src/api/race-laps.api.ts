import { ApiClient } from './api';
import { buildQueryString } from './query';
import type { ApiResponse, PaginatedResponse, RaceLap } from '../types';

export interface GetRaceLapsParams {
  page?: number;
  limit?: number;
  search?: string;
  raceSessionId?: number;
  participantId?: number;
  isValid?: boolean;
  sortBy?: 'createdAt' | 'lapNumber' | 'lapTimeMs';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateRaceLapDto {
  participantId: number;
  lapTimeMs: number;
  penaltyMs?: number;
  isValid?: boolean;
}

export interface UpdateRaceLapDto {
  lapTimeMs?: number;
  penaltyMs?: number;
  isValid?: boolean;
}

export const raceLapsApi = {
  getRaceLaps(params?: GetRaceLapsParams): Promise<PaginatedResponse<RaceLap>> {
    return ApiClient.get(`/admin/race-laps${buildQueryString(params)}`);
  },

  getRaceLapById(id: number | string): Promise<ApiResponse<RaceLap>> {
    return ApiClient.get(`/admin/race-laps/${id}`);
  },

  updateRaceLap(
    id: number | string,
    data: UpdateRaceLapDto,
  ): Promise<ApiResponse<RaceLap>> {
    return ApiClient.patch(`/admin/race-laps/${id}`, data);
  },

  createRaceLap(
    sessionId: number | string,
    data: CreateRaceLapDto,
  ): Promise<ApiResponse<RaceLap>> {
    return ApiClient.post(`/operator/race-sessions/${sessionId}/laps`, data);
  },
};
