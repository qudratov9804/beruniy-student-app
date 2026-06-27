import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type TouchableOpacityProps,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary-600 active:bg-primary-700 border-primary-700',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-primary-100 active:bg-primary-200 border-primary-200',
    text: 'text-primary-700',
  },
  outline: { container: 'bg-transparent border-2 border-primary-600', text: 'text-primary-600' },
  ghost: { container: 'bg-transparent border-transparent', text: 'text-primary-600' },
  danger: { container: 'bg-red-500 active:bg-red-600 border-red-600', text: 'text-white' },
  success: { container: 'bg-green-500 active:bg-green-600 border-green-600', text: 'text-white' },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'h-9 px-4 rounded-xl', text: 'text-sm font-medium' },
  md: { container: 'h-12 px-6 rounded-2xl', text: 'text-base font-semibold' },
  lg: { container: 'h-14 px-8 rounded-2xl', text: 'text-lg font-bold' },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  disabled,
  className,
  ...props
}) => {
  const { container, text } = variantStyles[variant];
  const { container: sizeContainer, text: sizeText } = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center border ${container} ${sizeContainer} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'secondary' || variant === 'ghost'
              ? '#2563EB'
              : '#fff'
          }
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View className="mr-2">{icon}</View>}
          <Text className={`${text} ${sizeText} font-sans-semibold`}>{children}</Text>
          {icon && iconPosition === 'right' && <View className="ml-2">{icon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};
