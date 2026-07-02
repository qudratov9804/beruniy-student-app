import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
  AlertCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCourse, useEnrollCourse, useEnrollmentDetail } from '@/hooks/useCourses';
import { Badge, ProgressBar, Skeleton } from '@/components/ui';
import { HtmlText } from '@/components/common/HtmlText';
import { ScreenBackground } from '@/components/common/ScreenBackground';
import { formatPrice } from '@/utils';
import type { SectionLesson } from '@/types';

const levelLabels: Record<string, string> = {
  beginner: "Boshlang'ich",
  intermediate: "O'rta",
  advanced: 'Yuqori',
};

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: course, isLoading } = useCourse(id);
  const { data: enrollmentDetail } = useEnrollmentDetail(course?.id ?? 0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const enrollMutation = useEnrollCourse({
    onSuccess: () => setFeedback({ type: 'success', msg: 'Kursga muvaffaqiyatli yozildingiz!' }),
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message ?? 'Kursga yozilishda xatolik yuz berdi.';
      setFeedback({ type: 'error', msg });
    },
  });

  if (isLoading || !course) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.skeletonWrap}>
            <Skeleton height={200} borderRadius={16} className="mb-4" />
            <Skeleton width="80%" height={24} className="mb-2" />
            <Skeleton width="60%" height={16} className="mb-4" />
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const enrollment = enrollmentDetail?.enrollment;
  const isEnrolled = course.is_enrolled ?? !!enrollment;
  const progressPercent = enrollment?.progress_percent ?? 0;

  const handleEnroll = () => {
    setFeedback(null);
    enrollMutation.mutate({ courseId: course.id, slug: id });
  };

  const handleContinue = () => {
    const nextLesson = enrollmentDetail?.next_lesson;
    if (nextLesson) {
      router.push(`/lesson/${nextLesson.id}?courseId=${course.id}`);
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero thumbnail */}
          <View style={styles.hero}>
            <Image
              source={course.thumbnail || 'https://picsum.photos/400/220'}
              style={styles.heroImg}
              contentFit="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(15,23,42,0.90)']}
              style={StyleSheet.absoluteFill}
            />
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {/* Badges */}
            <View style={styles.badgeRow}>
              <Badge variant="warning" size="sm">{levelLabels[course.level]}</Badge>
              {course.is_free && <Badge variant="success" size="sm">Bepul</Badge>}
            </View>

            <Text style={styles.title}>{course.title}</Text>
            {course.short_description && (
              <HtmlText html={course.short_description} baseFontSize={14} color="rgba(255,255,255,0.65)" />
            )}

            {/* Stats */}
            <View style={styles.statsRow}>
              {[
                { icon: <Star size={14} color="#F59E0B" fill="#F59E0B" />, value: Number(course.rating).toFixed(1) },
                { icon: <Users size={14} color="#60a5fa" />, value: `${course.enrolled_count} o'quvchi` },
                { icon: <BookOpen size={14} color="#60a5fa" />, value: `${course.lessons_count} dars` },
                { icon: <Clock size={14} color="#60a5fa" />, value: `${Number(course.duration_hours).toFixed(1)}h` },
              ].map(({ icon, value }, i) => (
                <View key={i} style={styles.statItem}>
                  {icon}
                  <Text style={styles.statText}>{value}</Text>
                </View>
              ))}
            </View>

            {/* Instructor */}
            <View style={styles.instructorRow}>
              <View style={styles.instructorAvatar}>
                {course.instructor.avatar ? (
                  <Image source={course.instructor.avatar} style={styles.avatarImg} contentFit="cover" />
                ) : (
                  <Text style={styles.avatarInitial}>{course.instructor.name[0]}</Text>
                )}
              </View>
              <View>
                <Text style={styles.instructorName}>{course.instructor.name}</Text>
                {course.instructor.headline && (
                  <Text style={styles.instructorHeadline}>{course.instructor.headline}</Text>
                )}
              </View>
            </View>

            {/* Progress if enrolled */}
            {isEnrolled && progressPercent > 0 && (
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Siz o'qimoqdasiz</Text>
                  <Text style={styles.progressPct}>{progressPercent}%</Text>
                </View>
                <ProgressBar progress={progressPercent} height={8} />
              </View>
            )}

            {/* Feedback banner */}
            {feedback && (
              <View style={[styles.feedbackBanner, feedback.type === 'success' ? styles.feedbackOk : styles.feedbackErr]}>
                <AlertCircle size={16} color={feedback.type === 'success' ? '#34d399' : '#f87171'} />
                <Text style={[styles.feedbackText, { color: feedback.type === 'success' ? '#34d399' : '#f87171' }]}>
                  {feedback.msg}
                </Text>
              </View>
            )}

            {/* CTA */}
            <View style={styles.ctaRow}>
              {isEnrolled ? (
                <TouchableOpacity onPress={handleContinue} style={styles.btnPrimary}>
                  <Play size={18} color="#fff" />
                  <Text style={styles.btnPrimaryText}>Davom etish</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <View>
                    <Text style={styles.price}>{formatPrice(course.effective_price)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleEnroll}
                    disabled={enrollMutation.isPending}
                    style={[styles.btnPrimary, enrollMutation.isPending && styles.btnDisabled]}
                  >
                    <Text style={styles.btnPrimaryText}>
                      {enrollMutation.isPending ? 'Yozilmoqda...' : 'Kursga yozilish'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Sections */}
          {course.sections && course.sections.length > 0 && (
            <View style={styles.sections}>
              <Text style={styles.sectionsTitle}>Kurs dasturi</Text>
              {course.sections.map((section) => (
                <View key={section.id} style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.lessons.map((lesson: SectionLesson) => (
                    <TouchableOpacity
                      key={lesson.id}
                      onPress={() => {
                        if (!lesson.is_preview && !isEnrolled) return;
                        router.push(`/lesson/${lesson.id}?courseId=${course.id}`);
                      }}
                      style={styles.lessonRow}
                      activeOpacity={0.7}
                    >
                      <View style={styles.lessonIcon}>
                        {lesson.is_completed ? (
                          <CheckCircle size={18} color="#34d399" />
                        ) : !isEnrolled && !lesson.is_preview ? (
                          <Lock size={16} color="rgba(255,255,255,0.30)" />
                        ) : (
                          <Play size={16} color="#60a5fa" />
                        )}
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text style={[styles.lessonTitle, !isEnrolled && !lesson.is_preview && styles.lessonLocked]}>
                          {lesson.title}
                        </Text>
                        <Text style={styles.lessonDuration}>
                          {Math.round(lesson.duration_seconds / 60)} min
                        </Text>
                      </View>
                      {lesson.is_preview && !isEnrolled && (
                        <View style={styles.previewBadge}>
                          <Text style={styles.previewBadgeText}>Bepul ko'rish</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  skeletonWrap: { padding: 20 },
  // Hero
  hero: { width: '100%', height: 220, position: 'relative' },
  heroImg: { width: '100%', height: 220 },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  // Body
  body: { padding: 20 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  title: { color: '#ffffff', fontSize: 20, fontWeight: '700', lineHeight: 28, marginBottom: 8 },
  // Stats
  statsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    paddingVertical: 14,
    borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: 16,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '500' },
  // Instructor
  instructorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  instructorAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(37,99,235,0.25)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 44, height: 44 },
  avatarInitial: { color: '#60a5fa', fontSize: 18, fontWeight: '700' },
  instructorName: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  instructorHeadline: { color: 'rgba(255,255,255,0.45)', fontSize: 12 },
  // Progress
  progressCard: {
    backgroundColor: 'rgba(37,99,235,0.15)',
    borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.25)',
    padding: 14, marginBottom: 16,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: '#93c5fd', fontSize: 13, fontWeight: '600' },
  progressPct: { color: '#60a5fa', fontSize: 13 },
  // Feedback
  feedbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, padding: 12, marginBottom: 14,
    borderWidth: 1,
  },
  feedbackOk: { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(52,211,153,0.30)' },
  feedbackErr: { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(248,113,113,0.30)' },
  feedbackText: { fontSize: 13, fontWeight: '500', flex: 1 },
  // CTA
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  price: { color: '#60a5fa', fontSize: 22, fontWeight: '800' },
  btnPrimary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#2563eb', borderRadius: 16, height: 50,
  },
  btnDisabled: { backgroundColor: 'rgba(37,99,235,0.45)' },
  btnPrimaryText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  // Sections
  sections: { paddingHorizontal: 20 },
  sectionsTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  sectionBlock: { marginBottom: 18 },
  sectionTitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  lessonRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  lessonIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  lessonInfo: { flex: 1 },
  lessonTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500' },
  lessonLocked: { color: 'rgba(255,255,255,0.30)' },
  lessonDuration: { color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 2 },
  previewBadge: {
    backgroundColor: 'rgba(16,185,129,0.18)',
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(52,211,153,0.30)',
    paddingHorizontal: 8, paddingVertical: 3,
  },
  previewBadgeText: { color: '#34d399', fontSize: 10, fontWeight: '700' },
});
