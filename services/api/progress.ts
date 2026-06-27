import { apiClient } from './client';
import type { ApiResponse, Notification, Certificate, WishlistItem } from '@/types';
import type { PaginatedResponse } from '@/types';

export const notificationsService = {
  getAll: async (): Promise<PaginatedResponse<Notification>> => {
    const res = await apiClient.get<PaginatedResponse<Notification>>('/notifications');
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return res.data.data.count;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};

export const certificatesService = {
  getAll: async (): Promise<Certificate[]> => {
    const res = await apiClient.get<ApiResponse<Certificate[]>>('/certificates');
    return res.data.data;
  },

  getByEnrollment: async (enrollmentId: number): Promise<Certificate> => {
    const res = await apiClient.get<ApiResponse<Certificate>>(`/certificates/${enrollmentId}`);
    return res.data.data;
  },

  verify: async (code: string): Promise<Certificate> => {
    const res = await apiClient.get<ApiResponse<Certificate>>(`/certificates/${code}/verify`);
    return res.data.data;
  },
};

export const wishlistService = {
  getAll: async (): Promise<WishlistItem[]> => {
    const res = await apiClient.get<ApiResponse<WishlistItem[]>>('/wishlist');
    return res.data.data;
  },

  toggle: async (courseId: number): Promise<{ wishlisted: boolean }> => {
    const res = await apiClient.post<ApiResponse<{ wishlisted: boolean }>>(
      `/wishlist/${courseId}`
    );
    return res.data.data;
  },

  clear: async (): Promise<void> => {
    await apiClient.delete('/wishlist/clear');
  },
};
