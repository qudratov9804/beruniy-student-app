import { apiClient } from './client';
import type { ApiResponse, AskAIPayload, AskAIResponse, AISearchResponse } from '@/types';

export const aiService = {
  ask: async (payload: AskAIPayload): Promise<AskAIResponse> => {
    const res = await apiClient.post<ApiResponse<AskAIResponse>>('/ai/ask', payload);
    return res.data.data;
  },

  search: async (q: string, courseId?: number): Promise<AISearchResponse> => {
    const res = await apiClient.get<ApiResponse<AISearchResponse>>('/ai/search', {
      params: { q, course_id: courseId },
    });
    return res.data.data;
  },
};
