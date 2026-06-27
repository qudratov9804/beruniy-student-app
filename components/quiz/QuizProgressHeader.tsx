import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { X, Heart } from 'lucide-react-native';
import { ProgressBar } from '@/components/ui';

interface QuizProgressHeaderProps {
  current: number;
  total: number;
  lives?: number;
  onClose: () => void;
}

export const QuizProgressHeader: React.FC<QuizProgressHeaderProps> = ({
  current,
  total,
  lives = 3,
  onClose,
}) => {
  const progress = (current / total) * 100;

  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <TouchableOpacity onPress={onClose} className="p-2">
        <X size={24} color="#94A3B8" />
      </TouchableOpacity>
      <View className="flex-1">
        <ProgressBar progress={progress} height={10} color="#2563EB" />
      </View>
      <View className="flex-row items-center gap-1">
        {Array.from({ length: lives }).map((_, i) => (
          <Heart key={i} size={20} color="#EF4444" fill="#EF4444" />
        ))}
      </View>
    </View>
  );
};
