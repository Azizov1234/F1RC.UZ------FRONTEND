import { useQuery } from '@tanstack/react-query';
import { usersApi, type GetUsersParams } from '../../api/users.api';
import type { User, PaginatedResponse } from '../../types';
import { queryKeys } from './useQueryKeys';

export function useUsersQuery(params?: GetUsersParams) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: queryKeys.users.list({ ...params }),
    queryFn: async () => {
      return usersApi.getUsers(params);
    }
  });
}
