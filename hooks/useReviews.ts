import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '@/services/api';
import { QUERY_KEYS } from '@/constants/config';
import type { CreateReviewPayload, Review, ReviewsFilter } from '@/types';

export const useReviews = (courseId: number, filters?: ReviewsFilter) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.REVIEWS.ALL(courseId), filters],
    queryFn: () => reviewsService.getAll(courseId, filters),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useReviewsSummary = (courseId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEWS.SUMMARY(courseId),
    queryFn: () => reviewsService.getSummary(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateReview = (
  courseId: number,
  callbacks?: { onSuccess?: (review: Review) => void; onError?: (err: unknown) => void }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewsService.create(courseId, payload),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEWS.ALL(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEWS.SUMMARY(courseId) });
      callbacks?.onSuccess?.(review);
    },
    onError: (err) => callbacks?.onError?.(err),
  });
};
