import { apiClient } from './client';
import type {
  ApiResponse,
  Lesson,
  LessonProgress,
  Quiz,
  QuizSubmission,
  QuizResult,
} from '@/types';

export const lessonsService = {
  getById: async (id: string): Promise<Lesson> => {
    const res = await apiClient.get<ApiResponse<Lesson>>(`/lessons/${id}`);
    return res.data.data;
  },

  complete: async (id: string, watchedSeconds?: number): Promise<LessonProgress> => {
    const res = await apiClient.post<ApiResponse<LessonProgress>>(`/lessons/${id}/complete`, {
      watchedSeconds,
    });
    return res.data.data;
  },

  getProgress: async (id: string): Promise<LessonProgress> => {
    const res = await apiClient.get<ApiResponse<LessonProgress>>(`/lessons/${id}/progress`);
    return res.data.data;
  },
};

export const quizService = {
  getById: async (id: string): Promise<Quiz> => {
    const res = await apiClient.get<ApiResponse<Quiz>>(`/quizzes/${id}`);
    return res.data.data;
  },

  submit: async (submission: QuizSubmission): Promise<QuizResult> => {
    const res = await apiClient.post<ApiResponse<QuizResult>>(
      `/quizzes/${submission.quizId}/submit`,
      submission
    );
    return res.data.data;
  },
};
