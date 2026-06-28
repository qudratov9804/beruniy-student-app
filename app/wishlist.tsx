import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Heart, Trash2 } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/api';
import { Skeleton } from '@/components/ui';
import { formatPrice } from '@/utils';

const WISHLIST_KEY = ['wishlist'];

export default function WishlistScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: () => wishlistService.getAll(),
  });

  const toggleMutation = useMutation({
    mutationFn: (courseId: number) => wishlistService.toggle(courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WISHLIST_KEY }),
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="flex-row items-center justify-between px-5 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
          <ChevronLeft size={26} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-sans-bold text-slate-800 dark:text-white">Saqlanganlar</Text>
        <View className="w-8" />
      </View>

      {isLoading ? (
        <View className="px-5 pt-4 gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} height={100} borderRadius={16} />)}
        </View>
      ) : !items || items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-4">
            <Heart size={36} color="#EF4444" />
          </View>
          <Text className="text-base font-sans-bold text-slate-700 dark:text-slate-200">Saqlangan kurslar yo'q</Text>
          <Text className="text-sm text-slate-400 mt-1 text-center px-8">
            Kurs sahifasida yurak belgisini bosib saqlang
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/courses')}
            className="mt-6 bg-primary-600 px-6 py-3 rounded-2xl">
            <Text className="text-white font-sans-semibold">Kurslarni ko'rish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/course/${item.course?.slug}`)}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden flex-row shadow-sm shadow-slate-100"
            >
              <Image
                source={item.course?.thumbnail || 'https://picsum.photos/120/90'}
                style={{ width: 100, height: 90 }}
                contentFit="cover"
              />
              <View className="flex-1 p-3 justify-between">
                <Text className="text-sm font-sans-semibold text-slate-800 dark:text-white" numberOfLines={2}>
                  {item.course?.title}
                </Text>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-sm font-sans-bold text-primary-600">
                    {formatPrice(item.course?.effective_price ?? 0)}
                  </Text>
                  <TouchableOpacity onPress={() => toggleMutation.mutate(item.course_id)} className="p-1">
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
