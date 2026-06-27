import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { coursesService } from '@/services/api';
import { QUERY_KEYS } from '@/constants/config';
import type { CoursesFilter } from '@/types';

export const useCourses = (filters?: CoursesFilter) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.COURSES.ALL, filters],
    queryFn: () => coursesService.getAll(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.COURSES.DETAIL(id),
    queryFn: () => coursesService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useEnrolledCourses = () => {
  return useQuery({
    queryKey: QUERY_KEYS.COURSES.ENROLLED,
    queryFn: () => coursesService.getEnrolled(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.COURSES.CATEGORIES,
    queryFn: () => coursesService.getCategories(),
    staleTime: 1000 * 60 * 30,
  });
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => coursesService.enroll(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.ENROLLED });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.DETAIL(courseId) });
    },
  });
};

export const useCourseSections = (courseId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.LESSONS.BY_COURSE(courseId),
    queryFn: () => coursesService.getCourseSections(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  });
};
