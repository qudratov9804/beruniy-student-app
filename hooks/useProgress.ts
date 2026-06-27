import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService, certificatesService, wishlistService } from '@/services/api';
import { QUERY_KEYS } from '@/constants/config';
import { useAuthStore } from '@/stores';

export const useNotifications = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.ALL,
    queryFn: () => notificationsService.getAll(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1,
  });
};

export const useUnreadCount = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT,
    queryFn: () => notificationsService.getUnreadCount(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT });
    },
  });
};

export const useCertificates = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.CERTIFICATES.ALL,
    queryFn: () => certificatesService.getAll(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
  });
};

export const useWishlist = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.WISHLIST.ALL,
    queryFn: () => wishlistService.getAll(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: number) => wishlistService.toggle(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WISHLIST.ALL });
    },
  });
};
