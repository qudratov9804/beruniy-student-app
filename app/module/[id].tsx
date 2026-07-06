import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Lock, Play, CheckCircle } from 'lucide-react-native';
import { useCourse, useCourseProgress } from '@/hooks/useCourses';
import { ScreenBackground } from '@/components/common/ScreenBackground';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui';
import { mergeLessonProgress, getAllModules, isModuleCompleted } from '@/utils';
import type { ModuleLesson } from '@/utils';

const lessonTypeLabels: Record<ModuleLesson['type'], string> = {
  video: 'Video dars',
  article: 'Nazariy dars',
  quiz: 'Test',
  assignment: 'Topshiriq',
};

export default function ModuleScreen() {
  const { id, courseId, courseSlug } = useLocalSearchParams<{
    id: string;
    courseId: string;
    courseSlug: string;
  }>();
  const router = useRouter();

  const { data: course, isLoading } = useCourse(courseSlug);
  const { data: courseProgress } = useCourseProgress(Number(courseId));

  if (isLoading || !course) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.skeletonWrap}>
            <Skeleton width="60%" height={24} className="mb-4" />
            <Skeleton height={64} borderRadius={16} className="mb-3" />
            <Skeleton height={64} borderRadius={16} className="mb-3" />
            <Skeleton height={64} borderRadius={16} />
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const modules = getAllModules(course);
  const progressLessons = courseProgress?.sections?.flatMap((section) => section.lessons) ?? [];

  const moduleIndex = modules.findIndex((m) => m.id === Number(id));
  const rawModule = modules[moduleIndex];
  const moduleLessons = rawModule ? mergeLessonProgress(rawModule.lessons, progressLessons) : [];
  const previousModule = moduleIndex > 0 ? modules[moduleIndex - 1] : undefined;
  const previousModuleLessons = previousModule
    ? mergeLessonProgress(previousModule.lessons, progressLessons)
    : [];
  const isModuleUnlocked =
    moduleIndex === 0 || (!!previousModule && isModuleCompleted(previousModuleLessons));

  if (!rawModule || !isModuleUnlocked) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <EmptyState
            emoji="🔒"
            title="Bu modul hali qulflangan"
            subtitle="Avvalgi modulni to'liq yakunlang."
          />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  // Within a module, lessons unlock strictly in order — no is_preview shortcut,
  // since finishing the video/nazariy in full is the point of this gate.
  const unlockedIndex = moduleLessons.findIndex((l) => !l.is_completed);
  const firstIncompleteIndex = unlockedIndex === -1 ? moduleLessons.length : unlockedIndex;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {moduleIndex + 1}-modul: {rawModule.title}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {moduleLessons.map((lesson, i) => {
            const isUnlocked = i <= firstIncompleteIndex;
            return (
              <TouchableOpacity
                key={lesson.id}
                onPress={() => {
                  if (!isUnlocked) return;
                  router.push(`/lesson/${lesson.id}?courseId=${courseId}&courseSlug=${courseSlug}`);
                }}
                style={styles.lessonCard}
                activeOpacity={0.7}
              >
                <View style={styles.lessonIcon}>
                  {lesson.is_completed ? (
                    <CheckCircle size={20} color="#34d399" />
                  ) : !isUnlocked ? (
                    <Lock size={18} color="rgba(255,255,255,0.30)" />
                  ) : (
                    <Play size={18} color="#60a5fa" />
                  )}
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonTitle, !isUnlocked && styles.lessonLocked]}>
                    {i + 1}. {lessonTypeLabels[lesson.type]}
                  </Text>
                  <Text style={styles.lessonDuration}>
                    {Math.round(lesson.duration_seconds / 60)} min
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  skeletonWrap: { padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  lessonCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    padding: 16,
  },
  lessonIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  lessonInfo: { flex: 1 },
  lessonTitle: { color: 'rgba(255,255,255,0.90)', fontSize: 15, fontWeight: '600' },
  lessonLocked: { color: 'rgba(255,255,255,0.35)' },
  lessonDuration: { color: 'rgba(255,255,255,0.40)', fontSize: 12, marginTop: 3 },
});
