import React from 'react';
import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { quizService } from '@/services/api';
import { Card, Skeleton } from '@/components/ui';
import { QUERY_KEYS } from '@/constants/config';
import { formatDate } from '@/utils';

interface QuizAttemptHistoryProps {
  lessonId: number;
}

export const QuizAttemptHistory: React.FC<QuizAttemptHistoryProps> = ({ lessonId }) => {
  const { t, i18n } = useTranslation();
  const { data: history, isLoading } = useQuery({
    queryKey: QUERY_KEYS.QUIZ.HISTORY(lessonId),
    queryFn: () => quizService.getHistory(lessonId),
    enabled: !!lessonId,
  });

  if (isLoading) {
    return (
      <View className="px-6 mt-2">
        <Skeleton height={56} borderRadius={12} className="mb-2" />
        <Skeleton height={56} borderRadius={12} />
      </View>
    );
  }

  if (!history || history.attempts.length === 0) return null;

  const bestScore = history.best_score;
  const sorted = [...history.attempts].sort((a, b) => b.attempt_number - a.attempt_number);

  return (
    <View className="px-6 mt-2 mb-8">
      <Text className="text-sm font-sans-bold text-slate-700 mb-3">{t('quiz.history.title')}</Text>
      {sorted.map((attempt) => {
        const isBest = attempt.score === bestScore;
        return (
          <Card
            key={attempt.attempt_number}
            variant="filled"
            theme="light"
            padding="md"
            className={`flex-row items-center justify-between mb-2 ${isBest ? 'border border-amber-300' : ''}`}
          >
            <View className="flex-row items-center gap-2">
              {isBest && <Trophy size={16} color="#F59E0B" />}
              <View>
                <Text className="text-sm font-sans-semibold text-slate-800">
                  {t('quiz.history.attempt', { number: attempt.attempt_number })}
                  {isBest ? t('quiz.history.best') : ''}
                </Text>
                <Text className="text-xs text-slate-400">{formatDate(attempt.submitted_at, i18n.language)}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text
                className={`text-base font-sans-bold ${
                  attempt.passed ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {attempt.score}%
              </Text>
              <Text className="text-xs text-slate-400">
                {attempt.correct_answers}/{attempt.total_questions}
              </Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
};
