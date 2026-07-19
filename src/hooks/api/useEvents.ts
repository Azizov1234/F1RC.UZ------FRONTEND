import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  eventsApi,
  type CreateEventDto,
  type GetEventsParams,
  type GetPublicEventsParams,
  type UpdateEventDto,
} from '../../api/events.api';
import type { EventStatus } from '../../types';
import { queryKeys } from './useQueryKeys';

type EventId = number | string;

function hasId(id: EventId | undefined): id is EventId {
  return id !== undefined && id !== '';
}

function requireId(id: EventId | undefined): EventId {
  if (!hasId(id)) throw new Error('Event ID is required');
  return id;
}

function invalidateEvents(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.events.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.scheduleSlots.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.raceSessions.all() });
}

export function usePublicEvents(params?: GetPublicEventsParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.events.list({ ...params, scope: 'public' }),
    queryFn: ({ signal }) => eventsApi.getPublicEvents(params, { signal }),
    enabled,
    staleTime: 30_000,
  });
}

export const useEvents = usePublicEvents;

export function usePublicEvent(id: EventId | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.events.detail(`public:${id ?? ''}`),
    queryFn: async ({ signal }) =>
      (await eventsApi.getPublicEventById(requireId(id), { signal })).data,
    enabled: enabled && hasId(id),
    staleTime: 30_000,
  });
}

export function useAdminEvents(params?: GetEventsParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.events.list({ ...params, scope: 'admin' }),
    queryFn: () => eventsApi.getAdminEvents(params),
    enabled,
    staleTime: 15_000,
  });
}

export function useAdminEvent(id: EventId | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.events.detail(`admin:${id ?? ''}`),
    queryFn: async () => (await eventsApi.getAdminEventById(requireId(id))).data,
    enabled: enabled && hasId(id),
    staleTime: 15_000,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEventDto | FormData) =>
      (await eventsApi.createEvent(data)).data,
    onSuccess: () => invalidateEvents(queryClient),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: EventId;
      data: UpdateEventDto | FormData;
    }) => (await eventsApi.updateEvent(id, data)).data,
    onSuccess: () => invalidateEvents(queryClient),
  });
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: EventId; status: EventStatus }) =>
      (await eventsApi.updateEventStatus(id, status)).data,
    onSuccess: () => invalidateEvents(queryClient),
  });
}
