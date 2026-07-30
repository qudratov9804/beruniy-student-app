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

export interface StreamCookies {
  'CloudFront-Policy': string;
  'CloudFront-Signature': string;
  'CloudFront-Key-Pair-Id': string;
  Domain: string;
  Expires: number;
}

export interface StreamResponse {
  stream_url: string;
  format: string;
  expires_at: string;
  cookies: StreamCookies | [];
}

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
}

// Quiz
export type QuizAnswers = Record<string, string | string[] | boolean>;

export interface QuizQuestion {
  id: number;
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching';
  question: string;
  // The API returns options as plain answer strings (no separate id/value) —
  // the option text itself is what gets submitted as the answer.
  options: string[];
  pairs: unknown | null;
  order: number;
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

export interface QuizHistory {
  attempts: QuizAttempt[];
  best_score: number;
  passed: boolean;
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

// Assignment
export type AssignmentSubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface AssignmentSubmission {
  id: number;
  content: string | null;
  file_url: string | null;
  status: AssignmentSubmissionStatus;
  grade: number | null;
  feedback: string | null;
  submitted_at: string;
}

export interface Assignment {
  content: string;
  submissions: AssignmentSubmission[];
}

// Transcript
export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export type TranscriptStatus = 'not_available' | 'processing' | 'completed';

export interface Transcript {
  status: TranscriptStatus;
  vtt_url: string | null;
  segments: TranscriptSegment[];
}
