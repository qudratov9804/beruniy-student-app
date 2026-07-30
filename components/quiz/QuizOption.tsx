import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { HtmlText } from '@/components/common/HtmlText';

interface QuizOptionProps {
  text: string;
  selected: boolean;
  showResult?: boolean;
  isCorrectOption?: boolean;
  onSelect: () => void;
  index: number;
}

const letters = ['A', 'B', 'C', 'D'];

export const QuizOption: React.FC<QuizOptionProps> = ({
  text,
  selected,
  showResult = false,
  isCorrectOption = false,
  onSelect,
  index,
}) => {
  const isCorrect = showResult && isCorrectOption;
  const isWrong = showResult && selected && !isCorrectOption;

  let containerStyle = 'bg-white border-2 border-slate-200';
  let textColor = '#334155'; // slate-700
  let letterBg = 'bg-slate-100';
  let letterTextStyle = 'text-slate-500';

  if (selected && !showResult) {
    containerStyle = 'bg-primary-50 border-2 border-primary-500';
    textColor = '#1D4ED8'; // primary-700
    letterBg = 'bg-primary-500';
    letterTextStyle = 'text-white';
  } else if (isCorrect) {
    containerStyle = 'bg-green-50 border-2 border-green-500';
    textColor = '#15803D'; // green-700
    letterBg = 'bg-green-500';
    letterTextStyle = 'text-white';
  } else if (isWrong) {
    containerStyle = 'bg-red-50 border-2 border-red-500';
    textColor = '#B91C1C'; // red-700
    letterBg = 'bg-red-500';
    letterTextStyle = 'text-white';
  }

  return (
    <TouchableOpacity
      onPress={() => !showResult && onSelect()}
      activeOpacity={showResult ? 1 : 0.8}
      disabled={showResult}
      className={`flex-row items-center p-4 rounded-2xl mb-3 ${containerStyle}`}
    >
      <View className={`w-8 h-8 rounded-xl items-center justify-center mr-3 ${letterBg}`}>
        <Text className={`text-sm font-sans-bold ${letterTextStyle}`}>{letters[index] ?? index + 1}</Text>
      </View>
      <View className="flex-1" pointerEvents="none">
        <HtmlText html={text} baseFontSize={16} color={textColor} weight="medium" />
      </View>
      {isCorrect && <Check size={20} color="#22C55E" />}
      {isWrong && <X size={20} color="#EF4444" />}
    </TouchableOpacity>
  );
};
