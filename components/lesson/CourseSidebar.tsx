import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { X, ChevronDown, ChevronRight, Lock, CheckCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { SectionLesson } from '@/types';
import { groupLessonsByModule, LESSON_SLOT_ORDER } from '@/utils';
import { LessonTypeIcon } from './LessonTypeIcon';

interface CourseSidebarProps {
  visible: boolean;
  onClose: () => void;
  courseTitle: string;
  categoryName?: string | null;
  lessons: SectionLesson[];
  currentLessonId: number;
  unlockedLessonIds: Set<number>;
  completedLessonIds: Set<number>;
  onSelectLesson: (lesson: SectionLesson) => void;
}

export function CourseSidebar({
  visible,
  onClose,
  courseTitle,
  categoryName,
  lessons,
  currentLessonId,
  unlockedLessonIds,
  completedLessonIds,
  onSelectLesson,
}: CourseSidebarProps) {
  const { t } = useTranslation();
  const { modules, legacy } = groupLessonsByModule(lessons);
  const currentModule = modules.find((mod) =>
    Object.values(mod.items).some((lesson) => lesson?.id === currentLessonId)
  );
  const [expanded, setExpanded] = useState<Record<number, boolean>>(() =>
    currentModule ? { [currentModule.id]: true } : {}
  );

  const toggleModule = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderLessonRow = (lesson: SectionLesson) => {
    const isCurrent = lesson.id === currentLessonId;
    const isCompleted = lesson.is_completed || completedLessonIds.has(lesson.id);
    const isUnlocked = unlockedLessonIds.has(lesson.id) || lesson.is_preview;
    return (
      <TouchableOpacity
        key={lesson.id}
        disabled={!isUnlocked}
        onPress={() => onSelectLesson(lesson)}
        className={`flex-row items-center gap-3 px-5 py-3 pl-8 ${isCurrent ? 'bg-primary-50' : ''}`}
        activeOpacity={0.7}
      >
        <View className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center">
          {isCompleted ? (
            <CheckCircle size={15} color="#22C55E" />
          ) : !isUnlocked ? (
            <Lock size={13} color="#94A3B8" />
          ) : (
            <LessonTypeIcon type={lesson.type} size={13} color="#2563EB" />
          )}
        </View>
        <Text
          className={`flex-1 text-sm ${
            isCurrent
              ? 'font-sans-semibold text-primary-600'
              : isUnlocked
                ? 'text-slate-600'
                : 'text-slate-300'
          }`}
          numberOfLines={2}
        >
          {lesson.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 flex-row">
        <Pressable className="flex-1 bg-black/50" onPress={onClose} />
        <View className="w-[86%] max-w-sm bg-white h-full">
          <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-slate-100">
            <View className="flex-1 pr-3">
              {categoryName && (
                <Text className="text-xs font-sans-semibold text-primary-500 mb-1" numberOfLines={1}>
                  {categoryName}
                </Text>
              )}
              <Text className="text-base font-sans-bold text-slate-800" numberOfLines={2}>
                {courseTitle}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
              <X size={22} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {modules.map((mod) => {
              const isOpen = !!expanded[mod.id];
              return (
                <View key={mod.id} className="border-b border-slate-100">
                  <TouchableOpacity
                    onPress={() => toggleModule(mod.id)}
                    className="flex-row items-center justify-between px-5 py-4"
                    activeOpacity={0.7}
                  >
                    <Text className="flex-1 text-sm font-sans-semibold text-slate-700 pr-3" numberOfLines={2}>
                      {t('course.moduleLabel', { title: mod.title })}
                    </Text>
                    {isOpen ? (
                      <ChevronDown size={18} color="#64748B" />
                    ) : (
                      <ChevronRight size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>

                  {isOpen &&
                    LESSON_SLOT_ORDER.map((slotType) => {
                      const lesson = mod.items[slotType];
                      return lesson ? renderLessonRow(lesson) : null;
                    })}
                </View>
              );
            })}
            {legacy.map((lesson) => renderLessonRow(lesson))}
            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
