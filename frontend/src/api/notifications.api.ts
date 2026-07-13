import { ApiClient } from './api';
import { buildQueryString } from './query';
import type {
  ApiResponse,
  Notification,
  NotificationStatus,
  NotificationType,
  PaginatedResponse,
} from '../types';

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: number;
  type?: NotificationType;
  status?: NotificationStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'status' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export type GetAdminNotificationsParams = GetNotificationsParams;

export interface CreateNotificationDto {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  status?: NotificationStatus;
}

export interface UpdateNotificationDto {
  type?: NotificationType;
  title?: string;
  message?: string;
  data?: Record<string, unknown>;
  status?: NotificationStatus;
}

export const notificationsApi = {
  getMyNotifications(
    params?: GetNotificationsParams,
  ): Promise<PaginatedResponse<Notification>> {
    return ApiClient.get(`/me/notifications${buildQueryString(params)}`);
  },

  markAsRead(id: number | string): Promise<ApiResponse<Notification>> {
    return ApiClient.patch(`/me/notifications/${id}/read`);
  },

  getAdminNotifications(
    params?: GetAdminNotificationsParams,
  ): Promise<PaginatedResponse<Notification>> {
    return ApiClient.get(`/admin/notifications${buildQueryString(params)}`);
  },

  createAdminNotification(
    data: CreateNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    return ApiClient.post('/admin/notifications', data);
  },

  getAdminNotificationById(id: number | string): Promise<ApiResponse<Notification>> {
    return ApiClient.get(`/admin/notifications/${id}`);
  },

  updateAdminNotification(
    id: number | string,
    data: UpdateNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    return ApiClient.patch(`/admin/notifications/${id}`, data);
  },

  updateNotificationStatus(
    id: number | string,
    status: NotificationStatus,
  ): Promise<ApiResponse<Notification>> {
    return ApiClient.patch(`/admin/notifications/${id}/status`, { status });
  },
};
