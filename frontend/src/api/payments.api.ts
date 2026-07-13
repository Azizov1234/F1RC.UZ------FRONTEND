import { ApiClient } from './api';
import { buildQueryString } from './query';
import type {
  ApiResponse,
  PaginatedResponse,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../types';

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: number;
  bookingId?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  sortBy?: 'createdAt' | 'updatedAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePaymentDto {
  bookingId: number;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  currency?: string;
  provider?: string;
  providerTransactionId?: string;
  notes?: string;
}

export type UpdatePaymentDto = Partial<Omit<CreatePaymentDto, 'bookingId'>>;

export const paymentsApi = {
  getAdminPayments(
    params?: GetPaymentsParams,
  ): Promise<PaginatedResponse<Payment>> {
    return ApiClient.get(`/admin/payments${buildQueryString(params)}`);
  },

  createAdminPayment(data: CreatePaymentDto): Promise<ApiResponse<Payment>> {
    return ApiClient.post('/admin/payments', data);
  },

  getAdminPaymentById(id: number | string): Promise<ApiResponse<Payment>> {
    return ApiClient.get(`/admin/payments/${id}`);
  },

  updateAdminPayment(
    id: number | string,
    data: UpdatePaymentDto,
  ): Promise<ApiResponse<Payment>> {
    return ApiClient.patch(`/admin/payments/${id}`, data);
  },

  createMyPayment(data: CreatePaymentDto): Promise<ApiResponse<Payment>> {
    return ApiClient.post('/payments', data);
  },

  getMyPayments(params?: GetPaymentsParams): Promise<PaginatedResponse<Payment>> {
    return ApiClient.get(`/me/payments${buildQueryString(params)}`);
  },
};
