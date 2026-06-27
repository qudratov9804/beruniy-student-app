import React from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-white rounded-3xl shadow-sm shadow-slate-200',
  elevated: 'bg-white rounded-3xl shadow-md shadow-slate-300',
  outlined: 'bg-white rounded-3xl border border-slate-200',
  filled: 'bg-slate-50 rounded-3xl',
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
