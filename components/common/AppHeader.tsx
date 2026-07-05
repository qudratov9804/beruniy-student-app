import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, User } from 'lucide-react-native';
import { useUnreadCount } from '@/hooks/useProgress';

interface Props {
  title?: string;
  subtitle?: string;
}

export const AppHeader: React.FC<Props> = ({ title, subtitle }) => {
  const router = useRouter();
  const { data: unreadCount } = useUnreadCount();

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
          className="w-10 h-10 items-center justify-center rounded-2xl bg-white/10 border border-white/15 relative"
        >
          <Bell size={20} color="rgba(255,255,255,0.85)" />
          {!!unreadCount && unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 items-center justify-center border-2 border-slate-900">
              <Text className="text-[10px] font-sans-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
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
