export interface AISource {
  lesson_title: string;
  course_title: string;
  timestamp: string;
  similarity: number;
}

export interface AskAIPayload {
  question: string;
  course_id?: number | null;
  language?: 'uz' | 'ru' | 'en';
}

export interface AskAIResponse {
  answer: string;
  sources: AISource[];
}

export interface AISearchCourseResult {
  id: number;
  title: string;
  slug: string;
  similarity: number;
}

export interface AISearchResponse {
  segments: unknown[];
  courses: AISearchCourseResult[];
}
