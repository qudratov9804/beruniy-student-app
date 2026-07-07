import React from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react-native';
import { quizService } from '@/services/api';
import { useQuizStore } from '@/stores';
import { QuizOption, QuizProgressHeader, QuizResultCard, QuizAttemptHistory } from '@/components/quiz';
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
    onError: async (err: unknown) => {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      if (e?.response?.status === 422) {
        // Already passed a previous attempt — show that result instead of leaving the
        // user stuck on the last question.
        try {
          setResult(await quizService.getResult(lessonId));
          return;
        } catch {
          // fall through to the generic alert below
        }
      }
      Alert.alert('Xatolik', e?.response?.data?.message ?? 'Javoblarni yuborishda xatolik yuz berdi.');
    },
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
        <ScrollView showsVerticalScrollIndicator={false}>
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
          <QuizAttemptHistory lessonId={lessonId} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = currentQuestion
    ? getAnswerForQuestion(currentQuestion.id)
    : undefined;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  if (!currentQuestion) return null;

  // A `false` true/false answer or an empty (but touched) array must still count as
  // "answered" — checking selectedAnswer for truthiness would block the Next button.
  const hasAnswered =
    selectedAnswer === undefined
      ? false
      : Array.isArray(selectedAnswer)
        ? selectedAnswer.length > 0
        : typeof selectedAnswer === 'string'
          ? selectedAnswer.trim().length > 0
          : true;

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

          {currentQuestion.type === 'fill_blank' ? (
            <TextInput
              value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
              onChangeText={(text) => answerQuestion(currentQuestion.id, text)}
              placeholder="Javobingizni shu yerga yozing..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="border-2 border-slate-200 rounded-2xl px-4 py-3 text-base text-slate-800 min-h-[100px]"
            />
          ) : currentQuestion.type === 'true_false' ? (
            // Answer must be a real boolean (per API contract), not an option id, so
            // this renders its own Yes/No pair instead of `options`.
            ([
              { label: "To'g'ri", value: true },
              { label: "Noto'g'ri", value: false },
            ] as const).map((opt, index) => (
              <QuizOption
                key={String(opt.value)}
                option={{ id: String(opt.value), text: opt.label }}
                selected={selectedAnswer === opt.value}
                onSelect={() => answerQuestion(currentQuestion.id, opt.value)}
                index={index}
              />
            ))
          ) : currentQuestion.type === 'matching' ? (
            <Text className="text-sm text-slate-400">
              Bu turdagi savol hozircha mobil ilovada qo'llab-quvvatlanmaydi. Davom etish uchun
              "Keyingisi" tugmasini bosing.
            </Text>
          ) : (
            currentQuestion.options.map((option, index) => {
              const isMultiple = currentQuestion.type === 'multiple';
              const isSelected = isMultiple
                ? Array.isArray(selectedAnswer) && selectedAnswer.includes(option.id)
                : selectedAnswer === option.id;
              return (
                <QuizOption
                  key={option.id}
                  option={option}
                  selected={isSelected}
                  onSelect={() => {
                    if (!isMultiple) {
                      answerQuestion(currentQuestion.id, option.id);
                      return;
                    }
                    const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
                    const next = current.includes(option.id)
                      ? current.filter((v) => v !== option.id)
                      : [...current, option.id];
                    answerQuestion(currentQuestion.id, next);
                  }}
                  index={index}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      <View className="px-5 pb-6 pt-3 border-t border-slate-100">
        <Button
          fullWidth
          size="lg"
          onPress={handleNext}
          disabled={currentQuestion.type !== 'matching' && !hasAnswered}
          loading={submitMutation.isPending}
        >
          {isLastQuestion ? 'Tugatish' : 'Keyingisi'}
        </Button>
      </View>
    </SafeAreaView>
  );
}
