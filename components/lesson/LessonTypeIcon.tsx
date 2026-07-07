import React from 'react';
import { Video, FileText, ListChecks, ClipboardList, LucideIcon } from 'lucide-react-native';
import type { LessonType } from '@/types';

const ICONS: Record<LessonType, LucideIcon> = {
  video: Video,
  article: FileText,
  quiz: ListChecks,
  assignment: ClipboardList,
};

interface LessonTypeIconProps {
  type: LessonType;
  size?: number;
  color?: string;
}

export function LessonTypeIcon({ type, size = 16, color = '#60a5fa' }: LessonTypeIconProps) {
  const Icon = ICONS[type] ?? Video;
  return <Icon size={size} color={color} />;
}
