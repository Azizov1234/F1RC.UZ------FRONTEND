import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  raceParticipantsApi,
  type CreateRaceParticipantDto,
  type GetRaceParticipantsParams,
  type UpdateRaceParticipantDto,
} from '../../api/race-participants.api';
import { queryKeys } from './useQueryKeys';

type RaceParticipantId = number | string;

function hasRaceParticipantId(id: RaceParticipantId | undefined): id is RaceParticipantId {
  return id !== undefined && id !== '';
}

function requireRaceParticipantId(id: RaceParticipantId | undefined): RaceParticipantId {
  if (!hasRaceParticipantId(id)) {
    throw new Error('Race participant ID is required');
  }
  return id;
}

export function useRaceParticipants(params?: GetRaceParticipantsParams) {
  return useQuery({
    queryKey: queryKeys.raceParticipants.list({ ...params }),
    queryFn: () => raceParticipantsApi.getRaceParticipants(params),
    staleTime: 5_000,
  });
}

export function useRaceParticipant(id: RaceParticipantId | undefined) {
  return useQuery({
    queryKey: queryKeys.raceParticipants.detail(id ?? ''),
    queryFn: async () => {
      const response = await raceParticipantsApi.getRaceParticipantById(requireRaceParticipantId(id));
      return response.data;
    },
    enabled: hasRaceParticipantId(id),
    staleTime: 5_000,
  });
}

export function useCreateRaceParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRaceParticipantDto) => {
      const response = await raceParticipantsApi.createRaceParticipant(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.raceParticipants.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.raceSessions.all() });
    },
  });
}

export function useUpdateRaceParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: RaceParticipantId;
      data: UpdateRaceParticipantDto;
    }) => {
      const response = await raceParticipantsApi.updateRaceParticipant(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.raceParticipants.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.raceSessions.all() });
    },
  });
}
