import { create } from 'zustand';
import type { QuizAnswers, QuizSubmitResult } from '@/types';

interface QuizState {
  currentQuestionIndex: number;
  answers: QuizAnswers;
  result: QuizSubmitResult | null;
  startTime: number | null;
  isCompleted: boolean;
  startQuiz: () => void;
  answerQuestion: (questionId: number, answer: string | string[] | boolean) => void;
  nextQuestion: () => void;
  setResult: (result: QuizSubmitResult) => void;
  resetQuiz: () => void;
  getAnswerForQuestion: (questionId: number) => string | string[] | boolean | undefined;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentQuestionIndex: 0,
  answers: {},
  result: null,
  startTime: null,
  isCompleted: false,

  startQuiz: () =>
    set({
      startTime: Date.now(),
      currentQuestionIndex: 0,
      answers: {},
      isCompleted: false,
      result: null,
    }),

  answerQuestion: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [String(questionId)]: answer },
    })),

  nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),

  setResult: (result) => set({ result, isCompleted: true }),

  resetQuiz: () =>
    set({
      currentQuestionIndex: 0,
      answers: {},
      result: null,
      startTime: null,
      isCompleted: false,
    }),

  getAnswerForQuestion: (questionId) => get().answers[String(questionId)],
}));
