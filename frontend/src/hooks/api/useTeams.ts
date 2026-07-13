import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  teamsApi,
  type CreateTeamDto,
  type GetTeamsParams,
  type UpdateTeamDto,
} from '../../api/teams.api';
import { queryKeys } from './useQueryKeys';

type TeamId = number | string;
type TeamUserId = number | string;

function hasTeamId(id: TeamId | undefined): id is TeamId {
  return id !== undefined && id !== '';
}

function requireTeamId(id: TeamId | undefined): TeamId {
  if (!hasTeamId(id)) {
    throw new Error('Team ID is required');
  }
  return id;
}

export function useAdminTeams(params?: GetTeamsParams) {
  return useQuery({
    queryKey: queryKeys.teams.adminList({ ...params }),
    queryFn: () => teamsApi.getAdminTeams(params),
    staleTime: 15_000,
  });
}

export function useAdminTeam(id: TeamId | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.adminDetail(id ?? ''),
    queryFn: async () => {
      const response = await teamsApi.getAdminTeamById(requireTeamId(id));
      return response.data;
    },
    enabled: hasTeamId(id),
    staleTime: 15_000,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTeamDto | FormData) => {
      const response = await teamsApi.createTeam(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
    },
  });
}

export function useUpdateAdminTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: TeamId; data: UpdateTeamDto | FormData }) => {
      const response = await teamsApi.updateAdminTeam(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
    },
  });
}

export function useToggleTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: TeamId; isActive: boolean }) => {
      const response = await teamsApi.toggleTeam(id, isActive);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
    },
  });
}

export function useMyTeams(params?: GetTeamsParams) {
  return useQuery({
    queryKey: queryKeys.teams.myList({ ...params }),
    queryFn: () => teamsApi.getMyTeams(params),
    staleTime: 15_000,
  });
}

export function useMyTeam(id: TeamId | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.detail(id ?? ''),
    queryFn: async () => {
      const response = await teamsApi.getMyTeamById(requireTeamId(id));
      return response.data;
    },
    enabled: hasTeamId(id),
    staleTime: 15_000,
  });
}

export function useUpdateMyTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: TeamId; data: UpdateTeamDto | FormData }) => {
      const response = await teamsApi.updateMyTeam(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
    },
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: TeamId; userId: number }) => {
      const response = await teamsApi.addMember(teamId, userId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: TeamId; userId: TeamUserId }) => {
      const response = await teamsApi.removeMember(teamId, userId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
    },
  });
}
