import { ApiClient } from './api';
import { appendFormField, buildQueryString } from './query';
import {
  normalizePublicActive,
  normalizePublicDetail,
  normalizePublicPage,
  type PublicActiveWire,
  type PublicDetailEnvelope,
} from './public-response';
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

type PublicEventWire = PublicActiveWire<Event>;

function normalizePublicEvent(event: PublicEventWire): Event {
  const normalized = normalizePublicActive<Event>(event);
  return {
    ...normalized,
    scheduleSlots: normalized.scheduleSlots?.map((slot) => ({
      ...slot,
      isActive: slot.isActive ?? true,
    })),
  };
}

export const eventsApi = {
  async getPublicEvents(
    params?: GetPublicEventsParams,
    options?: RequestInit,
  ): Promise<PaginatedResponse<Event>> {
    const response = await ApiClient.get<PaginatedResponse<PublicEventWire>>(
      `/events${buildQueryString(params)}`,
      options,
    );
    return normalizePublicPage(response, normalizePublicEvent);
  },

  async getPublicEventById(
    id: number | string,
    options?: RequestInit,
  ): Promise<ApiResponse<Event>> {
    const response = await ApiClient.get<
      PublicDetailEnvelope<'event', PublicEventWire>
    >(`/events/${id}`, options);
    return normalizePublicDetail(response, 'event', normalizePublicEvent);
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
