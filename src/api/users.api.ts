import { ApiClient } from './api';
import { appendFormField, buildQueryString } from './query';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  UserRole,
  UserStatus,
} from '../types';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  status?: UserStatus;
  role?: UserRole;
  search?: string;
  sortBy?: 'createdAt' | 'fullName' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserDto {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  role: UserRole;
  avatarUrl?: File;
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  avatarUrl?: File;
  status?: UserStatus;
}

function userFormData(data: CreateUserDto | UpdateUserDto): FormData {
  const formData = new FormData();
  appendFormField(formData, 'fullName', data.fullName);
  appendFormField(formData, 'phone', data.phone);
  appendFormField(formData, 'email', data.email);
  appendFormField(formData, 'password', data.password);
  appendFormField(formData, 'role', data.role);
  appendFormField(formData, 'avatarUrl', data.avatarUrl);
  if ('status' in data) appendFormField(formData, 'status', data.status);
  return formData;
}

export const usersApi = {
  getUsers(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
    return ApiClient.get(`/users/all${buildQueryString(params)}`);
  },

  createUser(data: CreateUserDto | FormData): Promise<ApiResponse<User>> {
    return ApiClient.post(
      '/users/create/one',
      data instanceof FormData ? data : userFormData(data),
    );
  },

  getOneUser(id: number | string): Promise<ApiResponse<User>> {
    return ApiClient.get(`/users/one/${id}`);
  },

  updateUser(
    id: number | string,
    data: UpdateUserDto | FormData,
  ): Promise<ApiResponse<User>> {
    return ApiClient.patch(
      `/users/update/one/${id}`,
      data instanceof FormData ? data : userFormData(data),
    );
  },

  deleteUser(id: number | string): Promise<ApiResponse<User>> {
    return ApiClient.delete(`/users/delete/one/${id}`);
  },
};
