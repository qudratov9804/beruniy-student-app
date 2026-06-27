import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  ChevronLeft, Star, Users, Clock, BookOpen,
  Lock, Play, CheckCircle,
} from 'lucide-react-native';
import { useCourse, useCourseSections, useEnrollCourse } from '@/hooks/useCourses';
import { Button, Badge, ProgressBar, XpBadge, Skeleton } from '@/components/ui';
import { formatDuration, formatPrice } from '@/utils';
import type { Lesson } from '@/types';

const levelLabels: Record<string, string> = {
  beginner: 'Boshlang\'ich', intermediate: 'O\'rta', advanced: 'Yuqori',
};
const levelVariants: Record<string, 'success' | 'warning' | 'danger'> = {
  beginner: 'success', intermediate: 'warning', advanced: 'danger',
};

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: course, isLoading } = useCourse(id);
  const { data: sections } = useCourseSections(id);
  const enrollMutation = useEnrollCourse();

  if (isLoading || !course) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 pt-4">
          <Skeleton height={200} borderRadius={16} className="mb-4" />
          <Skeleton width="80%" height={24} className="mb-2" />
          <Skeleton width="60%" height={16} className="mb-4" />
        </View>
      </SafeAreaView>
    );
  }

  const handleEnroll = () => enrollMutation.mutate(id);
  const handleContinue = () => {
    const firstIncomplete = sections?.flatMap((s) => s.lessons).find((l) => !l.isCompleted);
    if (firstIncomplete) router.push(`/lesson/${firstIncomplete.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="relative">
          <Image
            source={course.thumbnail || 'https://picsum.photos/400/220'}
            style={{ width: '100%', height: 220 }}
            contentFit="cover"
          />
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 bg-black/40 rounded-full items-center justify-center"
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="px-5 py-5">
          {/* Badges */}
          <View className="flex-row gap-2 mb-3">
            <Badge variant={levelVariants[course.level]} size="sm">{levelLabels[course.level]}</Badge>
            {course.isFree && <Badge variant="success" size="sm">Bepul</Badge>}
          </View>

          <Text className="text-xl font-sans-bold text-slate-800 mb-2">{course.title}</Text>
          <Text className="text-sm text-slate-500 mb-4 leading-5">{course.description}</Text>

          {/* Stats row */}
          <View className="flex-row flex-wrap gap-4 py-3 border-t border-b border-slate-100 mb-4">
            {[
              { icon: <Star size={14} color="#F59E0B" fill="#F59E0B" />, value: course.rating.toFixed(1) },
              { icon: <Users size={14} color="#94A3B8" />, value: `${course.studentsCount} o'quvchi` },
              { icon: <BookOpen size={14} color="#94A3B8" />, value: `${course.lessonsCount} dars` },
              { icon: <Clock size={14} color="#94A3B8" />, value: formatDuration(course.duration) },
            ].map(({ icon, value }, i) => (
              <View key={i} className="flex-row items-center gap-1">
                {icon}
                <Text className="text-xs text-slate-600 font-sans-medium">{value}</Text>
              </View>
            ))}
          </View>

          {/* Instructor */}
          <View className="flex-row items-center gap-3 mb-5">
            <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
              <Text className="text-primary-600 font-sans-bold">{course.instructor.firstName[0]}</Text>
            </View>
            <View>
              <Text className="text-sm font-sans-semibold text-slate-700">
                {course.instructor.firstName} {course.instructor.lastName}
              </Text>
              <Text className="text-xs text-slate-400">{course.instructor.title}</Text>
            </View>
          </View>

          {/* Progress (if enrolled) */}
          {course.isEnrolled && course.progress && (
            <View className="bg-primary-50 rounded-2xl p-4 mb-5">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-sans-semibold text-primary-700">Siz o'qimoqdasiz</Text>
                <Text className="text-sm text-primary-600">{course.progress.percentage}%</Text>
              </View>
              <ProgressBar progress={course.progress.percentage} height={8} />
              <Text className="text-xs text-slate-500 mt-2">
                {course.progress.completedLessons}/{course.progress.totalLessons} dars tugatildi
              </Text>
            </View>
          )}

          {/* CTA */}
          <View className="flex-row items-center gap-3 mb-6">
            {course.isEnrolled ? (
              <Button fullWidth size="lg" onPress={handleContinue}>
                Davom etish
              </Button>
            ) : (
              <>
                <View className="flex-1">
                  <Text className="text-2xl font-sans-bold text-primary-600">
                    {formatPrice(course.price)}
                  </Text>
                </View>
                <Button
                  size="lg"
                  onPress={handleEnroll}
                  loading={enrollMutation.isPending}
                  className="flex-1"
                >
                  Yozilish
                </Button>
              </>
            )}
          </View>

          <XpBadge xp={course.xpReward} size="md" />
        </View>

        {/* Sections */}
        {sections && sections.length > 0 && (
          <View className="px-5 pb-8">
            <Text className="text-base font-sans-bold text-slate-800 mb-3">Kurs dasturi</Text>
            {sections.map((section) => (
              <View key={section.id} className="mb-4">
                <Text className="text-sm font-sans-semibold text-slate-700 mb-2">
                  {section.title}
                </Text>
                {section.lessons.map((lesson: Lesson) => (
                  <TouchableOpacity
                    key={lesson.id}
                    onPress={() => course.isEnrolled && !lesson.isFree ? undefined : router.push(`/lesson/${lesson.id}`)}
                    className="flex-row items-center py-3 border-b border-slate-100"
                  >
                    <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3">
                      {lesson.isCompleted ? (
                        <CheckCircle size={18} color="#22C55E" />
                      ) : !course.isEnrolled && !lesson.isFree ? (
                        <Lock size={16} color="#94A3B8" />
                      ) : (
                        <Play size={16} color="#2563EB" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className={`text-sm font-sans-medium ${!course.isEnrolled && !lesson.isFree ? 'text-slate-400' : 'text-slate-700'}`}>
                        {lesson.title}
                      </Text>
                      <Text className="text-xs text-slate-400">{formatDuration(lesson.duration)}</Text>
                    </View>
                    <XpBadge xp={lesson.xpReward} size="sm" />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
