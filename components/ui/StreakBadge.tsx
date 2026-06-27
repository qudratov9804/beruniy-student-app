import React from 'react';
import { View, Text } from 'react-native';
import { Flame } from 'lucide-react-native';

interface StreakBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { icon: 14, text: 'text-sm', padding: 'px-2 py-1' },
  md: { icon: 18, text: 'text-base', padding: 'px-3 py-1.5' },
  lg: { icon: 24, text: 'text-xl', padding: 'px-4 py-2' },
};

export const StreakBadge: React.FC<StreakBadgeProps> = ({ count, size = 'md' }) => {
  const { icon, text, padding } = sizeConfig[size];
  return (
    <View className={`flex-row items-center gap-1 bg-orange-100 rounded-2xl ${padding}`}>
      <Flame size={icon} color="#F97316" />
      <Text className={`font-sans-bold text-orange-500 ${text}`}>{count}</Text>
    </View>
  );
};
