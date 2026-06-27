import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Trophy, Flame, Zap, Target } from 'lucide-react-native';
import { useUserStats, useLeaderboard, useAchievements } from '@/hooks/useProgress';
import { useAuth } from '@/hooks/useAuth';
import { ProgressBar, StreakBadge, XpBadge, Card, Skeleton } from '@/components/ui';
import { XP_PER_LEVEL } from '@/constants/config';
import { getLevelProgress } from '@/utils';
import type { LeaderboardEntry } from '@/types';

type LeaderboardTab = 'weekly' | 'monthly' | 'all-time';

export default function ProgressScreen() {
  const { user } = useAuth();
  const [lbTab, setLbTab] = useState<LeaderboardTab>('weekly');
  const { data: stats, isLoading } = useUserStats();
  const { data: leaderboard, isLoading: loadingLb } = useLeaderboard(lbTab);
  const { data: achievements } = useAchievements();
  const levelProgress = getLevelProgress(user?.xp ?? 0, XP_PER_LEVEL);

  const tabs: { label: string; value: LeaderboardTab }[] = [
    { label: 'Haftalik', value: 'weekly' },
    { label: 'Oylik', value: 'monthly' },
    { label: 'Hamma vaqt', value: 'all-time' },
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-2">
          <Text className="text-xl font-sans-bold text-slate-800">Progress</Text>
        </View>

        {/* Level Card */}
        <View className="mx-5 mt-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl items-center justify-center">
                <Text className="text-2xl font-sans-bold text-white">{user?.level ?? 1}</Text>
              </View>
              <View>
                <Text className="text-white font-sans-bold text-lg">Daraja {user?.level}</Text>
                <Text className="text-white opacity-70 text-sm">
                  {levelProgress.current}/{levelProgress.total} XP
                </Text>
              </View>
            </View>
            <View className="gap-2">
              <StreakBadge count={user?.streak ?? 0} />
            </View>
          </View>
          <ProgressBar
            progress={levelProgress.percentage}
            height={10}
            color="#FFFFFF"
            backgroundColor="rgba(255,255,255,0.25)"
          />
        </View>

        {/* Stats */}
        <View className="px-5 mt-5">
          <View className="flex-row gap-3 mb-3">
            {[
              { label: 'Streak', value: `${stats?.currentStreak ?? 0} kun`, icon: <Flame size={20} color="#F97316" />, bg: 'bg-orange-50' },
              { label: 'Jami XP', value: `${stats?.totalXp ?? 0}`, icon: <Zap size={20} color="#9333EA" />, bg: 'bg-purple-50' },
            ].map(({ label, value, icon, bg }) => (
              <View key={label} className={`flex-1 ${bg} rounded-3xl p-4`}>
                <View className="mb-2">{icon}</View>
                <Text className="text-xl font-sans-bold text-slate-800">{value}</Text>
                <Text className="text-xs text-slate-500 mt-1">{label}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row gap-3">
            {[
              { label: 'Kurslar', value: stats?.completedCourses ?? 0, sub: 'tugatilgan', icon: '📚' },
              { label: 'Darslar', value: stats?.completedLessons ?? 0, sub: 'tugatilgan', icon: '✅' },
              { label: 'Testlar', value: stats?.completedQuizzes ?? 0, sub: 'topshirilgan', icon: '🧠' },
            ].map(({ label, value, sub, icon }) => (
              <View key={label} className="flex-1 bg-white rounded-3xl p-3 shadow-sm shadow-slate-100 items-center">
                <Text className="text-xl mb-1">{icon}</Text>
                <Text className="text-lg font-sans-bold text-slate-800">{value}</Text>
                <Text className="text-xs text-slate-400 text-center">{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <View className="px-5 mt-6">
            <Text className="text-base font-sans-bold text-slate-800 mb-3">Yutuqlar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {achievements.slice(0, 8).map((ach) => (
                <View
                  key={ach.id}
                  className={`mr-3 w-24 items-center p-3 rounded-3xl ${ach.isUnlocked ? 'bg-yellow-50' : 'bg-slate-100'}`}
                >
                  <Text className={`text-2xl mb-1 ${!ach.isUnlocked ? 'opacity-30' : ''}`}>
                    {ach.icon}
                  </Text>
                  <Text className={`text-xs text-center font-sans-semibold ${ach.isUnlocked ? 'text-slate-700' : 'text-slate-400'}`} numberOfLines={2}>
                    {ach.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Leaderboard */}
        <View className="px-5 mt-6 mb-6">
          <Text className="text-base font-sans-bold text-slate-800 mb-3">Reyting</Text>
          <View className="flex-row bg-slate-100 rounded-2xl p-1 mb-4">
            {tabs.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                onPress={() => setLbTab(value)}
                className={`flex-1 py-2 rounded-xl items-center ${lbTab === value ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`text-xs font-sans-semibold ${lbTab === value ? 'text-slate-800' : 'text-slate-500'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loadingLb ? (
            <View className="gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} className="flex-row items-center gap-3">
                  <Skeleton width={40} height={40} borderRadius={20} />
                  <View className="flex-1">
                    <Skeleton width="60%" height={14} className="mb-1" />
                    <Skeleton width="40%" height={11} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            leaderboard?.map((entry) => (
              <View
                key={entry.userId}
                className={`flex-row items-center p-4 rounded-2xl mb-2 ${entry.isCurrentUser ? 'bg-primary-50 border border-primary-200' : 'bg-white'}`}
              >
                <Text className="text-lg w-10 text-center">{getRankBadge(entry.rank)}</Text>
                <View className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden mx-3">
                  {entry.avatar ? (
                    <Image source={entry.avatar} style={{ width: 40, height: 40 }} contentFit="cover" />
                  ) : (
                    <View className="w-full h-full bg-primary-100 items-center justify-center">
                      <Text className="text-primary-600 font-sans-bold text-base">
                        {entry.firstName[0]}
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-1">
                  <Text className={`font-sans-semibold text-sm ${entry.isCurrentUser ? 'text-primary-700' : 'text-slate-700'}`}>
                    {entry.firstName} {entry.lastName}
                    {entry.isCurrentUser && ' (Siz)'}
                  </Text>
                  <Text className="text-xs text-slate-400">Daraja {entry.level}</Text>
                </View>
                <XpBadge xp={entry.xp} size="sm" />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
