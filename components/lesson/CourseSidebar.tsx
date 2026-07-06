import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { X, ChevronDown, ChevronRight, Lock, Play, CheckCircle } from 'lucide-react-native';
import type { Module, SectionLesson } from '@/types';

interface CourseSidebarProps {
  visible: boolean;
  onClose: () => void;
  courseTitle: string;
  categoryName?: string | null;
  modules: Module[];
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
  modules,
  currentLessonId,
  unlockedLessonIds,
  completedLessonIds,
  onSelectLesson,
}: CourseSidebarProps) {
  const currentModule = modules.find((m) => m.lessons.some((l) => l.id === currentLessonId));
  const [expanded, setExpanded] = useState<Record<number, boolean>>(() =>
    currentModule ? { [currentModule.id]: true } : {}
  );

  const toggleModule = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
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
            {modules.map((module, index) => {
              const isOpen = !!expanded[module.id];
              const isModuleCompleted = module.lessons.every(
                (l) => l.is_completed || completedLessonIds.has(l.id)
              );
              return (
                <View key={module.id} className="border-b border-slate-100">
                  <TouchableOpacity
                    onPress={() => toggleModule(module.id)}
                    className="flex-row items-center justify-between px-5 py-4"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center flex-1 pr-3 gap-2">
                      {isModuleCompleted && <CheckCircle size={15} color="#22C55E" />}
                      <Text className="flex-1 text-sm font-sans-semibold text-slate-700" numberOfLines={2}>
                        {index + 1}-modul: {module.title}
                      </Text>
                    </View>
                    {isOpen ? (
                      <ChevronDown size={18} color="#64748B" />
                    ) : (
                      <ChevronRight size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>

                  {isOpen &&
                    module.lessons.map((lesson) => {
                      const isCurrent = lesson.id === currentLessonId;
                      const isCompleted = lesson.is_completed || completedLessonIds.has(lesson.id);
                      const isUnlocked = unlockedLessonIds.has(lesson.id) || lesson.is_preview;
                      return (
                        <TouchableOpacity
                          key={lesson.id}
                          disabled={!isUnlocked}
                          onPress={() => onSelectLesson(lesson)}
                          className={`flex-row items-center gap-3 px-5 py-3 pl-8 ${
                            isCurrent ? 'bg-primary-50' : ''
                          }`}
                          activeOpacity={0.7}
                        >
                          <View className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center">
                            {isCompleted ? (
                              <CheckCircle size={15} color="#22C55E" />
                            ) : !isUnlocked ? (
                              <Lock size={13} color="#94A3B8" />
                            ) : (
                              <Play size={13} color="#2563EB" />
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
                    })}
                </View>
              );
            })}
            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
