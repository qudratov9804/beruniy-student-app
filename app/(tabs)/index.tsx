import React from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useEnrolledCourses } from '@/hooks/useCourses';
import { useUserStats } from '@/hooks/useProgress';
import { CourseCard } from '@/components/course';
import { StreakBadge, XpBadge, ProgressBar, CourseCardSkeleton } from '@/components/ui';
import { XP_PER_LEVEL } from '@/constants/config';
import { getLevelProgress } from '@/utils';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: enrolledCourses, isLoading: loadingCourses, refetch } = useEnrolledCourses();
  const { data: stats } = useUserStats();
  const [refreshing, setRefreshing] = React.useState(false);

  const levelProgress = getLevelProgress(user?.xp ?? 0, XP_PER_LEVEL);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const activeCourses = enrolledCourses?.filter((c) => c.progress && !c.progress.isCompleted) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 bg-white">
          <View>
            <Text className="text-xs text-slate-400 font-sans-medium">Xush kelibsiz 👋</Text>
            <Text className="text-xl font-sans-bold text-slate-800">
              {user?.firstName ?? 'Talaba'}
            </Text>
          </View>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Bell size={24} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Stats Banner */}
        <View className="mx-5 mt-4 bg-primary-600 rounded-3xl p-5">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-white text-sm opacity-80">Daraja</Text>
              <Text className="text-white text-2xl font-sans-bold">{user?.level ?? 1}</Text>
            </View>
            <View className="flex-row gap-3">
              <StreakBadge count={user?.streak ?? 0} size="md" />
              <XpBadge xp={user?.xp ?? 0} size="md" />
            </View>
          </View>
          <View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-white text-xs opacity-70">Keyingi daraja</Text>
              <Text className="text-white text-xs opacity-70">
                {levelProgress.current}/{levelProgress.total} XP
              </Text>
            </View>
            <ProgressBar
              progress={levelProgress.percentage}
              height={8}
              color="#FFFFFF"
              backgroundColor="rgba(255,255,255,0.3)"
            />
          </View>
        </View>

        {/* Daily Challenge Reminder */}
        <View className="mx-5 mt-4 bg-orange-50 border border-orange-100 rounded-3xl p-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Text className="text-2xl">🔥</Text>
            <View>
              <Text className="font-sans-bold text-slate-800">Kunlik vazifa</Text>
              <Text className="text-xs text-slate-500">Bugungi streakni saqlang!</Text>
            </View>
          </View>
          <TouchableOpacity className="bg-orange-500 rounded-2xl px-4 py-2">
            <Text className="text-white font-sans-bold text-sm">Boshlash</Text>
          </TouchableOpacity>
        </View>

        {/* Active Courses */}
        {activeCourses.length > 0 && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between px-5 mb-3">
              <Text className="text-base font-sans-bold text-slate-800">
                Davom etayotgan kurslar
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/courses')}
                className="flex-row items-center gap-1"
              >
                <Text className="text-primary-600 text-sm font-sans-semibold">Hammasi</Text>
                <ChevronRight size={16} color="#2563EB" />
              </TouchableOpacity>
            </View>
            {loadingCourses ? (
              <View className="px-5">
                <CourseCardSkeleton />
              </View>
            ) : (
              <FlatList
                data={activeCourses.slice(0, 3)}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                renderItem={({ item }) => (
                  <View className="w-72 mr-4">
                    <CourseCard course={item} variant="enrolled" />
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* Stats Grid */}
        <View className="px-5 mt-6">
          <Text className="text-base font-sans-bold text-slate-800 mb-3">Statistika</Text>
          <View className="flex-row flex-wrap gap-3">
            {[
              { label: 'Tugatilgan kurslar', value: stats?.completedCourses ?? 0, emoji: '🎓' },
              { label: 'Tugatilgan darslar', value: stats?.completedLessons ?? 0, emoji: '📚' },
              { label: 'Testlar', value: stats?.completedQuizzes ?? 0, emoji: '✅' },
              { label: 'Eng uzun streak', value: stats?.longestStreak ?? 0, emoji: '🔥' },
            ].map(({ label, value, emoji }) => (
              <View
                key={label}
                className="flex-1 min-w-[140px] bg-white rounded-3xl p-4 shadow-sm shadow-slate-100"
              >
                <Text className="text-2xl mb-2">{emoji}</Text>
                <Text className="text-xl font-sans-bold text-slate-800">{value}</Text>
                <Text className="text-xs text-slate-500 mt-1">{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
