import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bookingsApi,
  type CreateBookingDto,
  type GetBookingsParams,
  type UpdateBookingDto,
} from '../../api/bookings.api';
import { queryKeys } from './useQueryKeys';

type BookingId = number | string;

function hasId(id: BookingId | undefined): id is BookingId {
  return id !== undefined && id !== '';
}

function requireId(id: BookingId | undefined): BookingId {
  if (!hasId(id)) throw new Error('Booking ID is required');
  return id;
}

function invalidateBookings(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.scheduleSlots.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.payments.all() });
}

export function useAdminBookings(params?: GetBookingsParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.bookings.list({ ...params, scope: 'admin' }),
    queryFn: () => bookingsApi.getAdminBookings(params),
    enabled,
    staleTime: 10_000,
  });
}

export const useBookings = useAdminBookings;

export function useAdminBooking(id: BookingId | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(`admin:${id ?? ''}`),
    queryFn: async () => (await bookingsApi.getAdminBookingById(requireId(id))).data,
    enabled: enabled && hasId(id),
    staleTime: 10_000,
  });
}

export function useCreateAdminBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBookingDto) =>
      (await bookingsApi.createAdminBooking(data)).data,
    onSuccess: () => invalidateBookings(queryClient),
  });
}

export function useUpdateAdminBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: BookingId; data: UpdateBookingDto }) =>
      (await bookingsApi.updateAdminBooking(id, data)).data,
    onSuccess: () => invalidateBookings(queryClient),
  });
}

export function useBookEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      data,
    }: {
      eventId: BookingId;
      data: CreateBookingDto;
    }) => (await bookingsApi.bookEvent(eventId, data)).data,
    onSuccess: () => invalidateBookings(queryClient),
  });
}

export function useMyBookings(params?: GetBookingsParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.bookings.mine({ ...params }),
    queryFn: () => bookingsApi.getMyBookings(params),
    enabled,
    staleTime: 10_000,
  });
}

export function useCancelMyBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: BookingId) => (await bookingsApi.cancelMyBooking(id)).data,
    onSuccess: () => invalidateBookings(queryClient),
  });
}

export function useCheckInBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: BookingId) => (await bookingsApi.checkIn(id)).data,
    onSuccess: () => invalidateBookings(queryClient),
  });
}
