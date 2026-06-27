export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  coursesCount: number;
}

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  title: string;
  rating: number;
  studentsCount: number;
}

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseLanguage = 'uz' | 'ru' | 'en';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  previewVideo?: string;
  level: CourseLevel;
  language: CourseLanguage;
  category: Category;
  instructor: Instructor;
  price: number;
  isFree: boolean;
  rating: number;
  studentsCount: number;
  lessonsCount: number;
  duration: number;
  xpReward: number;
  tags: string[];
  isEnrolled?: boolean;
  progress?: CourseProgress;
  createdAt: string;
  updatedAt: string;
}

export interface CourseProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  lastAccessedAt: string;
  isCompleted: boolean;
  earnedXp: number;
}

export interface CoursesFilter {
  category?: string;
  level?: CourseLevel;
  language?: CourseLanguage;
  isFree?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'popular' | 'rating' | 'price';
}

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  progress: CourseProgress;
}
