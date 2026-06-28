import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sun, Moon, Smartphone, Shield, Lock, Bell, Info } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useThemeStore } from '@/stores';
import { useAuthStore } from '@/stores';

type ThemeMode = 'light' | 'dark' | 'system';

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, setMode } = useThemeStore();
  const { setColorScheme } = useColorScheme();
  const { hasPin } = useAuthStore();

  const handleTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    if (newMode !== 'system') setColorScheme(newMode);
  };

  const themes: { label: string; value: ThemeMode; icon: React.ReactNode }[] = [
    { label: 'Yorug\'', value: 'light', icon: <Sun size={18} color={mode === 'light' ? '#6366F1' : '#94A3B8'} /> },
    { label: 'Qorong\'i', value: 'dark', icon: <Moon size={18} color={mode === 'dark' ? '#6366F1' : '#94A3B8'} /> },
    { label: 'Tizim', value: 'system', icon: <Smartphone size={18} color={mode === 'system' ? '#6366F1' : '#94A3B8'} /> },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="flex-row items-center px-5 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1 mr-3">
          <ChevronLeft size={26} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-sans-bold text-slate-800 dark:text-white">Sozlamalar</Text>
      </View>

      <View className="px-5 pt-5">
        {/* Theme */}
        <Text className="text-xs font-sans-semibold text-slate-400 uppercase tracking-wider mb-3">
          Ko'rinish
        </Text>
        <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-5">
          {themes.map(({ label, value, icon }, i) => (
            <TouchableOpacity
              key={value}
              onPress={() => handleTheme(value)}
              className={`flex-row items-center px-4 py-4 ${i < themes.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}
            >
              <View className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${mode === value ? 'bg-primary-100' : 'bg-slate-100 dark:bg-slate-700'}`}>
                {icon}
              </View>
              <Text className={`flex-1 text-sm font-sans-medium ${mode === value ? 'text-primary-600' : 'text-slate-700 dark:text-slate-200'}`}>
                {label}
              </Text>
              {mode === value && (
                <View className="w-5 h-5 rounded-full bg-primary-600 items-center justify-center">
                  <View className="w-2 h-2 rounded-full bg-white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Security */}
        <Text className="text-xs font-sans-semibold text-slate-400 uppercase tracking-wider mb-3">
          Xavfsizlik
        </Text>
        <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-5">
          <TouchableOpacity
            onPress={() => router.push('/(auth)/pin-setup')}
            className="flex-row items-center px-4 py-4 border-b border-slate-100 dark:border-slate-700"
          >
            <View className="w-9 h-9 rounded-xl bg-primary-100 items-center justify-center mr-3">
              <Lock size={18} color="#6366F1" />
            </View>
            <Text className="flex-1 text-sm font-sans-medium text-slate-700 dark:text-slate-200">
              {hasPin ? 'PIN kodni o\'zgartirish' : 'PIN kod o\'rnatish'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            className="flex-row items-center px-4 py-4"
          >
            <View className="w-9 h-9 rounded-xl bg-orange-100 items-center justify-center mr-3">
              <Bell size={18} color="#F97316" />
            </View>
            <Text className="flex-1 text-sm font-sans-medium text-slate-700 dark:text-slate-200">
              Bildirishnomalar
            </Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text className="text-xs font-sans-semibold text-slate-400 uppercase tracking-wider mb-3">
          Ilova haqida
        </Text>
        <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
          <TouchableOpacity
            onPress={() => router.push('/about')}
            className="flex-row items-center px-4 py-4"
          >
            <View className="w-9 h-9 rounded-xl bg-blue-100 items-center justify-center mr-3">
              <Info size={18} color="#3B82F6" />
            </View>
            <Text className="flex-1 text-sm font-sans-medium text-slate-700 dark:text-slate-200">
              Biz haqimizda
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
