import { ApiClient } from './api';
import { buildQueryString } from './query';
import type {
  ApiResponse,
  PaginatedResponse,
  ScheduleSlot,
  ScheduleSlotStatus,
} from '../types';

export interface GetScheduleSlotsParams {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: number;
  status?: ScheduleSlotStatus;
  isActive?: boolean;
  sortBy?: 'startsAt' | 'createdAt' | 'capacity' | 'bookedCount';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateScheduleSlotDto {
  eventId: number;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status?: ScheduleSlotStatus;
  isActive?: boolean;
}

export type UpdateScheduleSlotDto = Partial<CreateScheduleSlotDto>;

export const scheduleSlotsApi = {
  getPublicScheduleSlots(
    params?: GetScheduleSlotsParams,
  ): Promise<PaginatedResponse<ScheduleSlot>> {
    return ApiClient.get(`/schedule-slots${buildQueryString(params)}`);
  },

  getAdminScheduleSlots(
    params?: GetScheduleSlotsParams,
  ): Promise<PaginatedResponse<ScheduleSlot>> {
    return ApiClient.get(`/admin/schedule-slots${buildQueryString(params)}`);
  },

  createScheduleSlot(data: CreateScheduleSlotDto): Promise<ApiResponse<ScheduleSlot>> {
    return ApiClient.post('/admin/schedule-slots', data);
  },

  getAdminScheduleSlotById(id: number | string): Promise<ApiResponse<ScheduleSlot>> {
    return ApiClient.get(`/admin/schedule-slots/${id}`);
  },

  updateScheduleSlot(
    id: number | string,
    data: UpdateScheduleSlotDto,
  ): Promise<ApiResponse<ScheduleSlot>> {
    return ApiClient.patch(`/admin/schedule-slots/${id}`, data);
  },

  updateScheduleSlotStatus(
    id: number | string,
    status: ScheduleSlotStatus,
  ): Promise<ApiResponse<ScheduleSlot>> {
    return ApiClient.patch(`/admin/schedule-slots/${id}/status`, { status });
  },

  toggleScheduleSlot(
    id: number | string,
    isActive: boolean,
  ): Promise<ApiResponse<ScheduleSlot>> {
    return ApiClient.patch(`/admin/schedule-slots/${id}/active-or-disactive`, { isActive });
  },
};
