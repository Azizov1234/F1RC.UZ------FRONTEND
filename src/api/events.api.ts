import { ApiClient } from './api';
import { appendFormField, buildQueryString } from './query';
import type { ApiResponse, Event, EventStatus, PaginatedResponse } from '../types';

export type PublicEventStatus = Exclude<EventStatus, 'DRAFT' | 'CANCELLED'>;

export interface GetPublicEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  seasonId?: number;
  categoryId?: number;
  arenaId?: number;
  status?: PublicEventStatus;
  startsFrom?: string;
  startsTo?: string;
}

export interface GetEventsParams extends Omit<GetPublicEventsParams, 'status'> {
  status?: EventStatus;
  trackLayoutId?: number;
  isActive?: boolean;
  sortBy?: 'id' | 'name' | 'status' | 'startsAt' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateEventDto {
  seasonId: number;
  categoryId: number;
  arenaId: number;
  trackLayoutId: number;
  name: string;
  slug?: string;
  description?: string;
  coverImageUrl?: File;
  status?: EventStatus;
  registrationStartsAt: string;
  registrationEndsAt: string;
  startsAt: string;
  endsAt?: string | null;
  price?: number;
  currency?: string;
  isActive?: boolean;
}

export type UpdateEventDto = Partial<CreateEventDto>;

function eventFormData(data: CreateEventDto | UpdateEventDto): FormData {
  const formData = new FormData();
  appendFormField(formData, 'seasonId', data.seasonId);
  appendFormField(formData, 'categoryId', data.categoryId);
  appendFormField(formData, 'arenaId', data.arenaId);
  appendFormField(formData, 'trackLayoutId', data.trackLayoutId);
  appendFormField(formData, 'name', data.name);
  appendFormField(formData, 'slug', data.slug);
  appendFormField(formData, 'description', data.description);
  appendFormField(formData, 'coverImageUrl', data.coverImageUrl);
  appendFormField(formData, 'status', data.status);
  appendFormField(formData, 'registrationStartsAt', data.registrationStartsAt);
  appendFormField(formData, 'registrationEndsAt', data.registrationEndsAt);
  appendFormField(formData, 'startsAt', data.startsAt);
  appendFormField(formData, 'endsAt', data.endsAt);
  appendFormField(formData, 'price', data.price);
  appendFormField(formData, 'currency', data.currency);
  appendFormField(formData, 'isActive', data.isActive);
  return formData;
}

export const eventsApi = {
  getPublicEvents(
    params?: GetPublicEventsParams,
  ): Promise<PaginatedResponse<Event>> {
    return ApiClient.get(`/events${buildQueryString(params)}`);
  },

  getPublicEventById(id: number | string): Promise<ApiResponse<Event>> {
    return ApiClient.get(`/events/${id}`);
  },

  getAdminEvents(params?: GetEventsParams): Promise<PaginatedResponse<Event>> {
    return ApiClient.get(`/admin/events${buildQueryString(params)}`);
  },

  getAdminEventById(id: number | string): Promise<ApiResponse<Event>> {
    return ApiClient.get(`/admin/events/${id}`);
  },

  createEvent(data: CreateEventDto | FormData): Promise<ApiResponse<Event>> {
    return ApiClient.post(
      '/admin/events',
      data instanceof FormData ? data : eventFormData(data),
    );
  },

  updateEvent(
    id: number | string,
    data: UpdateEventDto | FormData,
  ): Promise<ApiResponse<Event>> {
    return ApiClient.patch(
      `/admin/events/${id}`,
      data instanceof FormData ? data : eventFormData(data),
    );
  },

  updateEventStatus(
    id: number | string,
    status: EventStatus,
  ): Promise<ApiResponse<Event>> {
    return ApiClient.patch(`/admin/events/${id}/status`, { status });
  },

  // Compatibility for public dashboards. Admin screens should call getAdminEvents.
  getEvents(params?: GetPublicEventsParams): Promise<PaginatedResponse<Event>> {
    return this.getPublicEvents(params);
  },
};
