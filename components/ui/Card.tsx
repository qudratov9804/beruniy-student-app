import React from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-white/10 rounded-3xl border border-white/15',
  elevated: 'bg-white/12 rounded-3xl border border-white/20',
  outlined: 'bg-white/8 rounded-3xl border border-white/20',
  filled: 'bg-white/8 rounded-3xl',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <View
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </View>
  );
};
