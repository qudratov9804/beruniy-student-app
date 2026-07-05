import React from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react-native';
import { quizService } from '@/services/api';
import { useQuizStore } from '@/stores';
import { QuizOption, QuizProgressHeader, QuizResultCard } from '@/components/quiz';
import { Button, Skeleton } from '@/components/ui';
import { EmptyState } from '@/components/common/EmptyState';

const getErrorMessage = (err: unknown): string => {
  const e = err as { response?: { status?: number; data?: { message?: string } } };
  if (e?.response?.status === 403) {
    return "Bu testni ko'rish uchun kursga yozilgan bo'lishingiz kerak.";
  }
  return e?.response?.data?.message ?? 'Testni yuklashda xatolik yuz berdi.';
};

const noRetryOnAuthError = (failureCount: number, err: unknown) => {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 401 || status === 403 || status === 404) return false;
  return failureCount < 2;
};

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const lessonId = Number(id);

  const {
    currentQuestionIndex,
    answers,
    result,
    isCompleted,
    startQuiz,
    answerQuestion,
    nextQuestion,
    setResult,
    resetQuiz,
    getAnswerForQuestion,
  } = useQuizStore();

  const {
    data: quiz,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['quiz', lessonId],
    queryFn: () => quizService.getQuiz(lessonId),
    enabled: !!lessonId,
    retry: noRetryOnAuthError,
  });

  const submitMutation = useMutation({
    mutationFn: () => quizService.submit(lessonId, answers),
    onSuccess: (data) => setResult(data),
  });

  React.useEffect(() => {
    if (quiz) startQuiz();
    return () => resetQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.questions_count]);

  const handleClose = () => {
    Alert.alert('Testni tark etish', 'Hozir chiqsangiz, progress saqlanmaydi.', [
      { text: 'Qolish', style: 'cancel' },
      {
        text: 'Chiqish',
        style: 'destructive',
        onPress: () => {
          resetQuiz();
          router.back();
        },
      },
    ]);
  };

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-5 py-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft size={28} color="#0F172A" />
          </TouchableOpacity>
        </View>
        <EmptyState
          emoji="😕"
          title={getErrorMessage(error)}
          actionLabel="Qayta urinish"
          onAction={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  if (isLoading || !quiz) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 pt-4">
          <Skeleton height={12} borderRadius={6} className="mb-6" />
          <Skeleton height={80} borderRadius={12} className="mb-8" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={56} borderRadius={12} className="mb-3" />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (quiz.questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-5 py-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft size={28} color="#0F172A" />
          </TouchableOpacity>
        </View>
        <EmptyState emoji="📝" title="Bu testda hozircha savollar mavjud emas." />
      </SafeAreaView>
    );
  }

  if (isCompleted && result) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <QuizResultCard
          result={result}
          onContinue={() => {
            resetQuiz();
            router.back();
          }}
          onRetry={() => {
            resetQuiz();
            startQuiz();
          }}
        />
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = currentQuestion
    ? getAnswerForQuestion(currentQuestion.id)
    : undefined;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  if (!currentQuestion) return null;

  const handleSelect = (optionId: string) => {
    answerQuestion(currentQuestion.id, optionId);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      submitMutation.mutate();
    } else {
      nextQuestion();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <QuizProgressHeader
        current={currentQuestionIndex + 1}
        total={quiz.questions.length}
        onClose={handleClose}
      />

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <Text className="text-xs text-slate-400 font-sans-medium mb-2">
            Savol {currentQuestionIndex + 1}/{quiz.questions.length}
          </Text>
          <Text className="text-xl font-sans-bold text-slate-800 mb-6 leading-7">
            {currentQuestion.question}
          </Text>

          {currentQuestion.options.map((option, index) => (
            <QuizOption
              key={option.id}
              option={option}
              selected={selectedAnswer === option.id}
              onSelect={handleSelect}
              index={index}
            />
          ))}
        </View>
      </ScrollView>

      <View className="px-5 pb-6 pt-3 border-t border-slate-100">
        <Button
          fullWidth
          size="lg"
          onPress={handleNext}
          disabled={!selectedAnswer}
          loading={submitMutation.isPending}
        >
          {isLastQuestion ? 'Tugatish' : 'Keyingisi'}
        </Button>
      </View>
    </SafeAreaView>
  );
}
