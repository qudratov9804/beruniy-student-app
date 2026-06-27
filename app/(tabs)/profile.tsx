import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  User,
  BookOpen,
  Trophy,
  LogOut,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { Card, StreakBadge, XpBadge } from '@/components/ui';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress, danger }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center py-4 px-1"
    activeOpacity={0.7}
  >
    <View
      className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 ${danger ? 'bg-red-50' : 'bg-slate-100'}`}
    >
      {icon}
    </View>
    <Text
      className={`flex-1 text-base font-sans-medium ${danger ? 'text-red-500' : 'text-slate-700'}`}
    >
      {label}
    </Text>
    <ChevronRight size={20} color={danger ? '#EF4444' : '#CBD5E1'} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, logout, isLoggingOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('Chiqish', 'Hisobdan chiqishni xohlaysizmi?', [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: 'Chiqish', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center py-8 bg-white">
          <View className="w-24 h-24 rounded-full bg-primary-100 overflow-hidden mb-4 border-4 border-primary-200">
            {user?.avatar ? (
              <Image source={user.avatar} style={{ width: 96, height: 96 }} contentFit="cover" />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Text className="text-4xl font-sans-bold text-primary-600">
                  {user?.firstName?.[0] ?? 'U'}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xl font-sans-bold text-slate-800">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-sm text-slate-500 mt-1">{user?.email}</Text>
          <View className="flex-row gap-3 mt-4">
            <StreakBadge count={user?.streak ?? 0} />
            <XpBadge xp={user?.xp ?? 0} />
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row mx-5 mt-4 gap-3">
          {[
            { label: 'Daraja', value: user?.level ?? 1, icon: '🎯' },
            { label: 'XP', value: user?.xp ?? 0, icon: '⚡' },
            { label: 'Streak', value: `${user?.streak ?? 0}d`, icon: '🔥' },
          ].map(({ label, value, icon }) => (
            <Card key={label} variant="default" padding="sm" className="flex-1 items-center">
              <Text className="text-xl mb-1">{icon}</Text>
              <Text className="text-lg font-sans-bold text-slate-800">{value}</Text>
              <Text className="text-xs text-slate-500">{label}</Text>
            </Card>
          ))}
        </View>

        {/* Menu */}
        <Card variant="default" padding="md" className="mx-5 mt-4">
          <MenuItem
            icon={<User size={20} color="#2563EB" />}
            label="Profilni tahrirlash"
            onPress={() => {}}
          />
          <View className="h-px bg-slate-100 ml-14" />
          <MenuItem
            icon={<BookOpen size={20} color="#22C55E" />}
            label="Mening kurslarim"
            onPress={() => {}}
          />
          <View className="h-px bg-slate-100 ml-14" />
          <MenuItem
            icon={<Trophy size={20} color="#F59E0B" />}
            label="Yutuqlarim"
            onPress={() => {}}
          />
        </Card>

        <Card variant="default" padding="md" className="mx-5 mt-3">
          <MenuItem
            icon={<Bell size={20} color="#6366F1" />}
            label="Bildirishnomalar"
            onPress={() => {}}
          />
          <View className="h-px bg-slate-100 ml-14" />
          <MenuItem
            icon={<Shield size={20} color="#64748B" />}
            label="Maxfiylik"
            onPress={() => {}}
          />
          <View className="h-px bg-slate-100 ml-14" />
          <MenuItem
            icon={<HelpCircle size={20} color="#64748B" />}
            label="Yordam"
            onPress={() => {}}
          />
        </Card>

        <Card variant="default" padding="md" className="mx-5 mt-3 mb-8">
          <MenuItem
            icon={<LogOut size={20} color="#EF4444" />}
            label={isLoggingOut ? 'Chiqilmoqda...' : 'Chiqish'}
            onPress={handleLogout}
            danger
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
