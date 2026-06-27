import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import type { QuizOption as IQuizOption } from '@/types';

interface QuizOptionProps {
  option: IQuizOption;
  selected: boolean;
  showResult?: boolean;
  isCorrectOption?: boolean;
  onSelect: (optionId: string) => void;
  index: number;
}

const letters = ['A', 'B', 'C', 'D'];

export const QuizOption: React.FC<QuizOptionProps> = ({
  option,
  selected,
  showResult = false,
  isCorrectOption = false,
  onSelect,
  index,
}) => {
  const isCorrect = showResult && isCorrectOption;
  const isWrong = showResult && selected && !isCorrectOption;

  let containerStyle = 'bg-white border-2 border-slate-200';
  let textStyle = 'text-slate-700';
  let letterStyle = 'bg-slate-100 text-slate-500';

  if (selected && !showResult) {
    containerStyle = 'bg-primary-50 border-2 border-primary-500';
    textStyle = 'text-primary-700';
    letterStyle = 'bg-primary-500 text-white';
  } else if (isCorrect) {
    containerStyle = 'bg-green-50 border-2 border-green-500';
    textStyle = 'text-green-700';
    letterStyle = 'bg-green-500 text-white';
  } else if (isWrong) {
    containerStyle = 'bg-red-50 border-2 border-red-500';
    textStyle = 'text-red-700';
    letterStyle = 'bg-red-500 text-white';
  }

  return (
    <TouchableOpacity
      onPress={() => !showResult && onSelect(option.id)}
      activeOpacity={showResult ? 1 : 0.8}
      disabled={showResult}
      className={`flex-row items-center p-4 rounded-2xl mb-3 ${containerStyle}`}
    >
      <View className={`w-8 h-8 rounded-xl items-center justify-center mr-3 ${letterStyle}`}>
        <Text className="text-sm font-sans-bold">{letters[index] ?? index + 1}</Text>
      </View>
      <Text className={`flex-1 text-base font-sans-medium ${textStyle}`}>{option.text}</Text>
      {isCorrect && <Check size={20} color="#22C55E" />}
      {isWrong && <X size={20} color="#EF4444" />}
    </TouchableOpacity>
  );
};
