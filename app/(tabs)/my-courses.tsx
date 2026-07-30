import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BookOpen, CheckCircle, Clock, ChevronRight, GraduationCap } from 'lucide-react-native';
import { ScreenBackground, AppHeader } from '@/components/common';
import { useEnrolledCourses } from '@/hooks/useCourses';
import type { Enrollment } from '@/types';

type Filter = 'all' | 'active' | 'completed';

const FILTER_KEYS: Filter[] = ['all', 'active', 'completed'];

function EnrolledCourseCard({ item }: { item: Enrollment }) {
  const router = useRouter();
  const { t } = useTranslation();
  const isFree = item.paid_amount === 0 || item.course?.is_free;
  const isCompleted = item.status === 'completed';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => item.course?.slug && router.push(`/course/${item.course.slug}`)}
    >
      {/* Thumbnail */}
      <View style={styles.thumb}>
        {item.course?.thumbnail ? (
          <Image source={{ uri: item.course.thumbnail }} style={styles.thumbImg} resizeMode="cover" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <BookOpen size={28} color="rgba(255,255,255,0.4)" />
          </View>
        )}
        {/* Badge */}
        <View style={[styles.badge, isFree ? styles.badgeFree : styles.badgePaid]}>
          <Text style={styles.badgeText}>{isFree ? t('common.free') : t('myCourses.purchased')}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.course?.title ?? t('myCourses.course')}
        </Text>

        {item.course?.instructor && (
          <Text style={styles.instructor} numberOfLines={1}>
            {item.course.instructor.name}
          </Text>
        )}

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${item.progress_percent}%` }]} />
          </View>
          <Text style={styles.progressText}>{item.progress_percent}%</Text>
        </View>

        {/* Status row */}
        <View style={styles.metaRow}>
          {isCompleted ? (
            <View style={styles.metaItem}>
              <CheckCircle size={13} color="#34d399" />
              <Text style={[styles.metaText, { color: '#34d399' }]}>{t('myCourses.completed')}</Text>
            </View>
          ) : (
            <View style={styles.metaItem}>
              <Clock size={13} color="#60a5fa" />
              <Text style={styles.metaText}>{t('myCourses.inProgress')}</Text>
            </View>
          )}

          {item.course?.lessons_count ? (
            <Text style={styles.metaRight}>
              {t('myCourses.lessonsCount', { count: item.course.lessons_count })}
            </Text>
          ) : null}
        </View>
      </View>

      <ChevronRight size={18} color="rgba(255,255,255,0.3)" style={styles.arrow} />
    </TouchableOpacity>
  );
}

export default function MyCoursesScreen() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { data: enrollments, isLoading, refetch } = useEnrolledCourses();

  const FILTERS: { key: Filter; label: string }[] = FILTER_KEYS.map((key) => ({
    key,
    label: t(`myCourses.filters.${key}`),
  }));

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered = (enrollments ?? []).filter((e) => {
    if (filter === 'active') return e.status === 'active';
    if (filter === 'completed') return e.status === 'completed';
    return true;
  });

  const stats = {
    all: enrollments?.length ?? 0,
    active: enrollments?.filter((e) => e.status === 'active').length ?? 0,
    completed: enrollments?.filter((e) => e.status === 'completed').length ?? 0,
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe}>
        <AppHeader title={t('myCourses.title')} />

        {/* Summary cards */}
        {enrollments && (
          <View style={styles.summaryRow}>
            {[
              { label: t('myCourses.total'), value: stats.all, color: '#60a5fa', icon: <BookOpen size={16} color="#60a5fa" /> },
              { label: t('myCourses.filters.active'), value: stats.active, color: '#a78bfa', icon: <Clock size={16} color="#a78bfa" /> },
              { label: t('myCourses.completed'), value: stats.completed, color: '#34d399', icon: <CheckCircle size={16} color="#34d399" /> },
            ].map((s) => (
              <View key={s.label} style={styles.summaryCard}>
                {s.icon}
                <Text style={[styles.summaryNum, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.summaryLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={isLoading ? [] : filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#60a5fa']} />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.empty}>
                <GraduationCap size={52} color="rgba(255,255,255,0.15)" />
                <Text style={styles.emptyTitle}>
                  {filter === 'completed' ? t('myCourses.emptyCompleted') :
                   filter === 'active' ? t('myCourses.emptyActive') :
                   t('myCourses.emptyAll')}
                </Text>
                <Text style={styles.emptySub}>
                  {t('myCourses.emptySubtitle')}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => <EnrolledCourseCard item={item} />}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  // Summary
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  summaryNum: { fontSize: 20, fontWeight: '700' },
  summaryLabel: { color: 'rgba(255,255,255,0.50)', fontSize: 11 },
  // Filter tabs
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  filterTabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterText: { color: 'rgba(255,255,255,0.60)', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#ffffff' },
  // List
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  thumb: { width: 90, height: 90, position: 'relative' },
  thumbImg: { width: 90, height: 90 },
  thumbPlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: 'rgba(37,99,235,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeFree: { backgroundColor: 'rgba(16,185,129,0.85)' },
  badgePaid: { backgroundColor: 'rgba(37,99,235,0.85)' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  info: { flex: 1, padding: 12, paddingRight: 4 },
  title: { color: '#ffffff', fontSize: 13, fontWeight: '600', lineHeight: 18, marginBottom: 3 },
  instructor: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: 5, backgroundColor: '#60a5fa', borderRadius: 3 },
  progressText: { color: 'rgba(255,255,255,0.60)', fontSize: 11, fontWeight: '600', minWidth: 30 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: 'rgba(255,255,255,0.50)', fontSize: 11 },
  metaRight: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  arrow: { marginRight: 12 },
  // Empty
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { color: 'rgba(255,255,255,0.60)', fontSize: 15, fontWeight: '600', marginTop: 16, textAlign: 'center' },
  emptySub: { color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 19 },
});
