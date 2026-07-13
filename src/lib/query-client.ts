import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // 401/403 da retry qilma — foydasiz
        const status = (error as { status?: number; statusCode?: number })?.status ?? (error as { status?: number; statusCode?: number })?.statusCode;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
      staleTime: 30_000,
      gcTime: 5 * 60_000, // 5 daqiqa cache saqlansin
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
