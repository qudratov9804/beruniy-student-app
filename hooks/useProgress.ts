import { useQuery } from '@tanstack/react-query';
import { progressService } from '@/services/api';
import { QUERY_KEYS } from '@/constants/config';
import { useAuthStore } from '@/stores';

export const useUserStats = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.PROGRESS.STATS,
    queryFn: () => progressService.getStats(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
};

export const useLeaderboard = (type: 'weekly' | 'monthly' | 'all-time' = 'weekly') => {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROGRESS.LEADERBOARD, type],
    queryFn: () => progressService.getLeaderboard(type),
    staleTime: 1000 * 60 * 5,
  });
};

export const useAchievements = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PROGRESS.ACHIEVEMENTS,
    queryFn: () => progressService.getAchievements(),
    staleTime: 1000 * 60 * 10,
  });
};
