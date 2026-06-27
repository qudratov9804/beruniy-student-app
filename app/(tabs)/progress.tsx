import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, BookOpen, CheckCircle } from 'lucide-react-native';
import { useEnrolledCourses } from '@/hooks/useCourses';
import { useCertificates } from '@/hooks/useProgress';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui';

export default function ProgressScreen() {
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
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-2">
          <Text className="text-xl font-sans-bold text-slate-800">Progress</Text>
          {user && <Text className="text-sm text-slate-500 mt-0.5">{user.name}</Text>}
        </View>

        {/* Overview */}
        <View className="mx-5 mt-3 bg-primary-600 rounded-3xl p-5">
          <Text className="text-white font-sans-bold text-lg mb-3">Umumiy ko'rsatkichlar</Text>
          {loadingEnrollments ? (
            <Skeleton height={60} />
          ) : (
            <View className="flex-row gap-4">
              <View className="flex-1 items-center">
                <Text className="text-white text-2xl font-sans-bold">
                  {enrollments?.length ?? 0}
                </Text>
                <Text className="text-white opacity-70 text-xs mt-1">Jami kurslar</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-white text-2xl font-sans-bold">{completed.length}</Text>
                <Text className="text-white opacity-70 text-xs mt-1">Tugatilgan</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-white text-2xl font-sans-bold">{avgProgress}%</Text>
                <Text className="text-white opacity-70 text-xs mt-1">O'rtacha progress</Text>
              </View>
            </View>
          )}
        </View>

        {/* Active Courses Progress */}
        {active.length > 0 && (
          <View className="px-5 mt-5">
            <Text className="text-base font-sans-bold text-slate-800 mb-3">
              Faol kurslar ({active.length})
            </Text>
            {active.map((enrollment) => (
              <View
                key={enrollment.id}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm shadow-slate-100"
              >
                <View className="flex-row items-center mb-1">
                  <BookOpen size={16} color="#2563EB" />
                  <Text className="text-sm font-sans-semibold text-slate-700 ml-2 flex-1" numberOfLines={1}>
                    {enrollment.course?.title ?? 'Kurs'}
                  </Text>
                  <Text className="text-sm font-sans-bold text-primary-600">
                    {enrollment.progress_percent}%
                  </Text>
                </View>
                <View className="h-2 bg-slate-100 rounded-full mt-2">
                  <View
                    className="h-2 bg-primary-600 rounded-full"
                    style={{ width: `${enrollment.progress_percent}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Certificates */}
        <View className="px-5 mt-5 mb-6">
          <Text className="text-base font-sans-bold text-slate-800 mb-3">
            Sertifikatlar ({certificates?.length ?? 0})
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
                className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm shadow-slate-100"
              >
                <View className="w-10 h-10 bg-yellow-100 rounded-2xl items-center justify-center mr-3">
                  <Trophy size={20} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-sans-semibold text-slate-800" numberOfLines={1}>
                    {cert.course_title}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">{cert.issued_at}</Text>
                </View>
                <CheckCircle size={20} color="#22C55E" />
              </View>
            ))
          ) : (
            <View className="items-center py-8">
              <Text className="text-3xl mb-2">🎓</Text>
              <Text className="text-sm text-slate-500">Hali sertifikat yo'q</Text>
              <Text className="text-xs text-slate-400 mt-1">
                Kursni tugatgandan so'ng sertifikat beriladi
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
