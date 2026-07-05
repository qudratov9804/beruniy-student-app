import { apiClient } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Review,
  ReviewsFilter,
  CreateReviewPayload,
  ReviewsSummary,
} from '@/types';

export const reviewsService = {
  getAll: async (courseId: number, filters?: ReviewsFilter): Promise<PaginatedResponse<Review>> => {
    const res = await apiClient.get<PaginatedResponse<Review>>(`/courses/${courseId}/reviews`, {
      params: filters,
    });
    return res.data;
  },

  create: async (courseId: number, payload: CreateReviewPayload): Promise<Review> => {
    const res = await apiClient.post<ApiResponse<Review>>(`/courses/${courseId}/reviews`, payload);
    return res.data.data;
  },

  getSummary: async (courseId: number): Promise<ReviewsSummary> => {
    const res = await apiClient.get<ApiResponse<ReviewsSummary>>(`/courses/${courseId}/reviews/summary`);
    return res.data.data;
  },
};
