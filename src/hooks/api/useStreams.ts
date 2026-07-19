import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  streamsApi,
  type CreateStreamDto,
  type GetPublicStreamsParams,
  type GetStreamsParams,
  type UpdateStreamDto,
} from '../../api/streams.api';
import type { StreamStatus } from '../../types';
import { queryKeys } from './useQueryKeys';

type StreamId = number | string;

function hasId(id: StreamId | undefined): id is StreamId {
  return id !== undefined && id !== '';
}

function requireId(id: StreamId | undefined): StreamId {
  if (!hasId(id)) throw new Error('Stream ID is required');
  return id;
}

export function usePublicStreams(params?: GetPublicStreamsParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.streams.list({ ...params, scope: 'public' }),
    queryFn: ({ signal }) => streamsApi.getPublicStreams(params, { signal }),
    enabled,
    staleTime: 20_000,
    refetchInterval: params?.status === 'LIVE' ? 15_000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useAdminStreams(params?: GetStreamsParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.streams.list({ ...params, scope: 'admin' }),
    queryFn: () => streamsApi.getAdminStreams(params),
    enabled,
    staleTime: 10_000,
  });
}

export function useAdminStream(id: StreamId | undefined) {
  return useQuery({
    queryKey: queryKeys.streams.detail(id ?? ''),
    queryFn: async () => (await streamsApi.getAdminStreamById(requireId(id))).data,
    enabled: hasId(id),
    staleTime: 10_000,
  });
}

function useInvalidateStreams() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.streams.all() });
}

export function useCreateStream() {
  const invalidate = useInvalidateStreams();
  return useMutation({
    mutationFn: async (data: CreateStreamDto) => (await streamsApi.createStream(data)).data,
    onSuccess: invalidate,
  });
}

export function useUpdateStream() {
  const invalidate = useInvalidateStreams();
  return useMutation({
    mutationFn: async ({ id, data }: { id: StreamId; data: UpdateStreamDto }) =>
      (await streamsApi.updateStream(id, data)).data,
    onSuccess: invalidate,
  });
}

export function useUpdateStreamStatus() {
  const invalidate = useInvalidateStreams();
  return useMutation({
    mutationFn: async ({ id, status }: { id: StreamId; status: StreamStatus }) =>
      (await streamsApi.updateStreamStatus(id, status)).data,
    onSuccess: invalidate,
  });
}
