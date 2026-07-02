import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  isPassword = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = !!error;

  return (
    <View className="mb-4">
      {label && <Text className="mb-2 text-sm font-sans-semibold text-white/80">{label}</Text>}
      <View
        className={`flex-row items-center border rounded-2xl bg-white/85 px-4 ${
          hasError ? 'border-red-400' : 'border-white/40'
        } ${props.editable === false ? 'opacity-60' : ''}`}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          className="flex-1 h-12 text-slate-900 text-base"
          placeholderTextColor="#94A3B8"
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={isPassword ? 'none' : props.autoCapitalize}
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity onPress={() => setShowPassword((p) => !p)} className="ml-2">
            {showPassword ? (
              <EyeOff size={20} color="#94A3B8" />
            ) : (
              <Eye size={20} color="#94A3B8" />
            )}
          </TouchableOpacity>
        ) : (
          rightIcon && <View className="ml-2">{rightIcon}</View>
        )}
      </View>
      {hasError && <Text className="mt-1 text-xs text-red-400">{error}</Text>}
      {hint && !hasError && <Text className="mt-1 text-xs text-white/50">{hint}</Text>}
    </View>
  );
};
