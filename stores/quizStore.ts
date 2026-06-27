import { create } from 'zustand';
import type { QuizAnswer, QuizResult } from '@/types';

interface QuizState {
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  result: QuizResult | null;
  startTime: number | null;
  isCompleted: boolean;
  startQuiz: () => void;
  answerQuestion: (answer: QuizAnswer) => void;
  nextQuestion: () => void;
  setResult: (result: QuizResult) => void;
  resetQuiz: () => void;
  getAnswerForQuestion: (questionId: string) => QuizAnswer | undefined;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentQuestionIndex: 0,
  answers: [],
  result: null,
  startTime: null,
  isCompleted: false,

  startQuiz: () =>
    set({
      startTime: Date.now(),
      currentQuestionIndex: 0,
      answers: [],
      isCompleted: false,
      result: null,
    }),

  answerQuestion: (answer) => {
    const existing = get().answers.findIndex((a) => a.questionId === answer.questionId);
    set((state) => ({
      answers:
        existing >= 0
          ? state.answers.map((a, i) => (i === existing ? answer : a))
          : [...state.answers, answer],
    }));
  },

  nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),

  setResult: (result) => set({ result, isCompleted: true }),

  resetQuiz: () =>
    set({
      currentQuestionIndex: 0,
      answers: [],
      result: null,
      startTime: null,
      isCompleted: false,
    }),

  getAnswerForQuestion: (questionId) => get().answers.find((a) => a.questionId === questionId),
}));
