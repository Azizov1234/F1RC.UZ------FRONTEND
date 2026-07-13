import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  raceSessionsApi,
  type CreateRaceSessionDto,
  type GetRaceSessionsParams,
  type UpdateRaceSessionDto,
} from '../../api/race-sessions.api';
import type { RaceSessionStatus } from '../../types';
import { queryKeys } from './useQueryKeys';

type RaceSessionId = number | string;

function hasRaceSessionId(id: RaceSessionId | undefined): id is RaceSessionId {
  return id !== undefined && id !== '';
}

function requireRaceSessionId(id: RaceSessionId | undefined): RaceSessionId {
  if (!hasRaceSessionId(id)) {
    throw new Error('Race session ID is required');
  }
  return id;
}

function invalidateRaceData(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.raceSessions.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.raceParticipants.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.raceLaps.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.raceResults.all() });
}

export function useRaceSessions(params?: GetRaceSessionsParams) {
  return useQuery({
    queryKey: queryKeys.raceSessions.list({ ...params }),
    queryFn: () => raceSessionsApi.getRaceSessions(params),
    staleTime: 5_000,
  });
}

export function useRaceSession(id: RaceSessionId | undefined) {
  return useQuery({
    queryKey: queryKeys.raceSessions.detail(id ?? ''),
    queryFn: async () => {
      const response = await raceSessionsApi.getRaceSessionById(requireRaceSessionId(id));
      return response.data;
    },
    enabled: hasRaceSessionId(id),
    staleTime: 5_000,
  });
}

export function useCreateRaceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRaceSessionDto) => {
      const response = await raceSessionsApi.createRaceSession(data);
      return response.data;
    },
    onSuccess: () => invalidateRaceData(queryClient),
  });
}

export function useUpdateRaceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: RaceSessionId; data: UpdateRaceSessionDto }) => {
      const response = await raceSessionsApi.updateRaceSession(id, data);
      return response.data;
    },
    onSuccess: () => invalidateRaceData(queryClient),
  });
}

export function useUpdateRaceSessionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: RaceSessionId; status: RaceSessionStatus }) => {
      const response = await raceSessionsApi.updateRaceSessionStatus(id, status);
      return response.data;
    },
    onSuccess: () => invalidateRaceData(queryClient),
  });
}

export function useStartRaceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: RaceSessionId) => {
      const response = await raceSessionsApi.startSession(id);
      return response.data;
    },
    onSuccess: () => invalidateRaceData(queryClient),
  });
}

export function useFinishRaceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: RaceSessionId) => {
      const response = await raceSessionsApi.finishSession(id);
      return response.data;
    },
    onSuccess: () => invalidateRaceData(queryClient),
  });
}
