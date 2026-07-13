import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  referralsApi,
  type CreateReferralDto,
  type GetReferralsParams,
  type UpdateReferralDto,
} from '../../api/referrals.api';
import type { ReferralStatus } from '../../types';
import { queryKeys } from './useQueryKeys';

type ReferralId = number | string;

function hasReferralId(id: ReferralId | undefined): id is ReferralId {
  return id !== undefined && id !== '';
}

function requireReferralId(id: ReferralId | undefined): ReferralId {
  if (!hasReferralId(id)) {
    throw new Error('Referral ID is required');
  }
  return id;
}

export function useReferrals(params?: GetReferralsParams) {
  return useQuery({
    queryKey: queryKeys.referrals.list({ ...params }),
    queryFn: () => referralsApi.getAdminReferrals(params),
    staleTime: 10_000,
  });
}

export const useAdminReferrals = useReferrals;

export function useReferral(id: ReferralId | undefined) {
  return useQuery({
    queryKey: queryKeys.referrals.detail(id ?? ''),
    queryFn: async () => {
      const response = await referralsApi.getAdminReferralById(requireReferralId(id));
      return response.data;
    },
    enabled: hasReferralId(id),
    staleTime: 10_000,
  });
}

export function useCreateReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateReferralDto) => {
      const response = await referralsApi.createReferral(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referrals.all() });
    },
  });
}

export function useUpdateReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: ReferralId; data: UpdateReferralDto }) => {
      const response = await referralsApi.updateReferral(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referrals.all() });
    },
  });
}

export function useUpdateReferralStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: ReferralId; status: ReferralStatus }) => {
      const response = await referralsApi.updateReferralStatus(id, status);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referrals.all() });
    },
  });
}
