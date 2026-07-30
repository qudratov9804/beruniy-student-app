import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Trophy, CheckCircle, XCircle } from 'lucide-react-native';
import { Card, Button } from '@/components/ui';
import type { QuizSubmitResult } from '@/types';

interface QuizResultCardProps {
  result: QuizSubmitResult;
  onContinue: () => void;
  onRetry?: () => void;
}

export const QuizResultCard: React.FC<QuizResultCardProps> = ({ result, onContinue, onRetry }) => {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="items-center mb-8">
        {result.passed ? (
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-4">
            <Trophy size={48} color="#22C55E" />
          </View>
        ) : (
          <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-4">
            <XCircle size={48} color="#EF4444" />
          </View>
        )}
        <Text className="text-2xl font-sans-bold text-slate-800 mb-1">
          {result.passed ? t('quiz.result.passedTitle') : t('quiz.result.failedTitle')}
        </Text>
        <Text className="text-base text-slate-500 text-center">
          {result.passed ? t('quiz.result.passedSubtitle') : t('quiz.result.failedSubtitle')}
        </Text>
      </View>

      <View className="w-full flex-row flex-wrap gap-3 mb-6">
        <Card variant="filled" theme="light" padding="md" className="flex-1 items-center">
          <View className="mb-2">
            <CheckCircle size={24} color="#22C55E" />
          </View>
          <Text className="text-xl font-sans-bold text-slate-800">{result.score}%</Text>
          <Text className="text-xs text-slate-500 mt-1">{t('quiz.result.score')}</Text>
        </Card>
        <Card variant="filled" theme="light" padding="md" className="flex-1 items-center">
          <View className="mb-2">
            <CheckCircle size={24} color="#2563EB" />
          </View>
          <Text className="text-xl font-sans-bold text-slate-800">
            {result.correct}/{result.total_questions}
          </Text>
          <Text className="text-xs text-slate-500 mt-1">{t('quiz.result.correctOfTotal')}</Text>
        </Card>
      </View>

      <Button fullWidth onPress={onContinue} size="lg">
        {t('common.continue')}
      </Button>
      {result.can_retake && onRetry && (
        <Button fullWidth variant="outline" onPress={onRetry} size="lg" className="mt-3">
          {t('common.retry')}
        </Button>
      )}
    </View>
  );
};
