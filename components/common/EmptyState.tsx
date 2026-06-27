import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => (
  <View className="flex-1 items-center justify-center py-16 px-8">
    <Text className="text-5xl mb-4">{emoji}</Text>
    <Text className="text-lg font-sans-bold text-slate-700 text-center mb-2">{title}</Text>
    {subtitle && <Text className="text-sm text-slate-400 text-center mb-6">{subtitle}</Text>}
    {actionLabel && onAction && <Button onPress={onAction}>{actionLabel}</Button>}
  </View>
);
