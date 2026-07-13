import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  notificationsApi,
  type CreateNotificationDto,
  type GetAdminNotificationsParams,
  type GetNotificationsParams,
  type UpdateNotificationDto,
} from '../../api/notifications.api';
import type { NotificationStatus } from '../../types';
import { queryKeys } from './useQueryKeys';

type NotificationId = number | string;

function hasNotificationId(id: NotificationId | undefined): id is NotificationId {
  return id !== undefined && id !== '';
}

function requireNotificationId(id: NotificationId | undefined): NotificationId {
  if (!hasNotificationId(id)) {
    throw new Error('Notification ID is required');
  }
  return id;
}

export function useMyNotifications(params?: GetNotificationsParams) {
  return useQuery({
    queryKey: queryKeys.notifications.mine({ ...params }),
    queryFn: () => notificationsApi.getMyNotifications(params),
    staleTime: 10_000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: NotificationId) => {
      const response = await notificationsApi.markAsRead(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
}

export function useAdminNotifications(params?: GetAdminNotificationsParams) {
  return useQuery({
    queryKey: queryKeys.notifications.admin({ ...params }),
    queryFn: () => notificationsApi.getAdminNotifications(params),
    staleTime: 10_000,
  });
}

export function useAdminNotification(id: NotificationId | undefined) {
  return useQuery({
    queryKey: queryKeys.notifications.detail(id ?? ''),
    queryFn: async () => {
      const response = await notificationsApi.getAdminNotificationById(requireNotificationId(id));
      return response.data;
    },
    enabled: hasNotificationId(id),
    staleTime: 10_000,
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateNotificationDto) => {
      const response = await notificationsApi.createAdminNotification(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
}

export const useCreateAdminNotification = useCreateNotification;

export function useUpdateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: NotificationId; data: UpdateNotificationDto }) => {
      const response = await notificationsApi.updateAdminNotification(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
}

export const useUpdateAdminNotification = useUpdateNotification;

export function useUpdateNotificationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: NotificationId; status: NotificationStatus }) => {
      const response = await notificationsApi.updateNotificationStatus(id, status);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
}
