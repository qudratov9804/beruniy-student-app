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
  Heart,
  Settings,
  Info,
  Lock,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui';
import { useRouter } from 'expo-router';

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
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Chiqish', 'Hisobdan chiqishni xohlaysizmi?', [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: 'Chiqish', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

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
                <Text className="text-4xl font-sans-bold text-primary-600">{initials}</Text>
              </View>
            )}
          </View>
          <Text className="text-xl font-sans-bold text-slate-800">{user?.name ?? '—'}</Text>
          <Text className="text-sm text-slate-500 mt-1">{user?.phone ?? ''}</Text>
          {user?.email && (
            <Text className="text-sm text-slate-400 mt-0.5">{user.email}</Text>
          )}
          <View className="mt-3 px-4 py-1.5 bg-primary-50 rounded-2xl">
            <Text className="text-primary-700 font-sans-semibold text-sm">
              {user?.role === 'student' ? 'Talaba' : 'Instructor'}
            </Text>
          </View>
        </View>

        {/* Info Cards */}
        <View className="flex-row mx-5 mt-4 gap-3">
          <Card variant="default" padding="sm" className="flex-1 items-center">
            <View className="w-8 h-8 bg-green-100 rounded-xl items-center justify-center mb-1">
              <User size={16} color="#22C55E" />
            </View>
            <Text className="text-sm font-sans-bold text-slate-800">{user?.is_active ? 'Faol' : 'Nofaol'}</Text>
            <Text className="text-xs text-slate-500">Status</Text>
          </Card>
          <Card variant="default" padding="sm" className="flex-1 items-center">
            <View className="w-8 h-8 bg-primary-100 rounded-xl items-center justify-center mb-1">
              <Lock size={16} color="#6366F1" />
            </View>
            <Text className="text-sm font-sans-bold text-slate-800">
              {user?.has_password ? "O'rnatilgan" : "Yo'q"}
            </Text>
            <Text className="text-xs text-slate-500">Parol</Text>
          </Card>
        </View>

        {/* Menu */}
        <Card variant="default" padding="md" className="mx-5 mt-4">
          <MenuItem
            icon={<BookOpen size={20} color="#22C55E" />}
            label="Mening kurslarim"
            onPress={() => router.push('/(tabs)/courses')}
          />
          <View className="h-px bg-slate-100 ml-14" />
          <MenuItem
            icon={<Heart size={20} color="#EF4444" />}
            label="Saqlanganlar"
            onPress={() => router.push('/wishlist')}
          />
          <View className="h-px bg-slate-100 ml-14" />
          <MenuItem
            icon={<Trophy size={20} color="#F59E0B" />}
            label="Sertifikatlarim"
            onPress={() => router.push('/(tabs)/progress')}
          />
        </Card>

        <Card variant="default" padding="md" className="mx-5 mt-3">
          <MenuItem
            icon={<Bell size={20} color="#6366F1" />}
            label="Bildirishnomalar"
            onPress={() => router.push('/notifications')}
          />
          <View className="h-px bg-slate-100 ml-14" />
          <MenuItem
            icon={<Settings size={20} color="#64748B" />}
            label="Sozlamalar"
            onPress={() => router.push('/settings')}
          />
          <View className="h-px bg-slate-100 ml-14" />
          <MenuItem
            icon={<Info size={20} color="#3B82F6" />}
            label="Biz haqimizda"
            onPress={() => router.push('/about')}
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
