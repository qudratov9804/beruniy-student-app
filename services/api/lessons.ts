import { apiClient } from './client';
import type {
  ApiResponse,
  Lesson,
  SaveProgressRequest,
  SaveProgressResponse,
  StreamResponse,
  Quiz,
  QuizAnswers,
  QuizSubmitResult,
  QuizHistory,
  Transcript,
  Assignment,
  AssignmentSubmission,
} from '@/types';

export const lessonsService = {
  getById: async (courseId: number, id: number): Promise<Lesson> => {
    const res = await apiClient.get<ApiResponse<Lesson>>(`/courses/${courseId}/lessons/${id}`);
    return res.data.data;
  },

  saveProgress: async (
    courseId: number,
    id: number,
    data: SaveProgressRequest
  ): Promise<SaveProgressResponse> => {
    const res = await apiClient.post<ApiResponse<SaveProgressResponse>>(
      `/courses/${courseId}/lessons/${id}/progress`,
      data
    );
    return res.data.data;
  },

  getStreamUrl: async (courseId: number, id: number): Promise<StreamResponse> => {
    const res = await apiClient.get<ApiResponse<StreamResponse>>(
      `/courses/${courseId}/lessons/${id}/stream`
    );
    return res.data.data;
  },

  getTranscript: async (
    courseId: number,
    lessonId: number,
    language?: 'uz' | 'ru' | 'en'
  ): Promise<Transcript> => {
    const res = await apiClient.get<ApiResponse<Transcript>>(
      `/courses/${courseId}/lessons/${lessonId}/transcript`,
      { params: language ? { language } : undefined }
    );
    return res.data.data;
  },
};

export const quizService = {
  getQuiz: async (lessonId: number): Promise<Quiz> => {
    const res = await apiClient.get<ApiResponse<Quiz>>(`/lessons/${lessonId}/quiz`);
    return res.data.data;
  },

  submit: async (lessonId: number, answers: QuizAnswers): Promise<QuizSubmitResult> => {
    const res = await apiClient.post<ApiResponse<QuizSubmitResult>>(
      `/lessons/${lessonId}/quiz/submit`,
      { answers }
    );
    return res.data.data;
  },

  getHistory: async (lessonId: number): Promise<QuizHistory> => {
    const res = await apiClient.get<ApiResponse<QuizHistory>>(
      `/lessons/${lessonId}/quiz/history`
    );
    return res.data.data;
  },

  getResult: async (lessonId: number): Promise<QuizSubmitResult> => {
    const res = await apiClient.get<ApiResponse<QuizSubmitResult>>(
      `/lessons/${lessonId}/quiz/result`
    );
    return res.data.data;
  },
};

export const assignmentService = {
  getByLessonId: async (lessonId: number): Promise<Assignment> => {
    const res = await apiClient.get<ApiResponse<Assignment>>(`/lessons/${lessonId}/assignment`);
    return res.data.data;
  },

  submit: async (lessonId: number, content: string): Promise<AssignmentSubmission> => {
    const formData = new FormData();
    formData.append('content', content);
    const res = await apiClient.post<ApiResponse<AssignmentSubmission>>(
      `/lessons/${lessonId}/assignment/submit`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.data;
  },
};
