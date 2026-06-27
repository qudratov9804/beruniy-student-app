export type LessonType = 'video' | 'text' | 'quiz' | 'assignment';

export interface Lesson {
  id: string;
  courseId: string;
  sectionId: string;
  title: string;
  description?: string;
  type: LessonType;
  duration: number;
  order: number;
  xpReward: number;
  isCompleted?: boolean;
  isFree: boolean;
  videoUrl?: string;
  content?: string;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  isCompleted: boolean;
  watchedSeconds?: number;
  completedAt?: string;
  earnedXp: number;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  question: string;
  options: QuizOption[];
  explanation?: string;
  order: number;
  xpReward: number;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  timeLimit?: number;
  passingScore: number;
  questions: QuizQuestion[];
  attemptsAllowed: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
}

export interface QuizSubmission {
  quizId: string;
  answers: QuizAnswer[];
  timeTaken: number;
}

export interface QuizResult {
  quizId: string;
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  earnedXp: number;
  timeTaken: number;
  attemptNumber: number;
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
    correctOptionId: string;
    selectedOptionId?: string;
  }>;
}
