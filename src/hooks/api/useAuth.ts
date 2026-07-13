import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import { queryKeys } from './useQueryKeys';

export function useUser() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      const res = await authApi.getUser();
      return res.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ phone, password }: { phone: string; password: string }) => {
      const res = await authApi.loginViaPhone(phone, password);
      if (res.accessToken) {
        authApi.setTokens(res.accessToken, res.refreshToken);
        localStorage.setItem('f1rc_user', JSON.stringify(res.user));
      }
      return res;
    },
    onSuccess: (data) => {
      if (data?.user) {
        queryClient.setQueryData(queryKeys.auth.user(), data.user);
      }
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.clear();
    authApi.logout();
  };
}
