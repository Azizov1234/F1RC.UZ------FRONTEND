import { ApiClient } from './api';
import { buildQueryString } from './query';
import type {
  ApiResponse,
  PaginatedResponse,
  Referral,
  ReferralStatus,
} from '../types';

export interface GetReferralsParams {
  page?: number;
  limit?: number;
  search?: string;
  referrerId?: number;
  status?: ReferralStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'status' | 'completedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateReferralDto {
  referrerId: number;
  referredUserId?: number;
  code?: string;
  status?: ReferralStatus;
}

export type UpdateReferralDto = Partial<CreateReferralDto>;

export const referralsApi = {
  getAdminReferrals(
    params?: GetReferralsParams,
  ): Promise<PaginatedResponse<Referral>> {
    return ApiClient.get(`/admin/referrals${buildQueryString(params)}`);
  },

  createReferral(data: CreateReferralDto): Promise<ApiResponse<Referral>> {
    return ApiClient.post('/admin/referrals', data);
  },

  getAdminReferralById(id: number | string): Promise<ApiResponse<Referral>> {
    return ApiClient.get(`/admin/referrals/${id}`);
  },

  updateReferral(
    id: number | string,
    data: UpdateReferralDto,
  ): Promise<ApiResponse<Referral>> {
    return ApiClient.patch(`/admin/referrals/${id}`, data);
  },

  updateReferralStatus(
    id: number | string,
    status: ReferralStatus,
  ): Promise<ApiResponse<Referral>> {
    return ApiClient.patch(`/admin/referrals/${id}/status`, { status });
  },
};
