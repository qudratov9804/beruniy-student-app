import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, BookOpen, CheckCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useEnrolledCourses } from '@/hooks/useCourses';
import { useCertificates } from '@/hooks/useProgress';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui';
import { ScreenBackground, AppHeader } from '@/components/common';

export default function ProgressScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: enrollments, isLoading: loadingEnrollments } = useEnrolledCourses();
  const { data: certificates, isLoading: loadingCerts } = useCertificates();

  const completed = enrollments?.filter((e) => e.status === 'completed') ?? [];
  const active = enrollments?.filter((e) => e.status === 'active') ?? [];
  const avgProgress =
    active.length > 0
      ? Math.round(active.reduce((sum, e) => sum + e.progress_percent, 0) / active.length)
      : 0;

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1 bg-transparent">
        <AppHeader title={t('progress.title')} subtitle={user?.name} />
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Overview */}
          <View className="mx-5 mt-2 bg-primary-600 rounded-3xl p-5">
            <Text className="text-white font-sans-bold text-lg mb-3">{t('progress.overview')}</Text>
            {loadingEnrollments ? (
              <Skeleton height={60} />
            ) : (
              <View className="flex-row gap-4">
                <View className="flex-1 items-center">
                  <Text className="text-white text-2xl font-sans-bold">
                    {enrollments?.length ?? 0}
                  </Text>
                  <Text className="text-white opacity-70 text-xs mt-1">{t('progress.totalCourses')}</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-white text-2xl font-sans-bold">{completed.length}</Text>
                  <Text className="text-white opacity-70 text-xs mt-1">{t('myCourses.completed')}</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-white text-2xl font-sans-bold">{avgProgress}%</Text>
                  <Text className="text-white opacity-70 text-xs mt-1">{t('progress.averageProgress')}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Active Courses Progress */}
          {active.length > 0 && (
            <View className="px-5 mt-5">
              <Text className="text-base font-sans-bold text-white mb-3">
                {t('progress.activeCourses', { count: active.length })}
              </Text>
              {active.map((enrollment) => (
                <View
                  key={enrollment.id}
                  className="bg-white/10 rounded-2xl p-4 mb-3 border border-white/15"
                >
                  <View className="flex-row items-center mb-1">
                    <BookOpen size={16} color="#60a5fa" />
                    <Text className="text-sm font-sans-semibold text-white ml-2 flex-1" numberOfLines={1}>
                      {enrollment.course?.title ?? t('myCourses.course')}
                    </Text>
                    <Text className="text-sm font-sans-bold text-blue-300">
                      {enrollment.progress_percent}%
                    </Text>
                  </View>
                  <View className="h-2 bg-white/20 rounded-full mt-2">
                    <View
                      className="h-2 bg-blue-400 rounded-full"
                      style={{ width: `${enrollment.progress_percent}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Certificates */}
          <View className="px-5 mt-5 mb-6">
            <Text className="text-base font-sans-bold text-white mb-3">
              {t('progress.certificates', { count: certificates?.length ?? 0 })}
            </Text>
            {loadingCerts ? (
              <View className="gap-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} height={72} borderRadius={16} />
                ))}
              </View>
            ) : certificates && certificates.length > 0 ? (
              certificates.map((cert) => (
                <View
                  key={cert.id}
                  className="bg-white/10 rounded-2xl p-4 mb-3 flex-row items-center border border-white/15"
                >
                  <View className="w-10 h-10 bg-yellow-500/20 rounded-2xl items-center justify-center mr-3">
                    <Trophy size={20} color="#fbbf24" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-sans-semibold text-white" numberOfLines={1}>
                      {cert.course_title}
                    </Text>
                    <Text className="text-xs text-white/50 mt-0.5">{cert.issued_at}</Text>
                  </View>
                  <CheckCircle size={20} color="#34d399" />
                </View>
              ))
            ) : (
              <View className="items-center py-8">
                <Text className="text-3xl mb-2">🎓</Text>
                <Text className="text-sm text-white/60">{t('progress.noCertificatesYet')}</Text>
                <Text className="text-xs text-white/40 mt-1">
                  {t('progress.certificateHint')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
