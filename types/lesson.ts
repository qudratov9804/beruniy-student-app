export type LessonType = 'video' | 'article' | 'quiz' | 'assignment';
export type VideoStatus = 'none' | 'processing' | 'ready' | 'failed';

export interface LessonProgress {
  is_completed: boolean;
  watch_seconds: number;
  quiz_score: number | null;
}

export interface Lesson {
  id: number;
  title: string;
  type: LessonType;
  content: string | null;
  video_status: VideoStatus;
  duration_seconds: number;
  is_preview: boolean;
  progress: LessonProgress | null;
}

export interface SaveProgressRequest {
  watch_seconds: number;
  is_completed?: boolean;
}

export interface SaveProgressResponse {
  is_completed: boolean;
  watch_seconds: number;
  course_progress: number;
}

export interface StreamResponse {
  url: string;
  expires_at: string;
}

// Quiz
export type QuizAnswers = Record<string, string | string[] | boolean>;

export interface QuizQuestion {
  id: number;
  type: 'single' | 'multiple' | 'true_false' | 'fill_blank' | 'matching';
  question: string;
  options: QuizOption[];
  order: number;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface Quiz {
  passing_score: number;
  questions_count: number;
  attempts_count: number;
  can_retake: boolean;
  last_attempt: QuizAttempt | null;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  attempt_number: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  passed: boolean;
  can_retake: boolean;
  submitted_at: string;
}

export interface QuizSubmitResult {
  attempt_number: number;
  score: number;
  total_questions: number;
  correct: number;
  passed: boolean;
  can_retake: boolean;
  results: QuizQuestionResult[];
}

export interface QuizQuestionResult {
  question_id: number;
  is_correct: boolean;
  correct_answer: string | string[];
  your_answer: string | string[] | boolean;
}

// Transcript
export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}
