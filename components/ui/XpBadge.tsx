import React from 'react';
import { View, Text } from 'react-native';
import { Star } from 'lucide-react-native';

interface XpBadgeProps {
  xp: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { icon: 14, text: 'text-sm', padding: 'px-2 py-1' },
  md: { icon: 18, text: 'text-base', padding: 'px-3 py-1.5' },
  lg: { icon: 24, text: 'text-xl', padding: 'px-4 py-2' },
};

export const XpBadge: React.FC<XpBadgeProps> = ({ xp, size = 'md' }) => {
  const { icon, text, padding } = sizeConfig[size];
  return (
    <View className={`flex-row items-center gap-1 bg-purple-100 rounded-2xl ${padding}`}>
      <Star size={icon} color="#9333EA" fill="#9333EA" />
      <Text className={`font-sans-bold text-purple-600 ${text}`}>{xp} XP</Text>
    </View>
  );
};
