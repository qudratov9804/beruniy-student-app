import React from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useEnrolledCourses } from '@/hooks/useCourses';
import { CourseCardSkeleton } from '@/components/ui';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: enrollments, isLoading: loadingCourses, refetch } = useEnrolledCourses();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const activeCourses =
    enrollments?.filter((e) => e.status === 'active' && e.progress_percent < 100) ?? [];

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
            <Text className="text-xl font-sans-bold text-slate-800">{user?.name ?? 'Talaba'}</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Bell size={24} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Profile Banner */}
        <View className="mx-5 mt-4 bg-primary-600 rounded-3xl p-5">
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="text-white text-sm opacity-80">Telefon</Text>
              <Text className="text-white text-lg font-sans-bold">{user?.phone ?? '—'}</Text>
            </View>
            <View className="bg-white/20 px-4 py-2 rounded-2xl">
              <Text className="text-white font-sans-semibold text-sm">
                {user?.role === 'student' ? 'Talaba' : 'Instructor'}
              </Text>
            </View>
          </View>
          <Text className="text-white opacity-70 text-sm mt-1">
            {activeCourses.length} ta faol kurs
          </Text>
        </View>

        {/* Active Courses */}
        {(activeCourses.length > 0 || loadingCourses) && (
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
                data={activeCourses.slice(0, 5)}
                keyExtractor={(item) => String(item.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                renderItem={({ item }) => (
                  <View className="w-72 mr-4">
                    <View className="bg-white rounded-3xl p-4 shadow-sm shadow-slate-100">
                      <Text className="font-sans-semibold text-slate-800" numberOfLines={2}>
                        {item.course?.title}
                      </Text>
                      <Text className="text-xs text-slate-500 mt-2">
                        {item.progress_percent}% tugatildi
                      </Text>
                      <View className="h-2 bg-slate-100 rounded-full mt-2">
                        <View
                          className="h-2 bg-primary-600 rounded-full"
                          style={{ width: `${item.progress_percent}%` }}
                        />
                      </View>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* Stats Grid */}
        {enrollments && (
          <View className="px-5 mt-6">
            <Text className="text-base font-sans-bold text-slate-800 mb-3">Statistika</Text>
            <View className="flex-row flex-wrap gap-3">
              {[
                {
                  label: 'Faol kurslar',
                  value: enrollments.filter((e) => e.status === 'active').length,
                  emoji: '📚',
                },
                {
                  label: 'Tugatilgan kurslar',
                  value: enrollments.filter((e) => e.status === 'completed').length,
                  emoji: '🎓',
                },
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
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
