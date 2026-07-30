import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService, certificatesService, wishlistService } from '@/services/api';
import { QUERY_KEYS } from '@/constants/config';
import { useAuthStore } from '@/stores';
import type { Course } from '@/types';

// Backend exposes no websocket/push channel for notifications (REST-only per API docs),
// so "realtime" here means short-interval polling that also refires on refocus.
const NOTIFICATIONS_POLL_MS = 25000;
const UNREAD_COUNT_POLL_MS = 15000;

export const useNotifications = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.ALL,
    queryFn: () => notificationsService.getAll(),
    enabled: isAuthenticated,
    staleTime: 1000 * 20,
    refetchInterval: isAuthenticated ? NOTIFICATIONS_POLL_MS : false,
    refetchOnWindowFocus: true,
  });
};

export const useUnreadCount = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT,
    queryFn: () => notificationsService.getUnreadCount(),
    enabled: isAuthenticated,
    staleTime: 1000 * 10,
    refetchInterval: isAuthenticated ? UNREAD_COUNT_POLL_MS : false,
    refetchOnWindowFocus: true,
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
    mutationFn: ({ courseId }: { courseId: number; slug: string }) =>
      wishlistService.toggle(courseId),
    onSuccess: (result, { slug }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WISHLIST.ALL });
      queryClient.setQueryData<Course>(QUERY_KEYS.COURSES.DETAIL(slug), (course) =>
        course ? { ...course, is_in_wishlist: result.added } : course
      );
    },
  });
};
