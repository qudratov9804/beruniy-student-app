export const API_BASE_URL = 'https://api.beruniy-talim.uz/api/v1';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user_data',
  ONBOARDED: 'has_onboarded',
  PIN: 'app_pin',
  BIOMETRIC_ENABLED: 'biometric_enabled',
} as const;

export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
  },
  HOME: {
    FEED: ['home', 'feed'] as const,
  },
  COURSES: {
    ALL: ['courses'] as const,
    DETAIL: (slug: string) => ['courses', slug] as const,
    FEATURED: ['courses', 'featured'] as const,
    TRENDING: ['courses', 'trending'] as const,
    SEARCH: (q: string) => ['courses', 'search', q] as const,
    BY_CATEGORY: (slug: string) => ['courses', 'category', slug] as const,
    PROGRESS: (courseId: number) => ['courses', courseId, 'progress'] as const,
  },
  CATEGORIES: {
    ALL: ['categories'] as const,
    DETAIL: (slug: string) => ['categories', slug] as const,
  },
  ENROLLMENTS: {
    ALL: ['enrollments'] as const,
    DETAIL: (courseId: number) => ['enrollments', courseId] as const,
  },
  LESSONS: {
    DETAIL: (courseId: number, id: number) => ['lessons', courseId, id] as const,
    STREAM: (courseId: number, id: number) => ['lessons', courseId, id, 'stream'] as const,
  },
  QUIZ: {
    DETAIL: (lessonId: number) => ['quiz', lessonId] as const,
    HISTORY: (lessonId: number) => ['quiz', lessonId, 'history'] as const,
    RESULT: (lessonId: number) => ['quiz', lessonId, 'result'] as const,
  },
  WISHLIST: {
    ALL: ['wishlist'] as const,
  },
  CERTIFICATES: {
    ALL: ['certificates'] as const,
    DETAIL: (enrollmentId: number) => ['certificates', enrollmentId] as const,
  },
  NOTIFICATIONS: {
    ALL: ['notifications'] as const,
    UNREAD_COUNT: ['notifications', 'unread-count'] as const,
  },
} as const;
