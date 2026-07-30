import React from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  // 'dark' is the glassmorphism look used over ScreenBackground (course detail, home);
  // 'light' is for plain white screens (quiz, assignment) — the dark variants are
  // white-opacity overlays that are invisible on a white background.
  theme?: 'dark' | 'light';
}

const variantStylesByTheme = {
  dark: {
    default: 'bg-white/10 rounded-3xl border border-white/15',
    elevated: 'bg-white/12 rounded-3xl border border-white/20',
    outlined: 'bg-white/8 rounded-3xl border border-white/20',
    filled: 'bg-white/8 rounded-3xl',
  },
  light: {
    default: 'bg-white rounded-3xl border border-slate-200',
    elevated: 'bg-white rounded-3xl border border-slate-200',
    outlined: 'bg-transparent rounded-3xl border border-slate-200',
    filled: 'bg-slate-50 rounded-3xl',
  },
} as const;

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  theme = 'dark',
  className,
  children,
  ...props
}) => {
  return (
    <View
      className={`${variantStylesByTheme[theme][variant]} ${paddingStyles[padding]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </View>
  );
};
