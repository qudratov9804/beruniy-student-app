export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseLanguage = 'uz' | 'ru' | 'en';

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  courses_count: number;
}

export interface CourseInstructor {
  id: number;
  name: string;
  avatar: string | null;
  headline: string | null;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  thumbnail: string | null;
  level: CourseLevel;
  language: CourseLanguage;
  price: number;
  discount_price: number | null;
  effective_price: number;
  discount_percent: number | null;
  is_free: boolean;
  has_certificate: boolean;
  rating: number;
  reviews_count: number;
  enrolled_count: number;
  duration_hours: number;
  lessons_count: number;
  instructor: CourseInstructor;
  category: Category | null;
  created_at: string;
  // only present in detail response
  is_enrolled?: boolean;
  is_in_wishlist?: boolean;
  sections?: Section[];
}

export interface Section {
  id: number;
  title: string;
  order: number;
  lessons_count: number;
  duration_minutes: number;
  lessons: SectionLesson[];
}

export interface SectionLesson {
  id: number;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  duration_seconds: number;
  is_preview: boolean;
  is_completed?: boolean;
  order: number;
}

export interface Enrollment {
  id: number;
  status: 'active' | 'completed' | 'expired' | 'refunded';
  subscription_type: 'lifetime' | 'monthly' | 'yearly';
  progress_percent: number;
  paid_amount: number;
  expires_at: string | null;
  is_expired: boolean;
  enrolled_at: string;
  completed_at: string | null;
  certificate_url: string | null;
  // present when fetched with course detail
  course?: Course;
}

export interface EnrollmentDetail {
  enrollment: Enrollment;
  next_lesson: SectionLesson | null;
  stats: {
    completed_lessons: number;
    total_lessons: number;
    completed_sections: number;
    total_sections: number;
  };
}

export interface CourseProgress {
  percent: number;
  completed_lessons: number;
  total_lessons: number;
  sections: SectionProgress[];
}

export interface SectionProgress {
  id: number;
  title: string;
  completed: number;
  total: number;
  lessons: LessonProgressItem[];
}

export interface LessonProgressItem {
  id: number;
  title: string;
  is_completed: boolean;
  watch_seconds: number;
}

export interface CoursesFilter {
  category_id?: number;
  level?: CourseLevel;
  language?: CourseLanguage;
  is_free?: boolean;
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  has_certificate?: boolean;
  duration?: 'short' | 'medium' | 'long';
  search?: string;
  sort?: 'newest' | 'popular' | 'rating' | 'price_asc' | 'price_desc';
  page?: number;
}

export interface HomeFeed {
  featured: Course[];
  trending: Course[];
  categories: Category[];
  learning_paths: unknown[];
  continue_learning?: ContinueLearningItem[];
}

export interface ContinueLearningItem {
  course_id: number;
  title: string;
  thumbnail: string | null;
  slug: string;
  progress_percent: number;
  subscription_type: string;
  expires_at: string | null;
  next_lesson: SectionLesson | null;
}
