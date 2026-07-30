import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  BookOpen,
  GraduationCap,
  BarChart2,
  Laptop2,
  Briefcase,
  Award,
  Star,
  X,
  Send,
  Bot,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useEnrolledCourses } from '@/hooks/useCourses';
import { CourseCardSkeleton } from '@/components/ui';
import { ScreenBackground, AppHeader } from '@/components/common';
import { apiClient } from '@/services/api/client';

const ICON_SIZE = 54;

interface QuickDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  colors: readonly [string, string];
  onPress: () => void;
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: enrollments, isLoading: loadingCourses, refetch } = useEnrolledCourses();
  const [refreshing, setRefreshing] = React.useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const activeCourses =
    enrollments?.filter((e) => e.status === 'active' && e.progress_percent < 100) ?? [];

  const submitReview = async () => {
    if (rating === 0) { Alert.alert(t('common.error'), t('home.reviewModal.ratingRequired')); return; }
    if (!comment.trim()) { Alert.alert(t('common.error'), t('home.reviewModal.commentRequired')); return; }
    setSubmitting(true);
    try { await apiClient.post('/reviews', { rating, comment: comment.trim() }); } catch { /* ignore */ }
    setSubmitting(false);
    setSubmitted(true);
  };

  const closeReview = () => {
    setReviewVisible(false);
    setRating(0);
    setComment('');
    setSubmitted(false);
  };

  const quickItems: QuickDef[] = [
    {
      id: 'courses',
      label: t('home.quickLinks.courses'),
      icon: <BookOpen size={22} color="#fff" />,
      colors: ['#2563eb', '#3b82f6'],
      onPress: () => router.push('/(tabs)/courses'),
    },
    {
      id: 'my-courses',
      label: t('home.quickLinks.myCourses'),
      icon: <GraduationCap size={22} color="#fff" />,
      colors: ['#7c3aed', '#8b5cf6'],
      onPress: () => router.push('/(tabs)/my-courses'),
    },
    {
      id: 'progress',
      label: t('home.quickLinks.progress'),
      icon: <BarChart2 size={22} color="#fff" />,
      colors: ['#059669', '#10b981'],
      onPress: () => router.push('/(tabs)/progress'),
    },
    {
      id: 'ai',
      label: t('home.quickLinks.aiHelp'),
      icon: <Bot size={22} color="#fff" />,
      colors: ['#4338ca', '#6366f1'],
      onPress: () => router.push('/(tabs)/ai-chat'),
    },
    {
      id: 'it',
      label: t('home.quickLinks.itCourses'),
      icon: <Laptop2 size={22} color="#fff" />,
      colors: ['#db2777', '#ec4899'],
      onPress: () => router.push({ pathname: '/(tabs)/courses', params: { q: 'IT' } }),
    },
    {
      id: 'biznes',
      label: t('home.quickLinks.businessCourses'),
      icon: <Briefcase size={22} color="#fff" />,
      colors: ['#d97706', '#f59e0b'],
      onPress: () => router.push({ pathname: '/(tabs)/courses', params: { q: 'Biznes' } }),
    },
    {
      id: 'certificates',
      label: t('home.quickLinks.certificates'),
      icon: <Award size={22} color="#fff" />,
      colors: ['#0891b2', '#06b6d4'],
      onPress: () => router.push('/(tabs)/progress'),
    },
    {
      id: 'review',
      label: t('home.quickLinks.leaveReview'),
      icon: <Star size={22} color="#fff" />,
      colors: ['#dc2626', '#ef4444'],
      onPress: () => setReviewVisible(true),
    },
  ];

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1 bg-transparent">
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#60a5fa']} />
          }
        >
          <AppHeader subtitle={t('home.welcome')} title={user?.name ?? t('home.defaultName')} />

          {/* Hero Banner */}
          <LinearGradient
            colors={['#2563eb', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.circle1} pointerEvents="none" />
            <View style={styles.circle2} pointerEvents="none" />
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-white text-sm opacity-80">{t('home.phone')}</Text>
                <Text className="text-white text-lg font-sans-bold">{user?.phone ?? '—'}</Text>
              </View>
              <View style={styles.roleCard}>
                <Text className="text-white font-sans-semibold text-sm">
                  {user?.role === 'student' ? t('home.roleStudent') : t('home.roleInstructor')}
                </Text>
              </View>
            </View>
            <Text className="text-white opacity-70 text-sm mt-1">
              {t('home.activeCoursesCount', { count: activeCourses.length })}
            </Text>
          </LinearGradient>

          {/* Quick Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home.quickAccess')}</Text>
            <View style={styles.quickGrid}>
              {quickItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={item.onPress}
                  style={styles.quickItem}
                  activeOpacity={0.75}
                >
                  <LinearGradient
                    colors={item.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.quickIcon}
                  >
                    {item.icon}
                  </LinearGradient>
                  <Text style={styles.quickLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Active Courses */}
          {(activeCourses.length > 0 || loadingCourses) && (
            <View style={styles.section}>
              <View className="flex-row items-center justify-between mb-3">
                <Text style={styles.sectionTitle}>{t('home.continueCoursesTitle')}</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/courses')}
                  className="flex-row items-center gap-1"
                >
                  <Text className="text-blue-300 text-sm font-sans-semibold">{t('common.seeAll')}</Text>
                  <ChevronRight size={16} color="#93c5fd" />
                </TouchableOpacity>
              </View>
              {loadingCourses ? (
                <CourseCardSkeleton />
              ) : (
                <FlatList
                  data={activeCourses.slice(0, 5)}
                  keyExtractor={(item) => String(item.id)}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                  renderItem={({ item }) => (
                    <View style={styles.courseCard}>
                      <Text className="font-sans-semibold text-white" numberOfLines={2}>
                        {item.course?.title}
                      </Text>
                      <Text className="text-xs text-white/60 mt-2">
                        {t('home.percentDone', { percent: item.progress_percent })}
                      </Text>
                      <View className="h-2 bg-white/20 rounded-full mt-2">
                        <View
                          className="h-2 bg-blue-400 rounded-full"
                          style={{ width: `${item.progress_percent}%` }}
                        />
                      </View>
                    </View>
                  )}
                />
              )}
            </View>
          )}

          {/* Stats */}
          {enrollments && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('home.statistics')}</Text>
              <View className="flex-row flex-wrap gap-3">
                {[
                  {
                    label: t('home.activeCourses'),
                    value: enrollments.filter((e) => e.status === 'active').length,
                    icon: <BookOpen size={22} color="#60a5fa" />,
                    bg: 'bg-blue-500/20',
                  },
                  {
                    label: t('home.completed'),
                    value: enrollments.filter((e) => e.status === 'completed').length,
                    icon: <GraduationCap size={22} color="#34d399" />,
                    bg: 'bg-emerald-500/20',
                  },
                ].map(({ label, value, icon, bg }) => (
                  <View
                    key={label}
                    className="flex-1 min-w-[140px] bg-white/10 rounded-3xl p-4 border border-white/15"
                  >
                    <View className={`w-10 h-10 rounded-2xl ${bg} items-center justify-center mb-2`}>
                      {icon}
                    </View>
                    <Text className="text-xl font-sans-bold text-white">{value}</Text>
                    <Text className="text-xs text-white/60 mt-1">{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className="h-6" />
        </ScrollView>
      </SafeAreaView>

      {/* Review Modal */}
      <Modal visible={reviewVisible} transparent animationType="fade" onRequestClose={closeReview}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity onPress={closeReview} style={styles.closeBtn}>
              <X size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            {submitted ? (
              <View style={styles.successBox}>
                <Text style={styles.successEmoji}>🎉</Text>
                <Text style={styles.successTitle}>{t('home.reviewModal.successTitle')}</Text>
                <Text style={styles.successSub}>{t('home.reviewModal.successSubtitle')}</Text>
                <TouchableOpacity onPress={closeReview} style={styles.doneBtn}>
                  <Text style={styles.doneBtnText}>{t('home.reviewModal.close')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.modalTitle}>{t('home.reviewModal.title')}</Text>
                <Text style={styles.modalSub}>{t('home.reviewModal.subtitle')}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setRating(s)}>
                      <Star
                        size={34}
                        color={s <= rating ? '#fbbf24' : 'rgba(255,255,255,0.25)'}
                        fill={s <= rating ? '#fbbf24' : 'transparent'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.commentInput}
                  placeholder={t('home.reviewModal.commentPlaceholder')}
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  multiline
                  numberOfLines={4}
                  value={comment}
                  onChangeText={setComment}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  onPress={submitReview}
                  disabled={submitting}
                  style={[styles.submitBtn, submitting && styles.submitBtnOff]}
                >
                  <Send size={18} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>
                    {submitting ? t('home.reviewModal.submitting') : t('home.reviewModal.submit')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute', top: -28, right: -28,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  circle2: {
    position: 'absolute', top: 24, right: -56,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  roleCard: {
    backgroundColor: 'rgba(255,255,255,0.20)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16,
  },
  section: { paddingHorizontal: 20, marginTop: 22 },
  sectionTitle: {
    color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 14,
  },
  // Quick links — 4 column grid like namuna
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickItem: {
    width: '22%',       // ~4 per row with gap
    alignItems: 'center',
    gap: 8,
  },
  quickIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 15,
  },
  courseCard: {
    width: 288,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  // Modal
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
  starsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  commentInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    padding: 14, color: '#ffffff', fontSize: 14,
    minHeight: 110, marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#2563eb', borderRadius: 14, height: 48,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  submitBtnOff: { backgroundColor: 'rgba(37,99,235,0.45)' },
  submitBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  successBox: { alignItems: 'center', paddingVertical: 16 },
  successEmoji: { fontSize: 48, marginBottom: 12 },
  successTitle: { color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 6 },
  successSub: { color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 24 },
  doneBtn: { backgroundColor: '#2563eb', borderRadius: 14, paddingHorizontal: 40, paddingVertical: 12 },
  doneBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});
