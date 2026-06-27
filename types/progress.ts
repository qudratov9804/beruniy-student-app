export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
  isUnlocked: boolean;
  condition: {
    type: 'streak' | 'xp' | 'courses' | 'lessons' | 'quizzes';
    value: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  xp: number;
  streak: number;
  level: number;
  isCurrentUser?: boolean;
}

export interface DailyProgress {
  date: string;
  xpEarned: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  streakDay: number;
}

export interface UserStats {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  nextLevelXp: number;
  currentLevelXp: number;
  enrolledCourses: number;
  completedCourses: number;
  completedLessons: number;
  completedQuizzes: number;
  achievements: Achievement[];
  weeklyProgress: DailyProgress[];
}

export interface StreakInfo {
  current: number;
  longest: number;
  todayCompleted: boolean;
  lastActivityDate: string;
}
