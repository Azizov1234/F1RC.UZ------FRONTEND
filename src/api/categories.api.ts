import { ApiClient } from './api';
import { appendFormField, buildQueryString } from './query';
import type { ApiResponse, PaginatedResponse, RacingCategory } from '../types';

export interface GetPublicCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetAdminCategoriesParams extends GetPublicCategoriesParams {
  isActive?: boolean;
  sortBy?: 'id' | 'name' | 'sortOrder' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  speedRange?: string;
  trackType?: string;
  imageUrl?: File;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

function categoryFormData(data: CreateCategoryDto | UpdateCategoryDto): FormData {
  const formData = new FormData();
  appendFormField(formData, 'name', data.name);
  appendFormField(formData, 'slug', data.slug);
  appendFormField(formData, 'description', data.description);
  appendFormField(formData, 'speedRange', data.speedRange);
  appendFormField(formData, 'trackType', data.trackType);
  appendFormField(formData, 'imageUrl', data.imageUrl);
  appendFormField(formData, 'isActive', data.isActive);
  appendFormField(formData, 'sortOrder', data.sortOrder);
  return formData;
}

export const categoriesApi = {
  getPublicCategories(
    params?: GetPublicCategoriesParams,
  ): Promise<PaginatedResponse<RacingCategory>> {
    return ApiClient.get(`/categories/public${buildQueryString(params)}`);
  },

  getPublicCategoryById(
    id: number | string,
  ): Promise<ApiResponse<RacingCategory>> {
    return ApiClient.get(`/categories/one/${id}`);
  },

  getAdminCategories(
    params?: GetAdminCategoriesParams,
  ): Promise<PaginatedResponse<RacingCategory>> {
    return ApiClient.get(`/categories/admin${buildQueryString(params)}`);
  },

  getAdminCategoryById(
    id: number | string,
  ): Promise<ApiResponse<RacingCategory>> {
    return ApiClient.get(`/categories/admin/${id}`);
  },

  createCategory(
    data: CreateCategoryDto | FormData,
  ): Promise<ApiResponse<RacingCategory>> {
    return ApiClient.post(
      '/categories/admin',
      data instanceof FormData ? data : categoryFormData(data),
    );
  },

  updateCategory(
    id: number | string,
    data: UpdateCategoryDto | FormData,
  ): Promise<ApiResponse<RacingCategory>> {
    return ApiClient.patch(
      `/categories/admin/${id}`,
      data instanceof FormData ? data : categoryFormData(data),
    );
  },

  deleteCategory(id: number | string): Promise<ApiResponse<RacingCategory>> {
    return ApiClient.delete(`/categories/admin/${id}`);
  },

  // Compatibility for the existing admin category hook.
  getCategories(
    params?: GetAdminCategoriesParams,
  ): Promise<PaginatedResponse<RacingCategory>> {
    return this.getAdminCategories(params);
  },

  // Compatibility for the existing hook; this is a real DELETE, not a toggle.
  toggleCategory(id: number | string): Promise<ApiResponse<RacingCategory>> {
    return this.deleteCategory(id);
  },
};
