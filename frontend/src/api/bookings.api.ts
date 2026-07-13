import { ApiClient } from './api';
import { buildQueryString } from './query';
import type { ApiResponse, Booking, BookingStatus, PaginatedResponse } from '../types';

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: number;
  eventId?: number;
  scheduleSlotId?: number;
  status?: BookingStatus;
  sortBy?: 'createdAt' | 'bookedAt' | 'status' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateBookingDto {
  eventId?: number;
  userId?: number;
  scheduleSlotId: number;
  vehicleId?: number;
  notes?: string;
}

export interface UpdateBookingDto {
  notes?: string;
  status?: BookingStatus;
}

export const bookingsApi = {
  getAdminBookings(
    params?: GetBookingsParams,
  ): Promise<PaginatedResponse<Booking>> {
    return ApiClient.get(`/admin/bookings${buildQueryString(params)}`);
  },

  createAdminBooking(data: CreateBookingDto): Promise<ApiResponse<Booking>> {
    return ApiClient.post('/admin/bookings', data);
  },

  getAdminBookingById(id: number | string): Promise<ApiResponse<Booking>> {
    return ApiClient.get(`/admin/bookings/${id}`);
  },

  updateAdminBooking(
    id: number | string,
    data: UpdateBookingDto,
  ): Promise<ApiResponse<Booking>> {
    return ApiClient.patch(`/admin/bookings/${id}`, data);
  },

  bookEvent(
    eventId: number | string,
    data: CreateBookingDto,
  ): Promise<ApiResponse<Booking>> {
    return ApiClient.post(`/events/${eventId}/book`, data);
  },

  getMyBookings(params?: GetBookingsParams): Promise<PaginatedResponse<Booking>> {
    return ApiClient.get(`/me/bookings${buildQueryString(params)}`);
  },

  cancelMyBooking(id: number | string): Promise<ApiResponse<Booking>> {
    return ApiClient.patch(`/me/bookings/${id}/cancel`);
  },

  checkIn(id: number | string): Promise<ApiResponse<Booking>> {
    return ApiClient.post(`/operator/bookings/${id}/check-in`);
  },

  // Compatibility for existing admin queries.
  getBookings(params?: GetBookingsParams): Promise<PaginatedResponse<Booking>> {
    return this.getAdminBookings(params);
  },
};
