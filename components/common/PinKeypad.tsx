import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

interface PinKeypadProps {
  onPress: (digit: string) => void;
  variant?: 'dark' | 'light';
}

export const PinKeypad: React.FC<PinKeypadProps> = ({ onPress, variant = 'light' }) => {
  const isDark = variant === 'dark';

  return (
    <View className="flex-row flex-wrap">
      {DIGITS.map((d, i) => (
        // Each key sits in a fixed 1/3-width cell instead of relying on flex-wrap to
        // fit 3 fixed-size (w-20) buttons per row on its own — on narrower phones that
        // math didn't add up and the grid wrapped after 2 keys instead of 3.
        <View key={i} style={{ width: '33.333%' }} className="items-center justify-center mb-4">
          <TouchableOpacity
            onPress={() => onPress(d)}
            disabled={d === ''}
            className={`w-20 h-20 rounded-full items-center justify-center ${
              d === '' ? 'opacity-0' : isDark ? 'bg-white/10 border border-white/15' : 'bg-slate-100 active:bg-slate-200'
            }`}
          >
            <Text
              className={`text-2xl font-sans-bold ${
                d === '⌫'
                  ? isDark
                    ? 'text-white/60'
                    : 'text-slate-600'
                  : isDark
                    ? 'text-white'
                    : 'text-slate-800'
              }`}
            >
              {d}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};
