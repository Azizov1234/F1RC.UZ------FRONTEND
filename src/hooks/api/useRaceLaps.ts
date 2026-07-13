import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  raceLapsApi,
  type CreateRaceLapDto,
  type GetRaceLapsParams,
  type UpdateRaceLapDto,
} from '../../api/race-laps.api';
import { queryKeys } from './useQueryKeys';

type RaceLapId = number | string;

function hasRaceLapId(id: RaceLapId | undefined): id is RaceLapId {
  return id !== undefined && id !== '';
}

function requireRaceLapId(id: RaceLapId | undefined): RaceLapId {
  if (!hasRaceLapId(id)) {
    throw new Error('Race lap ID is required');
  }
  return id;
}

export function useRaceLaps(params?: GetRaceLapsParams) {
  return useQuery({
    queryKey: queryKeys.raceLaps.list({ ...params }),
    queryFn: () => raceLapsApi.getRaceLaps(params),
    staleTime: 3_000,
  });
}

export function useRaceLap(id: RaceLapId | undefined) {
  return useQuery({
    queryKey: queryKeys.raceLaps.detail(id ?? ''),
    queryFn: async () => {
      const response = await raceLapsApi.getRaceLapById(requireRaceLapId(id));
      return response.data;
    },
    enabled: hasRaceLapId(id),
    staleTime: 3_000,
  });
}

export function useCreateRaceLap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: RaceLapId;
      data: CreateRaceLapDto;
    }) => {
      const response = await raceLapsApi.createRaceLap(sessionId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.raceLaps.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.raceParticipants.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.raceSessions.all() });
    },
  });
}

export function useUpdateRaceLap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: RaceLapId; data: UpdateRaceLapDto }) => {
      const response = await raceLapsApi.updateRaceLap(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.raceLaps.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.raceParticipants.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.raceSessions.all() });
    },
  });
}
