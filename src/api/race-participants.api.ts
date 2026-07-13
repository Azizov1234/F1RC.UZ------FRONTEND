import { ApiClient } from './api';
import { buildQueryString } from './query';
import type {
  ApiResponse,
  PaginatedResponse,
  RaceParticipant,
  RaceParticipantStatus,
} from '../types';

export interface GetRaceParticipantsParams {
  page?: number;
  limit?: number;
  search?: string;
  raceSessionId?: number;
  userId?: number;
  status?: RaceParticipantStatus;
  sortBy?: 'createdAt' | 'startPosition' | 'finishPosition' | 'totalTimeMs';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateRaceParticipantDto {
  raceSessionId: number;
  userId: number;
  vehicleId?: number;
  bookingId?: number;
  status?: RaceParticipantStatus;
  startPosition?: number;
}

export interface UpdateRaceParticipantDto {
  vehicleId?: number;
  status?: RaceParticipantStatus;
  startPosition?: number;
}

export const raceParticipantsApi = {
  getRaceParticipants(
    params?: GetRaceParticipantsParams,
  ): Promise<PaginatedResponse<RaceParticipant>> {
    return ApiClient.get(`/admin/race-participants${buildQueryString(params)}`);
  },

  createRaceParticipant(
    data: CreateRaceParticipantDto,
  ): Promise<ApiResponse<RaceParticipant>> {
    return ApiClient.post('/admin/race-participants', data);
  },

  getRaceParticipantById(id: number | string): Promise<ApiResponse<RaceParticipant>> {
    return ApiClient.get(`/admin/race-participants/${id}`);
  },

  updateRaceParticipant(
    id: number | string,
    data: UpdateRaceParticipantDto,
  ): Promise<ApiResponse<RaceParticipant>> {
    return ApiClient.patch(`/admin/race-participants/${id}`, data);
  },
};
