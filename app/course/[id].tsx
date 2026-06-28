import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  ChevronLeft,
  Star,
  Users,
  Clock,
  BookOpen,
  Lock,
  Play,
  CheckCircle,
} from 'lucide-react-native';
import { useCourse, useEnrollCourse, useEnrollmentDetail } from '@/hooks/useCourses';
import { Button, Badge, ProgressBar, Skeleton } from '@/components/ui';
import { HtmlText } from '@/components/common/HtmlText';
import { formatPrice } from '@/utils';
import type { SectionLesson } from '@/types';

const levelLabels: Record<string, string> = {
  beginner: "Boshlang'ich",
  intermediate: "O'rta",
  advanced: 'Yuqori',
};
const levelVariants: Record<string, 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: course, isLoading } = useCourse(id);
  const { data: enrollmentDetail } = useEnrollmentDetail(course?.id ?? 0);
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

  const enrollment = enrollmentDetail?.enrollment;
  const isEnrolled = course.is_enrolled ?? !!enrollment;
  const progressPercent = enrollment?.progress_percent ?? 0;

  const handleEnroll = () => enrollMutation.mutate(course.id);
  const handleContinue = () => {
    const nextLesson = enrollmentDetail?.next_lesson;
    if (nextLesson) {
      router.push(`/lesson/${nextLesson.id}?courseId=${course.id}`);
    }
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
            <Badge variant={levelVariants[course.level]} size="sm">
              {levelLabels[course.level]}
            </Badge>
            {course.is_free && (
              <Badge variant="success" size="sm">
                Bepul
              </Badge>
            )}
          </View>

          <Text className="text-xl font-sans-bold text-slate-800 mb-2">{course.title}</Text>
          {course.short_description && (
            <HtmlText html={course.short_description} baseFontSize={14} color="#64748B" />
          )}

          {/* Stats row */}
          <View className="flex-row flex-wrap gap-4 py-3 border-t border-b border-slate-100 mb-4">
            {[
              {
                icon: <Star size={14} color="#F59E0B" fill="#F59E0B" />,
                value: Number(course.rating).toFixed(1),
              },
              {
                icon: <Users size={14} color="#94A3B8" />,
                value: `${course.enrolled_count} o'quvchi`,
              },
              {
                icon: <BookOpen size={14} color="#94A3B8" />,
                value: `${course.lessons_count} dars`,
              },
              {
                icon: <Clock size={14} color="#94A3B8" />,
                value: `${Number(course.duration_hours).toFixed(1)}h`,
              },
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
              {course.instructor.avatar ? (
                <Image
                  source={course.instructor.avatar}
                  style={{ width: 40, height: 40 }}
                  contentFit="cover"
                />
              ) : (
                <Text className="text-primary-600 font-sans-bold">
                  {course.instructor.name[0]}
                </Text>
              )}
            </View>
            <View>
              <Text className="text-sm font-sans-semibold text-slate-700">
                {course.instructor.name}
              </Text>
              {course.instructor.headline && (
                <Text className="text-xs text-slate-400">{course.instructor.headline}</Text>
              )}
            </View>
          </View>

          {/* Progress (if enrolled) */}
          {isEnrolled && progressPercent > 0 && (
            <View className="bg-primary-50 rounded-2xl p-4 mb-5">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-sans-semibold text-primary-700">
                  Siz o'qimoqdasiz
                </Text>
                <Text className="text-sm text-primary-600">{progressPercent}%</Text>
              </View>
              <ProgressBar progress={progressPercent} height={8} />
            </View>
          )}

          {/* CTA */}
          <View className="flex-row items-center gap-3 mb-6">
            {isEnrolled ? (
              <Button fullWidth size="lg" onPress={handleContinue}>
                Davom etish
              </Button>
            ) : (
              <>
                <View className="flex-1">
                  <Text className="text-2xl font-sans-bold text-primary-600">
                    {formatPrice(course.effective_price)}
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
        </View>

        {/* Sections */}
        {course.sections && course.sections.length > 0 && (
          <View className="px-5 pb-8">
            <Text className="text-base font-sans-bold text-slate-800 mb-3">Kurs dasturi</Text>
            {course.sections.map((section) => (
              <View key={section.id} className="mb-4">
                <Text className="text-sm font-sans-semibold text-slate-700 mb-2">
                  {section.title}
                </Text>
                {section.lessons.map((lesson: SectionLesson) => (
                  <TouchableOpacity
                    key={lesson.id}
                    onPress={() => {
                      if (!lesson.is_preview && !isEnrolled) return;
                      router.push(`/lesson/${lesson.id}?courseId=${course.id}`);
                    }}
                    className="flex-row items-center py-3 border-b border-slate-100"
                  >
                    <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3">
                      {lesson.is_completed ? (
                        <CheckCircle size={18} color="#22C55E" />
                      ) : !isEnrolled && !lesson.is_preview ? (
                        <Lock size={16} color="#94A3B8" />
                      ) : (
                        <Play size={16} color="#2563EB" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-sans-medium ${!isEnrolled && !lesson.is_preview ? 'text-slate-400' : 'text-slate-700'}`}
                      >
                        {lesson.title}
                      </Text>
                      <Text className="text-xs text-slate-400">
                        {Math.round(lesson.duration_seconds / 60)} min
                      </Text>
                    </View>
                    {lesson.is_preview && !isEnrolled && (
                      <View className="bg-green-100 px-2 py-0.5 rounded-xl">
                        <Text className="text-xs text-green-700 font-sans-semibold">Bepul</Text>
                      </View>
                    )}
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
