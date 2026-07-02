import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, User } from 'lucide-react-native';

interface Props {
  title?: string;
  subtitle?: string;
}

export const AppHeader: React.FC<Props> = ({ title, subtitle }) => {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <View>
        {subtitle ? (
          <Text className="text-xs text-white/50 font-sans-medium">{subtitle}</Text>
        ) : null}
        {title ? (
          <Text className="text-xl font-sans-bold text-white">{title}</Text>
        ) : null}
      </View>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          className="w-10 h-10 items-center justify-center rounded-2xl bg-white/10 border border-white/15"
        >
          <Bell size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          className="w-10 h-10 items-center justify-center rounded-2xl bg-white/10 border border-white/15"
        >
          <User size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
