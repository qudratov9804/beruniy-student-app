import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authService } from '@/services/api';
import { useAuthStore } from '@/stores';
import { QUERY_KEYS } from '@/constants/config';
import type {
  SendOtpRequest,
  VerifyOtpRequest,
  RegisterCompleteRequest,
  PasswordLoginRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@/types';

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const sendOtpMutation = useMutation({
    mutationFn: (data: SendOtpRequest) => authService.sendOtp(data),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
  });

  const registerCompleteMutation = useMutation({
    mutationFn: (data: RegisterCompleteRequest) => authService.registerComplete(data),
    onSuccess: async (data) => {
      await setAuth(data.user, data.token);
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, data.user);
      router.replace('/(tabs)');
    },
  });

  const loginWithPasswordMutation = useMutation({
    mutationFn: (data: PasswordLoginRequest) => authService.loginWithPassword(data),
    onSuccess: async (data) => {
      await setAuth(data.user, data.token);
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, data.user);
      router.replace('/(auth)/pin-setup');
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

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, data);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    onSuccess: async () => {
      await clearAuth();
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

    sendOtp: sendOtpMutation.mutateAsync,
    isSendingOtp: sendOtpMutation.isPending,
    sendOtpError: sendOtpMutation.error,

    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    verifyOtpError: verifyOtpMutation.error,

    registerComplete: registerCompleteMutation.mutateAsync,
    isRegisteringComplete: registerCompleteMutation.isPending,

    loginWithPassword: loginWithPasswordMutation.mutateAsync,
    isLoggingIn: loginWithPasswordMutation.isPending,
    loginError: loginWithPasswordMutation.error,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,

    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
  };
};
