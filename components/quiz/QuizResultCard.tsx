import React from 'react';
import { View, Text } from 'react-native';
import { Trophy, CheckCircle, XCircle } from 'lucide-react-native';
import { Card, Button } from '@/components/ui';
import type { QuizSubmitResult } from '@/types';

interface QuizResultCardProps {
  result: QuizSubmitResult;
  onContinue: () => void;
  onRetry?: () => void;
}

export const QuizResultCard: React.FC<QuizResultCardProps> = ({ result, onContinue, onRetry }) => {
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
          {result.passed ? 'Ajoyib!' : 'Qaytadan urining'}
        </Text>
        <Text className="text-base text-slate-500 text-center">
          {result.passed
            ? 'Siz testni muvaffaqiyatli topshirdingiz!'
            : "Yana bir marta ko'rib chiqing."}
        </Text>
      </View>

      <View className="w-full flex-row flex-wrap gap-3 mb-6">
        <Card variant="filled" padding="md" className="flex-1 items-center mr-2">
          <CheckCircle size={24} color="#22C55E" className="mb-2" />
          <Text className="text-xl font-sans-bold text-slate-800">{result.score}%</Text>
          <Text className="text-xs text-slate-500 mt-1">Ball</Text>
        </Card>
        <Card variant="filled" padding="md" className="flex-1 items-center ml-2">
          <CheckCircle size={24} color="#2563EB" className="mb-2" />
          <Text className="text-xl font-sans-bold text-slate-800">
            {result.correct}/{result.total_questions}
          </Text>
          <Text className="text-xs text-slate-500 mt-1">To'g'ri/Hammasi</Text>
        </Card>
      </View>

      <Button fullWidth onPress={onContinue} size="lg">
        Davom etish
      </Button>
      {!result.passed && result.can_retake && onRetry && (
        <Button fullWidth variant="outline" onPress={onRetry} size="lg" className="mt-3">
          Qaytadan urinish
        </Button>
      )}
    </View>
  );
};
