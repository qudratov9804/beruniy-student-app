import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { quizService } from '@/services/api';
import { useQuizStore } from '@/stores';
import { QuizOption, QuizProgressHeader, QuizResultCard } from '@/components/quiz';
import { Button, Skeleton } from '@/components/ui';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizService.getById(id),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      quizService.submit({
        quizId: id,
        answers,
        timeTaken: Math.floor(
          (Date.now() - (useQuizStore.getState().startTime ?? Date.now())) / 1000
        ),
      }),
    onSuccess: (data) => setResult(data),
  });

  React.useEffect(() => {
    if (quiz) startQuiz();
    return () => resetQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.id]);

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
  const selectedAnswer = currentQuestion ? getAnswerForQuestion(currentQuestion.id) : undefined;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  if (!currentQuestion) return null;

  const handleSelect = (optionId: string) => {
    answerQuestion({ questionId: currentQuestion.id, selectedOptionId: optionId });
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
              selected={selectedAnswer?.selectedOptionId === option.id}
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
