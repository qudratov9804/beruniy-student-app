import { apiClient } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Course,
  Category,
  Enrollment,
  CoursesFilter,
  CourseProgress,
} from '@/types';

export const coursesService = {
  getAll: async (filters?: CoursesFilter) => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<Course>>>('/courses', {
      params: filters,
    });
    return res.data.data;
  },

  getById: async (id: string): Promise<Course> => {
    const res = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    return res.data.data;
  },

  getEnrolled: async () => {
    const res = await apiClient.get<ApiResponse<Course[]>>('/courses/enrolled');
    return res.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/courses/categories');
    return res.data.data;
  },

  enroll: async (courseId: string): Promise<Enrollment> => {
    const res = await apiClient.post<ApiResponse<Enrollment>>(`/courses/${courseId}/enroll`);
    return res.data.data;
  },

  getProgress: async (courseId: string): Promise<CourseProgress> => {
    const res = await apiClient.get<ApiResponse<CourseProgress>>(`/courses/${courseId}/progress`);
    return res.data.data;
  },

  getCourseSections: async (courseId: string) => {
    const res = await apiClient.get<ApiResponse<import('@/types').Section[]>>(
      `/courses/${courseId}/sections`
    );
    return res.data.data;
  },
};
