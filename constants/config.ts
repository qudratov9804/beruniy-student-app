export const API_BASE_URL = 'https://api.beruniy-talim.uz/api';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  ONBOARDED: 'has_onboarded',
} as const;

export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
  },
  COURSES: {
    ALL: ['courses'] as const,
    DETAIL: (id: string) => ['courses', id] as const,
    ENROLLED: ['courses', 'enrolled'] as const,
    CATEGORIES: ['courses', 'categories'] as const,
  },
  LESSONS: {
    BY_COURSE: (courseId: string) => ['lessons', courseId] as const,
    DETAIL: (id: string) => ['lessons', 'detail', id] as const,
  },
  QUIZ: {
    DETAIL: (id: string) => ['quiz', id] as const,
  },
  PROGRESS: {
    STATS: ['progress', 'stats'] as const,
    LEADERBOARD: ['progress', 'leaderboard'] as const,
    ACHIEVEMENTS: ['progress', 'achievements'] as const,
  },
} as const;

export const XP_PER_LEVEL = 1000;
export const MAX_DAILY_STREAK_BONUS = 2;
