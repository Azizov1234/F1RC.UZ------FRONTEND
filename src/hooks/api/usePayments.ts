import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  paymentsApi,
  type CreatePaymentDto,
  type GetPaymentsParams,
  type UpdatePaymentDto,
} from '../../api/payments.api';
import { queryKeys } from './useQueryKeys';

type PaymentId = number | string;

function hasId(id: PaymentId | undefined): id is PaymentId {
  return id !== undefined && id !== '';
}

function requireId(id: PaymentId | undefined): PaymentId {
  if (!hasId(id)) throw new Error('Payment ID is required');
  return id;
}

function invalidatePayments(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.payments.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
}

export function useAdminPayments(params?: GetPaymentsParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.list({ ...params, scope: 'admin' }),
    queryFn: () => paymentsApi.getAdminPayments(params),
    enabled,
    staleTime: 15_000,
  });
}

export function useAdminPayment(id: PaymentId | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.detail(`admin:${id ?? ''}`),
    queryFn: async () => (await paymentsApi.getAdminPaymentById(requireId(id))).data,
    enabled: enabled && hasId(id),
    staleTime: 15_000,
  });
}

export function useCreateAdminPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePaymentDto) =>
      (await paymentsApi.createAdminPayment(data)).data,
    onSuccess: () => invalidatePayments(queryClient),
  });
}

export function useUpdateAdminPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: PaymentId; data: UpdatePaymentDto }) =>
      (await paymentsApi.updateAdminPayment(id, data)).data,
    onSuccess: () => invalidatePayments(queryClient),
  });
}

export function useMyPayments(params?: GetPaymentsParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.mine({ ...params }),
    queryFn: () => paymentsApi.getMyPayments(params),
    enabled,
    staleTime: 15_000,
  });
}

export function useCreateMyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePaymentDto) =>
      (await paymentsApi.createMyPayment(data)).data,
    onSuccess: () => invalidatePayments(queryClient),
  });
}
