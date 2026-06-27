import React from 'react';
import { View, Text } from 'react-native';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'streak' | 'xp';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const badgeStyles: Record<BadgeVariant, { container: string; text: string }> = {
  primary: { container: 'bg-blue-100', text: 'text-blue-700' },
  success: { container: 'bg-green-100', text: 'text-green-700' },
  warning: { container: 'bg-amber-100', text: 'text-amber-700' },
  danger: { container: 'bg-red-100', text: 'text-red-700' },
  info: { container: 'bg-sky-100', text: 'text-sky-700' },
  streak: { container: 'bg-orange-100', text: 'text-orange-600' },
  xp: { container: 'bg-purple-100', text: 'text-purple-700' },
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', size = 'md' }) => {
  const { container, text } = badgeStyles[variant];
  return (
    <View
      className={`rounded-full self-start ${container} ${size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1'}`}
    >
      <Text className={`font-sans-semibold ${text} ${size === 'sm' ? 'text-xs' : 'text-xs'}`}>
        {children}
      </Text>
    </View>
  );
};
