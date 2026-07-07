import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Star,
  Users,
  Clock,
  BookOpen,
  Lock,
  Play,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  Wallet,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCourse, useEnrollCourse, useEnrollmentDetail } from '@/hooks/useCourses';
import { useInitiatePayment } from '@/hooks/usePayments';
import { useReviews, useReviewsSummary, useCreateReview } from '@/hooks/useReviews';
import { Badge, ProgressBar, Skeleton } from '@/components/ui';
import { HtmlText } from '@/components/common/HtmlText';
import { ScreenBackground } from '@/components/common/ScreenBackground';
import { AITutor } from '@/components/common/AITutor';
import { LessonTypeIcon } from '@/components/lesson';
import {
  formatPrice,
  formatDate,
  paymentProviderLabels,
  lessonTypeLabels,
  groupLessonsByModule,
  LESSON_SLOT_ORDER,
} from '@/utils';
import type { PaymentProvider, SectionLesson } from '@/types';

const levelLabels: Record<string, string> = {
  beginner: "Boshlang'ich",
  intermediate: "O'rta",
  advanced: 'Yuqori',
};

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: course, isLoading, refetch: refetchCourse } = useCourse(id);
  const { data: enrollmentDetail, refetch: refetchEnrollmentDetail } = useEnrollmentDetail(
    course?.id ?? 0
  );

  useFocusEffect(
    useCallback(() => {
      refetchCourse();
      // `refetch` ignores the query's `enabled` flag, so guard it manually —
      // otherwise this fires with courseId=0 before `course` has loaded.
      if (course?.id) refetchEnrollmentDetail();
    }, [refetchCourse, refetchEnrollmentDetail, course?.id])
  );

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('payme');

  const enrollMutation = useEnrollCourse({
    onSuccess: () => setFeedback({ type: 'success', msg: 'Kursga muvaffaqiyatli yozildingiz!' }),
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message ?? 'Kursga yozilishda xatolik yuz berdi.';
      setFeedback({ type: 'error', msg });
    },
  });

  const initiatePaymentMutation = useInitiatePayment({
    onSuccess: (payment) => {
      setPaymentModalVisible(false);
      router.push({
        pathname: '/payment/[transactionId]',
        params: {
          transactionId: payment.transaction_id,
          paymentUrl: payment.payment_url,
          courseSlug: id,
          courseId: String(course!.id),
        },
      });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message ?? "To'lovni boshlashda xatolik yuz berdi.";
      setFeedback({ type: 'error', msg });
    },
  });

  const { data: reviewsData } = useReviews(course?.id ?? 0, { sort: 'newest' });
  const { data: reviewsSummary } = useReviewsSummary(course?.id ?? 0);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const createReviewMutation = useCreateReview(course?.id ?? 0, {
    onSuccess: () => {
      setReviewModalVisible(false);
      setReviewTitle('');
      setReviewBody('');
      setReviewRating(5);
      setReviewError(null);
      setFeedback({ type: 'success', msg: "Sharhingiz uchun rahmat! U moderatsiyadan so'ng ko'rinadi." });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      const status = e?.response?.status;
      const msg =
        status === 403
          ? "Sharh qoldirish uchun kursga yozilgan bo'lishingiz kerak."
          : status === 409
            ? 'Siz bu kursga allaqachon sharh yozgansiz.'
            : (e?.response?.data?.message ?? 'Sharh yuborishda xatolik yuz berdi.');
      setReviewError(msg);
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
  const isEnrolled = !!enrollment || course.is_enrolled === true;
  const progressPercent = enrollment?.progress_percent ?? 0;

  // Lessons unlock in order: a lesson is playable once the previous one is completed.
  // The course-detail sections endpoint doesn't return per-lesson completion, so we
  // derive the unlock boundary from the enrollment's `next_lesson` pointer instead.
  const allLessons = (course.sections ?? []).flatMap((section) => section.lessons ?? []);
  const nextLessonId = enrollmentDetail?.next_lesson?.id;
  const nextLessonIndex =
    nextLessonId != null ? allLessons.findIndex((lesson) => lesson.id === nextLessonId) : -1;
  const unlockedLessonIds = new Set<number>(
    nextLessonIndex >= 0
      ? allLessons.slice(0, nextLessonIndex + 1).map((lesson) => lesson.id)
      : enrollmentDetail && !enrollmentDetail.next_lesson
        ? allLessons.map((lesson) => lesson.id) // no next lesson left => course fully completed
        : []
  );
  const completedLessonIds = new Set<number>(
    nextLessonIndex >= 0
      ? allLessons.slice(0, nextLessonIndex).map((lesson) => lesson.id)
      : enrollmentDetail && !enrollmentDetail.next_lesson
        ? allLessons.map((lesson) => lesson.id)
        : []
  );

  const handleEnroll = () => {
    setFeedback(null);
    if (course.is_free) {
      enrollMutation.mutate({ courseId: course.id, slug: id });
      return;
    }
    setPaymentModalVisible(true);
  };

  const handleStartPayment = () => {
    setFeedback(null);
    initiatePaymentMutation.mutate({
      course_id: course.id,
      provider: selectedProvider,
      subscription_type: 'lifetime',
    });
  };

  const handleContinue = () => {
    const nextLesson = enrollmentDetail?.next_lesson;
    if (nextLesson) {
      router.push(`/lesson/${nextLesson.id}?courseId=${course.id}&courseSlug=${id}`);
    }
  };

  const handleSubmitReview = () => {
    setReviewError(null);
    createReviewMutation.mutate({
      rating: reviewRating,
      title: reviewTitle.trim() || undefined,
      body: reviewBody.trim() || undefined,
    });
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
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/courses'))}
              style={styles.backBtn}
            >
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
              <View
                style={[
                  styles.feedbackBanner,
                  feedback.type === 'success' ? styles.feedbackOk : styles.feedbackErr,
                ]}
              >
                <View
                  style={[
                    styles.feedbackIconWrap,
                    { backgroundColor: feedback.type === 'success' ? 'rgba(52,211,153,0.18)' : 'rgba(248,113,113,0.18)' },
                  ]}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 size={18} color="#34d399" />
                  ) : (
                    <AlertTriangle size={18} color="#f87171" />
                  )}
                </View>
                <Text
                  style={[
                    styles.feedbackText,
                    { color: feedback.type === 'success' ? '#6ee7b7' : '#fca5a5' },
                  ]}
                >
                  {feedback.msg}
                </Text>
                <TouchableOpacity onPress={() => setFeedback(null)} style={styles.feedbackClose}>
                  <X size={14} color="rgba(255,255,255,0.55)" />
                </TouchableOpacity>
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
                      {enrollMutation.isPending
                        ? 'Yozilmoqda...'
                        : course.is_free
                          ? 'Kursga yozilish'
                          : "Sotib olish"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* What you'll learn / requirements / includes */}
          {(course.what_you_learn?.length ||
            course.requirements?.length ||
            course.includes?.length) ? (
            <View style={styles.infoLists}>
              {!!course.what_you_learn?.length && (
                <View style={styles.infoBlock}>
                  <Text style={styles.sectionsTitle}>Nimalarni o'rganasiz</Text>
                  {course.what_you_learn.map((item, i) => (
                    <View key={i} style={styles.infoRow}>
                      <CheckCircle2 size={15} color="#34d399" />
                      <Text style={styles.infoText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
              {!!course.requirements?.length && (
                <View style={styles.infoBlock}>
                  <Text style={styles.sectionsTitle}>Talablar</Text>
                  {course.requirements.map((item, i) => (
                    <View key={i} style={styles.infoRow}>
                      <Text style={styles.infoBullet}>•</Text>
                      <Text style={styles.infoText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
              {!!course.includes?.length && (
                <View style={styles.infoBlock}>
                  <Text style={styles.sectionsTitle}>Kursga nimalar kiradi</Text>
                  {course.includes.map((item, i) => (
                    <View key={i} style={styles.infoRow}>
                      <CheckCircle2 size={15} color="#60a5fa" />
                      <Text style={styles.infoText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : null}

          {/* Full description */}
          {course.description && (
            <View style={styles.infoLists}>
              <View style={styles.infoBlock}>
                <Text style={styles.sectionsTitle}>Kurs haqida</Text>
                <HtmlText html={course.description} baseFontSize={14} color="rgba(255,255,255,0.70)" />
              </View>
            </View>
          )}

          {/* Darslar — flat "Dars N" list, each collapsible (no Bo'lim wrapper) */}
          {(() => {
            const sections = course.sections;
            if (!sections || sections.length === 0) return null;

            const allLessonsForGrouping = sections.flatMap((section) => section.lessons ?? []);
            const { modules, legacy } = groupLessonsByModule(allLessonsForGrouping);
            if (modules.length === 0 && legacy.length === 0) return null;

            const moduleWithNextLesson = modules.find((mod) =>
              Object.values(mod.items).some((lesson) => lesson?.id === nextLessonId)
            );
            const defaultOpenModuleId = moduleWithNextLesson?.id ?? modules[0]?.id;

            const renderLessonRow = (lesson: SectionLesson) => {
              const isUnlocked = isEnrolled
                ? unlockedLessonIds.has(lesson.id) || lesson.is_preview
                : lesson.is_preview;
              return (
                <TouchableOpacity
                  key={lesson.id}
                  onPress={() => {
                    if (!isUnlocked) return;
                    router.push(`/lesson/${lesson.id}?courseId=${course.id}&courseSlug=${id}`);
                  }}
                  style={styles.lessonRow}
                  activeOpacity={0.7}
                >
                  <View style={styles.lessonIcon}>
                    {lesson.is_completed || completedLessonIds.has(lesson.id) ? (
                      <CheckCircle size={18} color="#34d399" />
                    ) : !isUnlocked ? (
                      <Lock size={16} color="rgba(255,255,255,0.30)" />
                    ) : (
                      <LessonTypeIcon type={lesson.type} size={16} color="#60a5fa" />
                    )}
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonTitle, !isUnlocked && styles.lessonLocked]}>
                      {lessonTypeLabels[lesson.type]} · {lesson.title}
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
              );
            };

            return (
              <View style={styles.sections}>
                <Text style={styles.sectionsTitle}>Darslar</Text>
                {modules.map((mod) => {
                  const isOpen = expandedModules[mod.id] ?? mod.id === defaultOpenModuleId;
                  return (
                    <View key={mod.id} style={styles.sectionBlock}>
                      <TouchableOpacity
                        onPress={() =>
                          setExpandedModules((prev) => ({
                            ...prev,
                            [mod.id]: !(prev[mod.id] ?? mod.id === defaultOpenModuleId),
                          }))
                        }
                        style={styles.sectionHeader}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.sectionTitle}>{`Dars ${mod.title}`}</Text>
                        {isOpen ? (
                          <ChevronDown size={16} color="rgba(255,255,255,0.45)" />
                        ) : (
                          <ChevronRight size={16} color="rgba(255,255,255,0.45)" />
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
              </View>
            );
          })()}

          {/* AI Tutor */}
          <View style={{ marginHorizontal: 20, marginTop: 8 }}>
            <AITutor courseId={course.id} courseSlug={id} sections={course.sections} variant="dark" />
          </View>

          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionsTitle}>Sharhlar</Text>
              {isEnrolled && (
                <TouchableOpacity
                  onPress={() => setReviewModalVisible(true)}
                  style={styles.writeReviewBtn}
                >
                  <Star size={13} color="#fbbf24" />
                  <Text style={styles.writeReviewBtnText}>Sharh qoldirish</Text>
                </TouchableOpacity>
              )}
            </View>

            {reviewsSummary && reviewsSummary.total > 0 && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryAvg}>{Number(reviewsSummary.avg_rating).toFixed(1)}</Text>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={12}
                        color="#fbbf24"
                        fill={n <= Math.round(reviewsSummary.avg_rating) ? '#fbbf24' : 'transparent'}
                      />
                    ))}
                  </View>
                  <Text style={styles.summaryTotal}>{reviewsSummary.total} ta sharh</Text>
                </View>
                <View style={styles.summaryBars}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewsSummary.distribution?.[String(star)] ?? 0;
                    const pct = reviewsSummary.total > 0 ? (count / reviewsSummary.total) * 100 : 0;
                    return (
                      <View key={star} style={styles.barRow}>
                        <Text style={styles.barLabel}>{star}★</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { width: `${pct}%` }]} />
                        </View>
                        <Text style={styles.barCount}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {reviewsData?.data && reviewsData.data.length > 0 ? (
              reviewsData.data.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      {review.user.avatar ? (
                        <Image
                          source={review.user.avatar}
                          style={{ width: 34, height: 34 }}
                          contentFit="cover"
                        />
                      ) : (
                        <Text style={styles.reviewAvatarInitial}>{review.user.name?.[0] ?? '?'}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewUserName}>{review.user.name}</Text>
                      <View style={{ flexDirection: 'row', gap: 1 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={11}
                            color="#fbbf24"
                            fill={n <= review.rating ? '#fbbf24' : 'transparent'}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
                  </View>
                  {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}
                  {review.body && <Text style={styles.reviewBody}>{review.body}</Text>}
                  {review.instructor_reply && (
                    <View style={styles.instructorReply}>
                      <Text style={styles.instructorReplyLabel}>O'qituvchi javobi:</Text>
                      <Text style={styles.instructorReplyText}>{review.instructor_reply}</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noReviews}>
                Hozircha sharhlar yo'q. Birinchi bo'lib sharh qoldiring!
              </Text>
            )}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Payment provider modal */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity
              onPress={() => setPaymentModalVisible(false)}
              style={styles.closeBtn}
            >
              <X size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>To'lov usulini tanlang</Text>
            <Text style={styles.modalSub}>
              {course.title} — {formatPrice(course.effective_price)}
            </Text>

            <View style={styles.providerRow}>
              {(['payme', 'click'] as PaymentProvider[]).map((provider) => (
                <TouchableOpacity
                  key={provider}
                  onPress={() => setSelectedProvider(provider)}
                  style={[
                    styles.providerBtn,
                    selectedProvider === provider && styles.providerBtnActive,
                  ]}
                >
                  <Wallet
                    size={18}
                    color={selectedProvider === provider ? '#60a5fa' : 'rgba(255,255,255,0.55)'}
                  />
                  <Text
                    style={[
                      styles.providerBtnText,
                      selectedProvider === provider && styles.providerBtnTextActive,
                    ]}
                  >
                    {paymentProviderLabels[provider]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleStartPayment}
              disabled={initiatePaymentMutation.isPending}
              style={[styles.submitBtn, initiatePaymentMutation.isPending && styles.btnDisabled]}
            >
              <Text style={styles.btnPrimaryText}>
                {initiatePaymentMutation.isPending ? 'Boshlanmoqda...' : "To'lovga o'tish"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Write review modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity
              onPress={() => setReviewModalVisible(false)}
              style={styles.closeBtn}
            >
              <X size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Sharh qoldiring</Text>
            <Text style={styles.modalSub}>{course.title}</Text>

            <View style={styles.starsPickerRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setReviewRating(n)}>
                  <Star
                    size={32}
                    color="#fbbf24"
                    fill={n <= reviewRating ? '#fbbf24' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewTitleInput}
              value={reviewTitle}
              onChangeText={setReviewTitle}
              placeholder="Sarlavha (ixtiyoriy)"
              placeholderTextColor="rgba(255,255,255,0.35)"
              maxLength={255}
            />
            <TextInput
              style={styles.reviewBodyInput}
              value={reviewBody}
              onChangeText={setReviewBody}
              placeholder="Fikringizni yozing (ixtiyoriy)..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {reviewError && (
              <View style={styles.reviewErrorBanner}>
                <AlertTriangle size={14} color="#f87171" />
                <Text style={styles.reviewErrorText}>{reviewError}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSubmitReview}
              disabled={createReviewMutation.isPending}
              style={[styles.submitBtn, createReviewMutation.isPending && styles.btnDisabled]}
            >
              <Text style={styles.btnPrimaryText}>
                {createReviewMutation.isPending ? 'Yuborilmoqda...' : 'Yuborish'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 16, padding: 12, marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  feedbackOk: { backgroundColor: 'rgba(16,185,129,0.14)', borderColor: 'rgba(52,211,153,0.35)' },
  feedbackErr: { backgroundColor: 'rgba(239,68,68,0.14)', borderColor: 'rgba(248,113,113,0.35)' },
  feedbackIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  feedbackText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 18 },
  feedbackClose: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  // CTA
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  price: { color: '#60a5fa', fontSize: 22, fontWeight: '800' },
  btnPrimary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#2563eb', borderRadius: 16, height: 50,
  },
  btnDisabled: { backgroundColor: 'rgba(37,99,235,0.45)' },
  btnPrimaryText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  // Info lists (what you'll learn / requirements / includes / description)
  infoLists: { paddingHorizontal: 20, marginBottom: 8 },
  infoBlock: { marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  infoBullet: { color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 19 },
  infoText: { flex: 1, color: 'rgba(255,255,255,0.70)', fontSize: 13, lineHeight: 19 },
  // Sections
  sections: { paddingHorizontal: 20 },
  sectionsTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  sectionBlock: { marginBottom: 10 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8,
  },
  sectionTitle: { flex: 1, color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', marginRight: 8 },
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
  // Payment modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    width: '100%', maxWidth: 390,
    backgroundColor: 'rgba(15,23,42,0.97)',
    borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    padding: 24,
  },
  closeBtn: {
    position: 'absolute', top: 14, right: 14,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 6, paddingRight: 30 },
  modalSub: { color: 'rgba(255,255,255,0.50)', fontSize: 13, marginBottom: 20 },
  providerRow: { flexDirection: 'row', gap: 12, marginBottom: 22 },
  providerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 52, borderRadius: 14, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.05)',
  },
  providerBtnActive: { borderColor: '#60a5fa', backgroundColor: 'rgba(37,99,235,0.15)' },
  providerBtnText: { color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: '600' },
  providerBtnTextActive: { color: '#60a5fa' },
  submitBtn: {
    backgroundColor: '#2563eb', borderRadius: 14, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  // Reviews
  reviewsSection: { paddingHorizontal: 20, marginTop: 24 },
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  writeReviewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(251,191,36,0.35)',
    backgroundColor: 'rgba(251,191,36,0.12)',
    paddingHorizontal: 12, paddingVertical: 7,
  },
  writeReviewBtnText: { color: '#fbbf24', fontSize: 12, fontWeight: '700' },
  summaryCard: {
    flexDirection: 'row', gap: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    padding: 16, marginBottom: 16,
  },
  summaryLeft: { alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 70 },
  summaryAvg: { color: '#ffffff', fontSize: 30, fontWeight: '800' },
  summaryTotal: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 },
  summaryBars: { flex: 1, justifyContent: 'center', gap: 5 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 11, width: 24 },
  barTrack: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.10)', overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3, backgroundColor: '#fbbf24' },
  barCount: { color: 'rgba(255,255,255,0.40)', fontSize: 10, width: 22, textAlign: 'right' },
  reviewCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    padding: 14, marginBottom: 12,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(37,99,235,0.25)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  reviewAvatarInitial: { color: '#60a5fa', fontSize: 14, fontWeight: '700' },
  reviewUserName: { color: '#ffffff', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  reviewDate: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  reviewTitle: { color: '#ffffff', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  reviewBody: { color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 19 },
  instructorReply: {
    marginTop: 10, padding: 10, borderRadius: 12,
    backgroundColor: 'rgba(96,165,250,0.10)', borderWidth: 1, borderColor: 'rgba(96,165,250,0.20)',
  },
  instructorReplyLabel: { color: '#93c5fd', fontSize: 11, fontWeight: '700', marginBottom: 3 },
  instructorReplyText: { color: 'rgba(255,255,255,0.70)', fontSize: 12, lineHeight: 17 },
  noReviews: { color: 'rgba(255,255,255,0.40)', fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  // Write review modal
  starsPickerRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 18 },
  reviewTitleInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 13, paddingVertical: 10, color: '#ffffff', fontSize: 13, marginBottom: 10,
  },
  reviewBodyInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 13, paddingVertical: 10, color: '#ffffff', fontSize: 13,
    minHeight: 90, marginBottom: 12,
  },
  reviewErrorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(239,68,68,0.14)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.30)',
    borderRadius: 12, padding: 10, marginBottom: 12,
  },
  reviewErrorText: { color: '#fca5a5', fontSize: 12, fontWeight: '600', flex: 1 },
});
