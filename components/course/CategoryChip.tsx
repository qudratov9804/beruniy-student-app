import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import type { Category } from '@/types';

interface CategoryChipProps {
  category: Category;
  selected?: boolean;
  onPress?: (category: Category) => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ category, selected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress?.(category)}
      activeOpacity={0.8}
      className={`mr-2 px-4 py-2 rounded-2xl border ${
        selected ? 'bg-primary-600 border-primary-600' : 'bg-white/10 border-white/20'
      }`}
    >
      <Text className={`text-sm font-sans-semibold ${selected ? 'text-white' : 'text-white/80'}`}>
        {category.icon} {category.name}
      </Text>
    </TouchableOpacity>
  );
};
