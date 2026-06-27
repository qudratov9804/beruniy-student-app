import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService, categoriesService, enrollmentsService } from '@/services/api';
import { QUERY_KEYS } from '@/constants/config';
import { useAuthStore } from '@/stores';
import type { CoursesFilter } from '@/types';

export const useCourses = (filters?: CoursesFilter) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.COURSES.ALL, filters],
    queryFn: () => coursesService.getAll(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCourse = (slug: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.COURSES.DETAIL(slug),
    queryFn: () => coursesService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

export const useEnrolledCourses = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.ENROLLMENTS.ALL,
    queryFn: () => enrollmentsService.getAll({ sort: 'recently_accessed' }),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES.ALL,
    queryFn: () => categoriesService.getAll(),
    staleTime: 1000 * 60 * 30,
  });
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: number) => enrollmentsService.enroll(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS.DETAIL(courseId) });
    },
  });
};

export const useCourseProgress = (courseId: number) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.COURSES.PROGRESS(courseId),
    queryFn: () => coursesService.getProgress(courseId),
    enabled: isAuthenticated && !!courseId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useEnrollmentDetail = (courseId: number) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.ENROLLMENTS.DETAIL(courseId),
    queryFn: () => enrollmentsService.getDetail(courseId),
    enabled: isAuthenticated && !!courseId,
    staleTime: 1000 * 60 * 2,
  });
};
