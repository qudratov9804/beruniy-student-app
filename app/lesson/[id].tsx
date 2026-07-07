import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, CheckCircle, Clock, AlertTriangle, Menu } from 'lucide-react-native';
import { lessonsService } from '@/services/api';
import { Button, Skeleton } from '@/components/ui';
import { VideoPlayer, CourseSidebar, LessonTypeIcon, TranscriptPanel } from '@/components/lesson';
import { HtmlText } from '@/components/common/HtmlText';
import { EmptyState } from '@/components/common/EmptyState';
import { AITutor } from '@/components/common/AITutor';
import { useCourse, useEnrollmentDetail } from '@/hooks/useCourses';
import { QUERY_KEYS } from '@/constants/config';
import { lessonTypeLabels } from '@/utils';
import type { SectionLesson, VideoPlayerHandle } from '@/types';

const getErrorMessage = (err: unknown): string => {
  const e = err as { response?: { status?: number; data?: { message?: string } } };
  if (e?.response?.status === 403) {
    return "Bu darsni ko'rish uchun kursga yozilgan bo'lishingiz kerak.";
  }
  return e?.response?.data?.message ?? 'Darsni yuklashda xatolik yuz berdi.';
};

const noRetryOnAuthError = (failureCount: number, err: unknown) => {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 401 || status === 403 || status === 404) return false;
  return failureCount < 2;
};

export default function LessonScreen() {
  const { id, courseId, courseSlug } = useLocalSearchParams<{
    id: string;
    courseId: string;
    courseSlug?: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const lessonId = Number(id);
  const cId = Number(courseId);

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { data: course } = useCourse(courseSlug ?? '');
  const { data: enrollmentDetail } = useEnrollmentDetail(cId);

  // Same lock/complete derivation as the course-detail screen: lessons unlock in
  // order, boundary comes from the enrollment's `next_lesson` pointer.
  const allLessons = (course?.sections ?? []).flatMap((section) => section.lessons ?? []);
  const nextLessonId = enrollmentDetail?.next_lesson?.id;
  const nextLessonIndex =
    nextLessonId != null ? allLessons.findIndex((l) => l.id === nextLessonId) : -1;
  const unlockedLessonIds = new Set<number>(
    nextLessonIndex >= 0
      ? allLessons.slice(0, nextLessonIndex + 1).map((l) => l.id)
      : enrollmentDetail && !enrollmentDetail.next_lesson
        ? allLessons.map((l) => l.id)
        : []
  );
  const completedLessonIds = new Set<number>(
    nextLessonIndex >= 0
      ? allLessons.slice(0, nextLessonIndex).map((l) => l.id)
      : enrollmentDetail && !enrollmentDetail.next_lesson
        ? allLessons.map((l) => l.id)
        : []
  );

  const handleSelectLesson = (selected: SectionLesson) => {
    setSidebarVisible(false);
    if (selected.id === lessonId) return;
    router.replace(`/lesson/${selected.id}?courseId=${cId}&courseSlug=${courseSlug ?? ''}`);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else if (courseSlug) {
      router.replace(`/course/${courseSlug}`);
    } else {
      router.replace('/(tabs)/my-courses');
    }
  };

  const {
    data: lesson,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.LESSONS.DETAIL(cId, lessonId),
    queryFn: () => lessonsService.getById(cId, lessonId),
    enabled: !!lessonId && !!cId,
    retry: noRetryOnAuthError,
  });

  const isVideoReady = lesson?.type === 'video' && lesson.video_status === 'ready';

  const {
    data: stream,
    isLoading: streamLoading,
    isFetching: streamIsFetching,
    isError: streamIsError,
    error: streamError,
    refetch: refetchStream,
  } = useQuery({
    queryKey: QUERY_KEYS.LESSONS.STREAM(cId, lessonId),
    queryFn: () => lessonsService.getStreamUrl(cId, lessonId),
    enabled: isVideoReady,
    staleTime: 1000 * 60 * 60 * 3,
    retry: noRetryOnAuthError,
  });

  const [videoPlaybackError, setVideoPlaybackError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);

  // The signed stream URL can expire well before the query's staleTime elapses,
  // leaving a cached-but-dead URL in place with no visible error. `streamIsFetching`
  // (rather than extra state) covers the render-side "still loading" case while
  // this refetch is in flight.
  useEffect(() => {
    const expired = !!stream && new Date(stream.expires_at).getTime() <= Date.now();
    if (expired) refetchStream();
  }, [stream, refetchStream]);

  // Reset the playback error whenever a new stream URL arrives, computed during
  // render (React's documented pattern for adjusting state on a prop change)
  // rather than in an effect, which would cause an extra render/commit cycle.
  const [prevStreamUrl, setPrevStreamUrl] = useState(stream?.stream_url);
  if (stream?.stream_url !== prevStreamUrl) {
    setPrevStreamUrl(stream?.stream_url);
    setVideoPlaybackError(false);
  }

  const completeMutation = useMutation({
    mutationFn: (watchSeconds: number) =>
      lessonsService.saveProgress(cId, lessonId, { watch_seconds: watchSeconds, is_completed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LESSONS.DETAIL(cId, lessonId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.PROGRESS(cId) });
    },
  });

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-5 py-4">
          <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
            <ChevronLeft size={28} color="#0F172A" />
          </TouchableOpacity>
        </View>
        <EmptyState
          emoji="😕"
          title={getErrorMessage(error)}
          actionLabel="Qayta urinish"
          onAction={() => refetch()}
        />
      </SafeAreaView>
    );
  }

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
        <TouchableOpacity onPress={handleBack} className="p-2 -ml-2 mr-3">
          <ChevronLeft size={28} color="#0F172A" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-sans-bold text-slate-800" numberOfLines={1}>
            {lesson.title}
          </Text>
          <View className="flex-row items-center gap-1">
            <LessonTypeIcon type={lesson.type} size={12} color="#94A3B8" />
            <Text className="text-xs text-slate-400">
              {lessonTypeLabels[lesson.type]} · {durationMin} min
            </Text>
          </View>
        </View>
        {course?.sections && course.sections.length > 0 && (
          <TouchableOpacity onPress={() => setSidebarVisible(true)} className="p-2 -mr-2 ml-2">
            <Menu size={22} color="#0F172A" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {lesson.type === 'video' ? (
          <View className="mt-4 mb-6">
            {lesson.video_status === 'ready' ? (
              streamIsError || videoPlaybackError ? (
                <View className="bg-slate-900 rounded-3xl h-56 items-center justify-center gap-3 px-6">
                  <AlertTriangle size={36} color="#f87171" />
                  <Text className="text-white text-sm text-center">
                    {videoPlaybackError
                      ? 'Videoni ijro etishda xatolik yuz berdi.'
                      : getErrorMessage(streamError)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setVideoPlaybackError(false);
                      refetchStream();
                    }}
                  >
                    <Text className="text-primary-300 text-sm font-sans-semibold">
                      Qayta urinish
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : streamLoading || streamIsFetching || !stream ? (
                <View className="bg-slate-900 rounded-3xl h-56 items-center justify-center">
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              ) : (
                <VideoPlayer
                  ref={videoPlayerRef}
                  url={stream.stream_url}
                  cookies={stream.cookies}
                  onEnd={() => {
                    if (!isCompleted) completeMutation.mutate(lesson.duration_seconds);
                  }}
                  onError={() => setVideoPlaybackError(true)}
                  onTimeUpdate={setCurrentTime}
                />
              )
            ) : lesson.video_status === 'processing' ? (
              <View className="bg-slate-900 rounded-3xl h-56 items-center justify-center gap-3 px-6">
                <ActivityIndicator size="large" color="#60A5FA" />
                <Text className="text-white text-sm text-center">
                  Video hozircha tayyorlanmoqda. Birozdan so'ng qayta urinib ko'ring.
                </Text>
              </View>
            ) : lesson.video_status === 'failed' ? (
              <View className="bg-slate-900 rounded-3xl h-56 items-center justify-center gap-3 px-6">
                <AlertTriangle size={36} color="#f87171" />
                <Text className="text-white text-sm text-center">
                  Videoni yuklashda xatolik yuz berdi.
                </Text>
              </View>
            ) : (
              <View className="bg-slate-900 rounded-3xl h-56 items-center justify-center gap-3 px-6">
                <Clock size={36} color="rgba(255,255,255,0.5)" />
                <Text className="text-white/70 text-sm text-center">Video hali mavjud emas.</Text>
              </View>
            )}
          </View>
        ) : (
          <View className="mt-4 mb-6">
            <View className="w-full h-32 bg-primary-50 rounded-3xl items-center justify-center mb-4">
              <LessonTypeIcon type={lesson.type} size={40} color="#2563EB" />
            </View>
          </View>
        )}

        <Text className="text-xl font-sans-bold text-slate-800 mb-3">{lesson.title}</Text>

        {lesson.content && (
          <HtmlText html={lesson.content} baseFontSize={15} color="#334155" />
        )}

        {lesson.type === 'video' && lesson.video_status === 'ready' && (
          <TranscriptPanel
            courseId={cId}
            lessonId={lessonId}
            currentTime={currentTime}
            onSeek={(seconds) => videoPlayerRef.current?.seekTo(seconds)}
          />
        )}

        <View className="mb-6">
          <AITutor courseId={cId} courseSlug={courseSlug ?? ''} sections={course?.sections} variant="light" />
        </View>

        <View className="h-24" />
      </ScrollView>

      <View className="px-5 pb-6 pt-3 border-t border-slate-100">
        {lesson.type === 'quiz' ? (
          <Button fullWidth size="lg" onPress={() => router.push(`/quiz/${lesson.id}?courseId=${courseId}`)}>
            Testni boshlash
          </Button>
        ) : lesson.type === 'assignment' ? (
          <Button
            fullWidth
            size="lg"
            onPress={() => router.push(`/assignment/${lesson.id}?courseId=${courseId}`)}
          >
            Topshiriqni ko'rish
          </Button>
        ) : (
          <Button
            fullWidth
            size="lg"
            onPress={async () => {
              await completeMutation.mutateAsync(lesson.duration_seconds);
              handleBack();
            }}
            loading={completeMutation.isPending}
            disabled={isCompleted}
            icon={isCompleted ? <CheckCircle size={20} color="#fff" /> : undefined}
          >
            {isCompleted ? 'Tugatildi' : 'Tugatdim'}
          </Button>
        )}
      </View>

      {course?.sections && course.sections.length > 0 && (
        <CourseSidebar
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          courseTitle={course.title}
          categoryName={course.category?.name}
          sections={course.sections}
          currentLessonId={lessonId}
          unlockedLessonIds={unlockedLessonIds}
          completedLessonIds={completedLessonIds}
          onSelectLesson={handleSelectLesson}
        />
      )}
    </SafeAreaView>
  );
}
