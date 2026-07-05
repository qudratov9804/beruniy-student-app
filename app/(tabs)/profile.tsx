import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
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
  Edit2,
  Wallet,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { ScreenBackground } from '@/components/common';
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
      className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 ${danger ? 'bg-red-500/20' : 'bg-white/10'}`}
    >
      {icon}
    </View>
    <Text
      className={`flex-1 text-base font-sans-medium ${danger ? 'text-red-400' : 'text-white/90'}`}
    >
      {label}
    </Text>
    <ChevronRight size={20} color={danger ? '#f87171' : 'rgba(255,255,255,0.30)'} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, logout, isLoggingOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Hisobdan chiqishni xohlaysizmi?')) logout();
      return;
    }
    Alert.alert('Chiqish', 'Hisobdan chiqishni xohlaysizmi?', [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: 'Chiqish', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1 bg-transparent">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <LinearGradient
            colors={['#2563eb', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 32, paddingHorizontal: 20, alignItems: 'center', position: 'relative' }}
          >
            <View className="w-24 h-24 rounded-3xl bg-white/20 overflow-hidden mb-4 border-2 border-white/40 items-center justify-center">
              {user?.avatar ? (
                <Image source={user.avatar} style={{ width: 96, height: 96 }} contentFit="cover" />
              ) : (
                <Text className="text-4xl font-sans-bold text-white">{initials}</Text>
              )}
            </View>
            <Text className="text-xl font-sans-bold text-white">{user?.name ?? '—'}</Text>
            <Text className="text-sm text-white/70 mt-1">{user?.phone ?? ''}</Text>
            {user?.email && (
              <Text className="text-sm text-white/60 mt-0.5">{user.email}</Text>
            )}
            <View className="mt-3 px-4 py-1.5 bg-white/20 rounded-2xl border border-white/30">
              <Text className="text-white font-sans-semibold text-sm">
                {user?.role === 'student' ? 'Talaba' : 'Instructor'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/edit-profile' as Parameters<typeof router.push>[0])}
              className="absolute top-4 right-4 w-9 h-9 bg-white/20 rounded-full items-center justify-center border border-white/30"
            >
              <Edit2 size={16} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Info Cards */}
          <View className="flex-row mx-5 mt-4 gap-3">
            <View className="flex-1 bg-white/10 rounded-3xl p-3 items-center border border-white/15">
              <View className="w-8 h-8 bg-green-500/20 rounded-xl items-center justify-center mb-1">
                <User size={16} color="#34d399" />
              </View>
              <Text className="text-sm font-sans-bold text-white">{user?.is_active ? 'Faol' : 'Nofaol'}</Text>
              <Text className="text-xs text-white/50">Status</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-3xl p-3 items-center border border-white/15">
              <View className="w-8 h-8 bg-blue-500/20 rounded-xl items-center justify-center mb-1">
                <Lock size={16} color="#60a5fa" />
              </View>
              <Text className="text-sm font-sans-bold text-white">
                {user?.has_password ? "O'rnatilgan" : "Yo'q"}
              </Text>
              <Text className="text-xs text-white/50">Parol</Text>
            </View>
          </View>

          {/* Menu */}
          <View className="mx-5 mt-4 bg-white/10 rounded-3xl p-4 border border-white/15">
            <MenuItem
              icon={<BookOpen size={20} color="#34d399" />}
              label="Mening kurslarim"
              onPress={() => router.push('/(tabs)/courses')}
            />
            <View className="h-px bg-white/10 ml-14" />
            <MenuItem
              icon={<Heart size={20} color="#f87171" />}
              label="Saqlanganlar"
              onPress={() => router.push('/wishlist')}
            />
            <View className="h-px bg-white/10 ml-14" />
            <MenuItem
              icon={<Trophy size={20} color="#fbbf24" />}
              label="Sertifikatlarim"
              onPress={() => router.push('/(tabs)/progress')}
            />
            <View className="h-px bg-white/10 ml-14" />
            <MenuItem
              icon={<Wallet size={20} color="#60a5fa" />}
              label="To'lovlar tarixi"
              onPress={() => router.push('/payments')}
            />
          </View>

          <View className="mx-5 mt-3 bg-white/10 rounded-3xl p-4 border border-white/15">
            <MenuItem
              icon={<Bell size={20} color="#a78bfa" />}
              label="Bildirishnomalar"
              onPress={() => router.push('/notifications')}
            />
            <View className="h-px bg-white/10 ml-14" />
            <MenuItem
              icon={<Settings size={20} color="rgba(255,255,255,0.60)" />}
              label="Sozlamalar"
              onPress={() => router.push('/settings')}
            />
            <View className="h-px bg-white/10 ml-14" />
            <MenuItem
              icon={<Info size={20} color="#60a5fa" />}
              label="Biz haqimizda"
              onPress={() => router.push('/about')}
            />
          </View>

          <View className="mx-5 mt-3 mb-8 bg-white/10 rounded-3xl p-4 border border-white/15">
            <MenuItem
              icon={<LogOut size={20} color="#f87171" />}
              label={isLoggingOut ? 'Chiqilmoqda...' : 'Chiqish'}
              onPress={handleLogout}
              danger
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
