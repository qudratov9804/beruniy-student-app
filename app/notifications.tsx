import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell, CheckCheck, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/api';
import { QUERY_KEYS } from '@/constants/config';
import { useNotifications, useMarkNotificationRead } from '@/hooks/useProgress';
import { Skeleton } from '@/components/ui';

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data, isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationRead();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT });
  };

  const markAllMutation = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsService.delete(id),
    onSuccess: invalidateAll,
  });

  const notifications = data?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="flex-row items-center justify-between px-5 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
          <ChevronLeft size={26} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-sans-bold text-slate-800 dark:text-white">{t('settings.notifications')}</Text>
        <TouchableOpacity onPress={() => markAllMutation.mutate()} className="p-1">
          <CheckCheck size={22} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="px-5 pt-4 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={72} borderRadius={16} />)}
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <View className="w-20 h-20 bg-primary-50 rounded-full items-center justify-center mb-4">
            <Bell size={36} color="#6366F1" />
          </View>
          <Text className="text-base font-sans-bold text-slate-700 dark:text-slate-200">{t('notifications.empty')}</Text>
          <Text className="text-sm text-slate-400 mt-1">{t('notifications.emptySubtitle')}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (!item.read_at) markReadMutation.mutate(String(item.id));
              }}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-4 flex-row items-start gap-3 ${!item.read_at ? 'border-l-4 border-primary-500' : ''}`}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center flex-shrink-0 ${!item.read_at ? 'bg-primary-100' : 'bg-slate-100'}`}>
                <Bell size={18} color={!item.read_at ? '#6366F1' : '#94A3B8'} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-sans-semibold text-slate-800 dark:text-white">{item.title}</Text>
                {item.body && <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5" numberOfLines={2}>{item.body}</Text>}
                <Text className="text-xs text-slate-400 mt-1">{item.created_at}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteMutation.mutate(String(item.id))} className="p-1">
                <Trash2 size={16} color="#CBD5E1" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
