import { apiClient } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Course,
  Category,
  Enrollment,
  EnrollmentDetail,
  CoursesFilter,
  CourseProgress,
  HomeFeed,
} from '@/types';

export const homeService = {
  getFeed: async (): Promise<HomeFeed> => {
    const res = await apiClient.get<HomeFeed>('/home');
    return res.data;
  },
};

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const res = await apiClient.get<ApiResponse<Category>>(`/categories/${slug}`);
    return res.data.data;
  },
};

export const coursesService = {
  getAll: async (filters?: CoursesFilter): Promise<PaginatedResponse<Course>> => {
    const res = await apiClient.get<PaginatedResponse<Course>>('/courses', { params: filters });
    return res.data;
  },

  getFeatured: async (): Promise<Course[]> => {
    const res = await apiClient.get<ApiResponse<Course[]>>('/courses/featured');
    return res.data.data;
  },

  getTrending: async (): Promise<Course[]> => {
    const res = await apiClient.get<ApiResponse<Course[]>>('/courses/trending');
    return res.data.data;
  },

  search: async (query: string, filters?: Omit<CoursesFilter, 'search'>): Promise<PaginatedResponse<Course>> => {
    const res = await apiClient.get<PaginatedResponse<Course>>('/courses/search', {
      params: { search: query, ...filters },
    });
    return res.data;
  },

  getByCategory: async (slug: string, filters?: Omit<CoursesFilter, 'category_id'>): Promise<PaginatedResponse<Course>> => {
    const res = await apiClient.get<PaginatedResponse<Course>>(`/courses/by-category/${slug}`, {
      params: filters,
    });
    return res.data;
  },

  getBySlug: async (slug: string): Promise<Course> => {
    const res = await apiClient.get<ApiResponse<Course>>(`/courses/${slug}`);
    return res.data.data;
  },

  getProgress: async (courseId: number): Promise<CourseProgress> => {
    const res = await apiClient.get<ApiResponse<CourseProgress>>(`/courses/${courseId}/progress`);
    return res.data.data;
  },
};

export const enrollmentsService = {
  getAll: async (params?: {
    status?: 'active' | 'completed' | 'expired';
    sort?: 'recently_accessed' | 'progress' | 'enrolled_date';
    search?: string;
    compact?: boolean;
  }): Promise<Enrollment[]> => {
    const res = await apiClient.get<ApiResponse<Enrollment[]>>('/enrollments', { params });
    return res.data.data;
  },

  enroll: async (courseId: number): Promise<Enrollment> => {
    const res = await apiClient.post<ApiResponse<Enrollment>>('/enrollments', {
      course_id: courseId,
    });
    return res.data.data;
  },

  getDetail: async (courseId: number): Promise<EnrollmentDetail> => {
    const res = await apiClient.get<ApiResponse<EnrollmentDetail>>(`/enrollments/${courseId}`);
    return res.data.data;
  },
};
