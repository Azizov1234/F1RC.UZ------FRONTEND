import { ApiClient } from './api';
import { buildQueryString } from './query';
import type {
  ApiResponse,
  PaginatedResponse,
  Stream,
  StreamStatus,
} from '../types';

export type PublicStreamStatus = Exclude<StreamStatus, 'DISABLED'>;

export interface GetPublicStreamsParams {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: number;
  status?: PublicStreamStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'scheduledAt' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface GetStreamsParams extends Omit<GetPublicStreamsParams, 'status'> {
  isActive?: boolean;
  status?: StreamStatus;
}

export interface CreateStreamDto {
  eventId?: number;
  title: string;
  streamUrl: string;
  status?: StreamStatus;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  isActive?: boolean;
}

export type UpdateStreamDto = Partial<CreateStreamDto>;

export const streamsApi = {
  getPublicStreams(
    params?: GetPublicStreamsParams,
    options?: RequestInit,
  ): Promise<PaginatedResponse<Stream>> {
    return ApiClient.get(`/streams${buildQueryString(params)}`, options);
  },

  getAdminStreams(params?: GetStreamsParams): Promise<PaginatedResponse<Stream>> {
    return ApiClient.get(`/admin/streams${buildQueryString(params)}`);
  },

  createStream(data: CreateStreamDto): Promise<ApiResponse<Stream>> {
    return ApiClient.post('/admin/streams', data);
  },

  getAdminStreamById(id: number | string): Promise<ApiResponse<Stream>> {
    return ApiClient.get(`/admin/streams/${id}`);
  },

  updateStream(
    id: number | string,
    data: UpdateStreamDto,
  ): Promise<ApiResponse<Stream>> {
    return ApiClient.patch(`/admin/streams/${id}`, data);
  },

  updateStreamStatus(
    id: number | string,
    status: StreamStatus,
  ): Promise<ApiResponse<Stream>> {
    return ApiClient.patch(`/admin/streams/${id}/status`, { status });
  },

  // Compatibility for public viewer pages.
  getStreams(params?: GetPublicStreamsParams): Promise<PaginatedResponse<Stream>> {
    return this.getPublicStreams(params);
  },
};
