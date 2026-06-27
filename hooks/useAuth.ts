import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authService } from '@/services/api';
import { useAuthStore } from '@/stores';
import { QUERY_KEYS } from '@/constants/config';
import type { LoginRequest, RegisterRequest } from '@/types';

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async (data) => {
      await setAuth(data.user, data.tokens);
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, data.user);
      router.replace('/(tabs)');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: async (data) => {
      await setAuth(data.user, data.tokens);
      router.replace('/(tabs)');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch {
        // ignore logout errors
      }
    },
    onSettled: async () => {
      await clearAuth();
      queryClient.clear();
      router.replace('/(auth)/login');
    },
  });

  const meQuery = useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: () => authService.getMe(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: meQuery.data ?? user,
    isAuthenticated,
    isLoadingMe: meQuery.isLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};
