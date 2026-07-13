import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  scheduleSlotsApi,
  type GetScheduleSlotsParams,
  type CreateScheduleSlotDto,
  type UpdateScheduleSlotDto,
} from '../../api/schedule-slots.api';
import type { ScheduleSlotStatus } from '../../types';
import { queryKeys } from './useQueryKeys';

type ScheduleSlotId = number | string;

function hasScheduleSlotId(id: ScheduleSlotId | undefined): id is ScheduleSlotId {
  return id !== undefined && id !== '';
}

function requireScheduleSlotId(id: ScheduleSlotId | undefined): ScheduleSlotId {
  if (!hasScheduleSlotId(id)) {
    throw new Error('Schedule slot ID is required');
  }
  return id;
}

export function usePublicScheduleSlots(params?: GetScheduleSlotsParams) {
  return useQuery({
    queryKey: queryKeys.scheduleSlots.list({ ...params, scope: 'public' }),
    queryFn: () => scheduleSlotsApi.getPublicScheduleSlots(params),
    staleTime: 15_000,
  });
}

export const useScheduleSlots = usePublicScheduleSlots;

export function useAdminScheduleSlots(params?: GetScheduleSlotsParams) {
  return useQuery({
    queryKey: queryKeys.scheduleSlots.list({ ...params, scope: 'admin' }),
    queryFn: () => scheduleSlotsApi.getAdminScheduleSlots(params),
    staleTime: 10_000,
  });
}

export function useScheduleSlot(id: ScheduleSlotId | undefined) {
  return useQuery({
    queryKey: queryKeys.scheduleSlots.detail(id ?? ''),
    queryFn: async () => {
      const response = await scheduleSlotsApi.getAdminScheduleSlotById(requireScheduleSlotId(id));
      return response.data;
    },
    enabled: hasScheduleSlotId(id),
    staleTime: 10_000,
  });
}

export const useScheduleSlotDetail = useScheduleSlot;

export function useCreateScheduleSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateScheduleSlotDto) => {
      const response = await scheduleSlotsApi.createScheduleSlot(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleSlots.all() });
    },
  });
}

export function useUpdateScheduleSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: ScheduleSlotId; data: UpdateScheduleSlotDto }) => {
      const response = await scheduleSlotsApi.updateScheduleSlot(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleSlots.all() });
    },
  });
}

export function useUpdateScheduleSlotStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: ScheduleSlotId; status: ScheduleSlotStatus }) => {
      const response = await scheduleSlotsApi.updateScheduleSlotStatus(id, status);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleSlots.all() });
    },
  });
}

export function useToggleScheduleSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: ScheduleSlotId; isActive: boolean }) => {
      const response = await scheduleSlotsApi.toggleScheduleSlot(id, isActive);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleSlots.all() });
    },
  });
}
