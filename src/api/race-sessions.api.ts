import { ApiClient } from './api';
import { buildQueryString } from './query';
import type {
  ApiResponse,
  PaginatedResponse,
  RaceSession,
  RaceSessionStatus,
} from '../types';

export interface GetRaceSessionsParams {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: number;
  status?: RaceSessionStatus;
  sortBy?: 'createdAt' | 'scheduledAt' | 'startedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateRaceSessionDto {
  eventId: number;
  name?: string;
  scheduledAt?: string;
}

export interface UpdateRaceSessionDto {
  name?: string;
  scheduledAt?: string;
}

export const raceSessionsApi = {
  getRaceSessions(
    params?: GetRaceSessionsParams,
  ): Promise<PaginatedResponse<RaceSession>> {
    return ApiClient.get(`/admin/race-sessions${buildQueryString(params)}`);
  },

  createRaceSession(data: CreateRaceSessionDto): Promise<ApiResponse<RaceSession>> {
    return ApiClient.post('/admin/race-sessions', data);
  },

  getRaceSessionById(id: number | string): Promise<ApiResponse<RaceSession>> {
    return ApiClient.get(`/admin/race-sessions/${id}`);
  },

  updateRaceSession(
    id: number | string,
    data: UpdateRaceSessionDto,
  ): Promise<ApiResponse<RaceSession>> {
    return ApiClient.patch(`/admin/race-sessions/${id}`, data);
  },

  updateRaceSessionStatus(
    id: number | string,
    status: RaceSessionStatus,
  ): Promise<ApiResponse<RaceSession>> {
    return ApiClient.patch(`/admin/race-sessions/${id}/status`, { status });
  },

  startSession(id: number | string): Promise<ApiResponse<RaceSession>> {
    return ApiClient.post(`/operator/race-sessions/${id}/start`);
  },

  finishSession(id: number | string): Promise<ApiResponse<RaceSession>> {
    return ApiClient.post(`/operator/race-sessions/${id}/finish`);
  },
};
