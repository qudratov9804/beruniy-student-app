import { apiClient } from './client';
import type { ApiResponse, UserStats, LeaderboardEntry } from '@/types';

export const progressService = {
  getStats: async (): Promise<UserStats> => {
    const res = await apiClient.get<ApiResponse<UserStats>>('/progress/stats');
    return res.data.data;
  },

  getLeaderboard: async (type: 'weekly' | 'monthly' | 'all-time' = 'weekly') => {
    const res = await apiClient.get<ApiResponse<LeaderboardEntry[]>>('/progress/leaderboard', {
      params: { type },
    });
    return res.data.data;
  },

  getAchievements: async () => {
    const res = await apiClient.get<ApiResponse<import('@/types').Achievement[]>>(
      '/progress/achievements'
    );
    return res.data.data;
  },
};
