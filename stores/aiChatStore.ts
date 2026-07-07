import { create } from 'zustand';
import type { AISource } from '@/types';

export interface AIChatExchange {
  question: string;
  answer?: string;
  sources?: AISource[];
  error?: string;
}

interface AIChatState {
  // Keyed by course_id so the same conversation survives navigating between the
  // course page and its lessons, but starts fresh for a different course.
  exchangesByCourse: Record<number, AIChatExchange[]>;
  askQuestion: (courseId: number, question: string) => void;
  resolveAnswer: (courseId: number, answer: string, sources: AISource[]) => void;
  resolveError: (courseId: number, error: string) => void;
  clear: (courseId: number) => void;
}

export const useAIChatStore = create<AIChatState>((set) => ({
  exchangesByCourse: {},

  askQuestion: (courseId, question) =>
    set((state) => ({
      exchangesByCourse: {
        ...state.exchangesByCourse,
        [courseId]: [...(state.exchangesByCourse[courseId] ?? []), { question }],
      },
    })),

  resolveAnswer: (courseId, answer, sources) =>
    set((state) => {
      const exchanges = state.exchangesByCourse[courseId] ?? [];
      const lastIndex = exchanges.length - 1;
      return {
        exchangesByCourse: {
          ...state.exchangesByCourse,
          [courseId]: exchanges.map((ex, i) => (i === lastIndex ? { ...ex, answer, sources } : ex)),
        },
      };
    }),

  resolveError: (courseId, error) =>
    set((state) => {
      const exchanges = state.exchangesByCourse[courseId] ?? [];
      const lastIndex = exchanges.length - 1;
      return {
        exchangesByCourse: {
          ...state.exchangesByCourse,
          [courseId]: exchanges.map((ex, i) => (i === lastIndex ? { ...ex, error } : ex)),
        },
      };
    }),

  clear: (courseId) =>
    set((state) => {
      const next = { ...state.exchangesByCourse };
      delete next[courseId];
      return { exchangesByCourse: next };
    }),
}));
