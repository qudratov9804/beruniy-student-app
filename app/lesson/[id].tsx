import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, CheckCircle, BookOpen, Video } from 'lucide-react-native';
import { lessonsService } from '@/services/api';
import { Button, Skeleton } from '@/components/ui';
import { HtmlText } from '@/components/common/HtmlText';
import { QUERY_KEYS } from '@/constants/config';

export default function LessonScreen() {
  const { id, courseId } = useLocalSearchParams<{ id: string; courseId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const lessonId = Number(id);
  const cId = Number(courseId);

  const { data: lesson, isLoading } = useQuery({
    queryKey: QUERY_KEYS.LESSONS.DETAIL(cId, lessonId),
    queryFn: () => lessonsService.getById(cId, lessonId),
    enabled: !!lessonId && !!cId,
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      lessonsService.saveProgress(cId, lessonId, { watch_seconds: 0, is_completed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.PROGRESS(cId) });
      router.back();
    },
  });

  if (isLoading || !lesson) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 pt-4">
          <Skeleton height={200} borderRadius={16} className="mb-4" />
          <Skeleton height={24} width="80%" className="mb-3" />
          <Skeleton height={14} className="mb-2" />
          <Skeleton height={14} width="90%" />
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = lesson.progress?.is_completed ?? false;
  const durationMin = Math.round(lesson.duration_seconds / 60);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-5 py-4 border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-3">
          <ChevronLeft size={28} color="#0F172A" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-sans-bold text-slate-800" numberOfLines={1}>
            {lesson.title}
          </Text>
          <Text className="text-xs text-slate-400">
            {lesson.type === 'video' ? '🎬 Video' : '📖 Matn'} · {durationMin} min
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {lesson.type === 'video' ? (
          <View className="mt-4 bg-slate-900 rounded-3xl h-56 items-center justify-center mb-6">
            <Video size={48} color="#FFFFFF" />
            <Text className="text-white mt-2 text-sm">Video pleer</Text>
          </View>
        ) : (
          <View className="mt-4 mb-6">
            <View className="w-full h-32 bg-primary-50 rounded-3xl items-center justify-center mb-4">
              <BookOpen size={40} color="#2563EB" />
            </View>
          </View>
        )}

        <Text className="text-xl font-sans-bold text-slate-800 mb-3">{lesson.title}</Text>

        {lesson.content && (
          <HtmlText html={lesson.content} baseFontSize={15} color="#334155" />
        )}

        <View className="h-24" />
      </ScrollView>

      <View className="px-5 pb-6 pt-3 border-t border-slate-100">
        {lesson.type === 'quiz' ? (
          <Button fullWidth size="lg" onPress={() => router.push(`/quiz/${lesson.id}?courseId=${courseId}`)}>
            Testni boshlash
          </Button>
        ) : (
          <Button
            fullWidth
            size="lg"
            onPress={() => completeMutation.mutate()}
            loading={completeMutation.isPending}
            disabled={isCompleted}
            icon={isCompleted ? <CheckCircle size={20} color="#fff" /> : undefined}
          >
            {isCompleted ? 'Tugatildi' : 'Tugatdim'}
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}
