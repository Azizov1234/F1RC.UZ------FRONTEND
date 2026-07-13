import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../../api/health.api';
import { queryKeys } from './useQueryKeys';

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health.status(),
    queryFn: healthApi.getHealth,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}
