import React from 'react';
import { View, Text } from 'react-native';
import { PhoneInput } from 'react-native-phone-entry';

interface PhoneFieldProps {
  label?: string;
  error?: string;
  onChangeText: (phone: string) => void;
  autoFocus?: boolean;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({ label, error, onChangeText, autoFocus }) => {
  const hasError = !!error;

  return (
    <View className="mb-4">
      {label && <Text className="mb-2 text-sm font-sans-semibold text-white/80">{label}</Text>}
      <PhoneInput
        defaultValues={{ countryCode: 'UZ', callingCode: '+998', phoneNumber: '+998' }}
        isCallingCodeEditable={false}
        autoFocus={autoFocus}
        onChangeText={onChangeText}
        theme={{
          containerStyle: {
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: hasError ? '#f87171' : 'rgba(255,255,255,0.4)',
            height: 52,
          },
          flagButtonStyle: {
            borderRightWidth: 1,
            borderRightColor: 'rgba(148,163,184,0.4)',
          },
          codeTextStyle: {
            color: '#0f172a',
          },
          textInputStyle: {
            color: '#0f172a',
            fontSize: 16,
          },
        }}
      />
      {hasError && <Text className="mt-1 text-xs text-red-400">{error}</Text>}
    </View>
  );
};
