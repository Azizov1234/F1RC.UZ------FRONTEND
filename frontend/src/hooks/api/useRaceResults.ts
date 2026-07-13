import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  raceResultsApi,
  type CreateRaceResultDto,
  type GetRaceResultsParams,
  type UpdateRaceResultDto,
} from '../../api/race-results.api';
import { queryKeys } from './useQueryKeys';

type RaceResultId = number | string;

function hasRaceResultId(id: RaceResultId | undefined): id is RaceResultId {
  return id !== undefined && id !== '';
}

function requireRaceResultId(id: RaceResultId | undefined): RaceResultId {
  if (!hasRaceResultId(id)) {
    throw new Error('Race result ID is required');
  }
  return id;
}

export function useRaceResults(params?: GetRaceResultsParams) {
  return useQuery({
    queryKey: queryKeys.raceResults.list({ ...params }),
    queryFn: () => raceResultsApi.getRaceResults(params),
    staleTime: 5_000,
  });
}

export function useRaceResult(id: RaceResultId | undefined) {
  return useQuery({
    queryKey: queryKeys.raceResults.detail(id ?? ''),
    queryFn: async () => {
      const response = await raceResultsApi.getRaceResultById(requireRaceResultId(id));
      return response.data;
    },
    enabled: hasRaceResultId(id),
    staleTime: 5_000,
  });
}

export function useCreateRaceResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRaceResultDto) => {
      const response = await raceResultsApi.createRaceResult(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.raceResults.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.raceParticipants.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.raceSessions.all() });
    },
  });
}

export function useUpdateRaceResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: RaceResultId; data: UpdateRaceResultDto }) => {
      const response = await raceResultsApi.updateRaceResult(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.raceResults.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.raceParticipants.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.raceSessions.all() });
    },
  });
}
