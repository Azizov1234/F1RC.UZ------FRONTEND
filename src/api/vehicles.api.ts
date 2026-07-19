import { ApiClient } from './api';
import { appendFormField, buildQueryString } from './query';
import {
  normalizePublicActive,
  normalizePublicDetail,
  normalizePublicPage,
  type PublicActiveWire,
  type PublicDetailEnvelope,
} from './public-response';
import type {
  ApiResponse,
  PaginatedResponse,
  Vehicle,
  VehicleControlType,
  VehicleDifficulty,
  VehicleStatus,
} from '../types';

export interface GetPublicVehiclesParams {
  page?: number;
  limit?: number;
}

export interface GetAdminVehiclesParams extends GetPublicVehiclesParams {
  search?: string;
  categorySlug?: string;
  categoryName?: string;
  status?: VehicleStatus;
  difficulty?: VehicleDifficulty;
  controlType?: VehicleControlType;
  isActive?: boolean;
  sortBy?:
    | 'id'
    | 'name'
    | 'topSpeedKmh'
    | 'batteryLifeMinutes'
    | 'sortOrder'
    | 'createdAt'
    | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateVehicleDto {
  categoryId: number;
  name: string;
  slug?: string;
  imageUrl?: File;
  topSpeedKmh?: number;
  batteryLifeMinutes?: number;
  controlType?: VehicleControlType;
  difficulty?: VehicleDifficulty;
  status?: VehicleStatus;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateVehicleDto = Partial<CreateVehicleDto>;

function vehicleFormData(data: CreateVehicleDto | UpdateVehicleDto): FormData {
  const formData = new FormData();
  appendFormField(formData, 'categoryId', data.categoryId);
  appendFormField(formData, 'name', data.name);
  appendFormField(formData, 'slug', data.slug);
  appendFormField(formData, 'imageUrl', data.imageUrl);
  appendFormField(formData, 'topSpeedKmh', data.topSpeedKmh);
  appendFormField(formData, 'batteryLifeMinutes', data.batteryLifeMinutes);
  appendFormField(formData, 'controlType', data.controlType);
  appendFormField(formData, 'difficulty', data.difficulty);
  appendFormField(formData, 'status', data.status);
  appendFormField(formData, 'description', data.description);
  appendFormField(formData, 'sortOrder', data.sortOrder);
  appendFormField(formData, 'isActive', data.isActive);
  return formData;
}

type PublicVehicleWire = PublicActiveWire<Vehicle>;

const normalizePublicVehicle = (vehicle: PublicVehicleWire): Vehicle =>
  normalizePublicActive<Vehicle>(vehicle);

export const vehiclesApi = {
  async getPublicVehicles(
    params?: GetPublicVehiclesParams,
    options?: RequestInit,
  ): Promise<PaginatedResponse<Vehicle>> {
    const response = await ApiClient.get<PaginatedResponse<PublicVehicleWire>>(
      `/vehicles${buildQueryString(params)}`,
      options,
    );
    return normalizePublicPage(response, normalizePublicVehicle);
  },

  async getPublicVehicleById(
    id: number | string,
    options?: RequestInit,
  ): Promise<ApiResponse<Vehicle>> {
    const response = await ApiClient.get<
      PublicDetailEnvelope<'vehicle', PublicVehicleWire>
    >(`/vehicles/${id}`, options);
    return normalizePublicDetail(response, 'vehicle', normalizePublicVehicle);
  },

  getAdminVehicles(
    params?: GetAdminVehiclesParams,
  ): Promise<PaginatedResponse<Vehicle>> {
    return ApiClient.get(`/vehicles/admin${buildQueryString(params)}`);
  },

  getAdminVehicleById(id: number | string): Promise<ApiResponse<Vehicle>> {
    return ApiClient.get(`/vehicles/admin/${id}`);
  },

  createVehicle(data: CreateVehicleDto | FormData): Promise<ApiResponse<Vehicle>> {
    return ApiClient.post(
      '/vehicles/admin',
      data instanceof FormData ? data : vehicleFormData(data),
    );
  },

  updateVehicle(
    id: number | string,
    data: UpdateVehicleDto | FormData,
  ): Promise<ApiResponse<Vehicle>> {
    return ApiClient.patch(
      `/vehicles/admin/${id}`,
      data instanceof FormData ? data : vehicleFormData(data),
    );
  },

  disableVehicle(id: number | string): Promise<ApiResponse<Vehicle>> {
    return ApiClient.patch(`/vehicles/admin/${id}/disable`);
  },

  // Compatibility for the existing admin vehicle hook.
  getVehicles(params?: GetAdminVehiclesParams): Promise<PaginatedResponse<Vehicle>> {
    return this.getAdminVehicles(params);
  },
};
