import React, { useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { quizService } from '@/services/api';
import { useQuizStore } from '@/stores';
import { useCourse } from '@/hooks/useCourses';
import { flattenLessonsInModuleOrder } from '@/utils';
import { QuizOption, QuizProgressHeader, QuizResultCard, QuizAttemptHistory } from '@/components/quiz';
import { Button, Skeleton } from '@/components/ui';
import { EmptyState } from '@/components/common/EmptyState';
import { HtmlText } from '@/components/common/HtmlText';
import { QUERY_KEYS } from '@/constants/config';
import type { Quiz, QuizAnswers } from '@/types';

const getErrorMessage = (err: unknown, t: TFunction): string => {
  const e = err as { response?: { status?: number; data?: { message?: string } } };
  if (e?.response?.status === 403) {
    return t('quiz.enrollmentRequired');
  }
  return e?.response?.data?.message ?? t('quiz.loadError');
};

const noRetryOnAuthError = (failureCount: number, err: unknown) => {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 401 || status === 403 || status === 404) return false;
  return failureCount < 2;
};

// Choice answers are tracked locally by option index (some questions repeat the same
// option text twice, so comparing/selecting by value would highlight both) — convert
// back to the actual option text the API expects right before submitting.
const buildAnswersPayload = (quiz: Quiz, answers: QuizAnswers): QuizAnswers => {
  const payload: QuizAnswers = {};
  for (const q of quiz.questions) {
    const raw = answers[String(q.id)];
    if (raw === undefined) continue;
    if (q.type === 'single_choice' && typeof raw === 'string') {
      payload[String(q.id)] = q.options[Number(raw)] ?? raw;
    } else if (q.type === 'multiple_choice' && Array.isArray(raw)) {
      payload[String(q.id)] = raw.map((idx) => q.options[Number(idx)] ?? idx);
    } else {
      payload[String(q.id)] = raw;
    }
  }
  return payload;
};

export default function QuizScreen() {
  const {
    id,
    courseId: courseIdParam,
    courseSlug,
  } = useLocalSearchParams<{ id: string; courseId?: string; courseSlug?: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const lessonId = Number(id);
  const courseId = Number(courseIdParam);
  const justSubmittedRef = React.useRef(false);

  const { data: course } = useCourse(courseSlug ?? '');
  // The API's own lessons array order isn't reliable within a module (e.g. a quiz can
  // be listed before its module's article) — index-based "what's next" needs this
  // canonical order instead, same as the lesson and course-detail screens.
  const orderedLessons = flattenLessonsInModuleOrder(course?.lessons ?? []);

  // Direct URL access on web (or a fresh tab) leaves no history entry to go back
  // to — router.back() then silently no-ops (GO_BACK not handled) and strands the
  // user on this screen. Always fall back to an explicit route instead.
  const goBackToLesson = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/lesson/${lessonId}?courseId=${courseId}`);
    }
  };

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
    queryKey: QUERY_KEYS.QUIZ.DETAIL(lessonId),
    queryFn: () => quizService.getQuiz(lessonId),
    enabled: !!lessonId,
    retry: noRetryOnAuthError,
  });

  // Already passed and can't retake — nothing to answer, so jump straight to the
  // last result instead of forcing the user to click through every question again
  // only to hit a 422 at the end.
  const lockedWithPastResult = !!quiz && !quiz.can_retake && quiz.attempts_count > 0;

  // Fetched in parallel with `quiz` (not gated on lockedWithPastResult, which itself
  // needs `quiz` loaded first) — gating on it would waterfall two round-trips before a
  // returning, already-passed visit ever shows its result. A fresh quiz just eats one
  // harmless 404 here.
  const {
    data: existingResult,
    isError: existingResultIsError,
  } = useQuery({
    queryKey: QUERY_KEYS.QUIZ.RESULT(lessonId),
    queryFn: () => quizService.getResult(lessonId),
    enabled: !!lessonId,
    retry: noRetryOnAuthError,
  });

  useEffect(() => {
    if (existingResult) setResult(existingResult);
  }, [existingResult, setResult]);

  // Invalidates everything that depends on this quiz's pass/fail state: the next
  // lesson unlock (enrollment's `next_lesson`), course progress bar/checkmarks, and
  // this quiz's own can_retake/attempts_count — mirrors what the lesson screen's
  // video-complete mutation already does for video/article lessons.
  const invalidateProgress = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ.HISTORY(lessonId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ.DETAIL(lessonId) });
    if (courseId) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS.DETAIL(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.PROGRESS(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LESSONS.DETAIL(courseId, lessonId) });
    }
  };

  const submitMutation = useMutation({
    mutationFn: () => quizService.submit(lessonId, quiz ? buildAnswersPayload(quiz, answers) : answers),
    onSuccess: (data) => {
      justSubmittedRef.current = true;
      setResult(data);
      invalidateProgress();
    },
    onError: async (err: unknown) => {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      if (e?.response?.status === 422) {
        // Already passed a previous attempt — show that result instead of leaving the
        // user stuck on the last question.
        try {
          justSubmittedRef.current = true;
          setResult(await quizService.getResult(lessonId));
          invalidateProgress();
          return;
        } catch {
          // fall through to the generic alert below
        }
      }
      Alert.alert(t('common.error'), e?.response?.data?.message ?? t('quiz.submitError'));
    },
  });

  useEffect(() => {
    if (!quiz) return;
    // Post-submit invalidation can flip lockedWithPastResult and re-fire this effect — don't reset the result we just submitted in this session.
    if (justSubmittedRef.current) return;
    // Clear any stale result left in the store from a previously-viewed quiz before
    // this one's own `existingResult` fetch resolves — otherwise navigating directly
    // between two already-passed quizzes could flash the wrong one's result. But only
    // when we don't already have it: `existingResult` fetches in parallel with `quiz`
    // and can resolve in the very same render as this effect firing — the effect below
    // that sets it runs first (declared earlier), so resetting unconditionally here
    // would wipe the just-set correct result right back out and strand the screen on
    // the waiting skeleton forever (existingResult's query reference won't change again
    // to re-trigger that effect).
    if (lockedWithPastResult) {
      if (!existingResult) resetQuiz();
    } else {
      startQuiz();
    }
    return () => resetQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.questions_count, lockedWithPastResult]);

  const handleClose = () => {
    Alert.alert(t('quiz.leaveTitle'), t('quiz.leaveMessage'), [
      { text: t('quiz.stay'), style: 'cancel' },
      {
        text: t('quiz.exit'),
        style: 'destructive',
        onPress: goBackToLesson,
      },
    ]);
  };

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-5 py-4">
          <TouchableOpacity onPress={goBackToLesson} className="p-2 -ml-2">
            <ChevronLeft size={28} color="#0F172A" />
          </TouchableOpacity>
        </View>
        <EmptyState
          emoji="😕"
          title={getErrorMessage(error, t)}
          actionLabel={t('common.retry')}
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
          <TouchableOpacity onPress={goBackToLesson} className="p-2 -ml-2">
            <ChevronLeft size={28} color="#0F172A" />
          </TouchableOpacity>
        </View>
        <EmptyState emoji="📝" title={t('quiz.noQuestions')} />
      </SafeAreaView>
    );
  }

  // Waiting on the eagerly-fetched past result — without this guard the question
  // flow below would flash briefly before flipping over to the result screen.
  if (lockedWithPastResult && !existingResultIsError && !(isCompleted && result)) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 pt-4">
          <Skeleton height={200} borderRadius={16} />
        </View>
      </SafeAreaView>
    );
  }

  if (isCompleted && result) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1" contentContainerClassName="flex-grow" showsVerticalScrollIndicator={false}>
          <QuizResultCard
            result={result}
            onContinue={() => {
              // Don't resetQuiz() here — navigating away unmounts this screen, and the
              // effect below already resets on unmount. Doing it here first causes an
              // extra render where lockedWithPastResult is true (if the just-passed
              // quiz's own data already refetched) but result is null, which gets
              // stuck on the "waiting for past result" skeleton before the
              // navigation actually takes effect.
              const currentIndex = orderedLessons.findIndex((l) => l.id === lessonId);
              const nextLesson =
                result.passed && currentIndex >= 0 ? orderedLessons[currentIndex + 1] : undefined;
              if (nextLesson) {
                router.replace(`/lesson/${nextLesson.id}?courseId=${courseId}&courseSlug=${courseSlug ?? ''}`);
              } else {
                goBackToLesson();
              }
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
            {t('quiz.questionCounter', { current: currentQuestionIndex + 1, total: quiz.questions.length })}
          </Text>
          <View className="mb-6">
            <HtmlText html={currentQuestion.question} baseFontSize={20} color="#1E293B" weight="bold" />
          </View>

          {currentQuestion.type === 'fill_blank' ? (
            <TextInput
              value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
              onChangeText={(text) => answerQuestion(currentQuestion.id, text)}
              placeholder={t('quiz.fillBlankPlaceholder')}
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
              { label: t('quiz.true'), value: true },
              { label: t('quiz.false'), value: false },
            ] as const).map((opt, index) => (
              <QuizOption
                key={String(opt.value)}
                text={opt.label}
                selected={selectedAnswer === opt.value}
                onSelect={() => answerQuestion(currentQuestion.id, opt.value)}
                index={index}
              />
            ))
          ) : currentQuestion.type === 'matching' ? (
            <Text className="text-sm text-slate-400">
              {t('quiz.unsupportedQuestionType')}
            </Text>
          ) : (
            currentQuestion.options.map((option, index) => {
              // The API has no option ids, and some questions repeat the same option
              // text more than once — track selection by index, not value, so two
              // identical-looking options don't highlight together. Converted back to
              // the actual option text in buildAnswersPayload right before submitting.
              const indexKey = String(index);
              const isMultiple = currentQuestion.type === 'multiple_choice';
              const isSelected = isMultiple
                ? Array.isArray(selectedAnswer) && selectedAnswer.includes(indexKey)
                : selectedAnswer === indexKey;
              return (
                <QuizOption
                  key={index}
                  text={option}
                  selected={isSelected}
                  onSelect={() => {
                    if (!isMultiple) {
                      answerQuestion(currentQuestion.id, indexKey);
                      return;
                    }
                    const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
                    const next = current.includes(indexKey)
                      ? current.filter((v) => v !== indexKey)
                      : [...current, indexKey];
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
          {isLastQuestion ? t('quiz.finish') : t('quiz.next')}
        </Button>
      </View>
    </SafeAreaView>
  );
}
