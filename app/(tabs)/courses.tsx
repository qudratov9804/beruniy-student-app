import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronDown, Check, X } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { useInfiniteCourses, useCategories } from '@/hooks/useCourses';
import { CourseCard } from '@/components/course';
import { CourseCardSkeleton } from '@/components/ui';
import { EmptyCoursesIllustration, SearchEmptyIllustration } from '@/components/common/illustrations';
import { ScreenBackground, AppHeader } from '@/components/common';
import type { Category, CoursesFilter, CourseLevel } from '@/types';

export default function CoursesScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [search, setSearch] = useState(q ?? '');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [levelModalVisible, setLevelModalVisible] = useState(false);
  const [prevQ, setPrevQ] = useState(q);

  if (q !== prevQ) {
    setPrevQ(q);
    if (q) setSearch(q);
  }

  const filters: CoursesFilter = {
    search: search.trim() || undefined,
    category_id: selectedCategory?.id,
    level: selectedLevel ?? undefined,
  };

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCourses(filters);
  const { data: categories } = useCategories();

  const courses = data?.pages.flatMap((page) => page.data) ?? [];

  const levels: { label: string; value: CourseLevel }[] = [
    { label: "Boshlang'ich", value: 'beginner' },
    { label: "O'rta", value: 'intermediate' },
    { label: 'Yuqori', value: 'advanced' },
  ];

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1 bg-transparent">
        <AppHeader title="Kurslar" />

        {/* Search + filters — one combined row */}
        <View className="flex-row items-center gap-2 px-5 pb-3 border-b border-white/10">
          <View className="flex-1 flex-row items-center bg-white/85 rounded-2xl px-3 h-12 border border-white/30">
            <Search size={18} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-2 text-sm text-slate-800"
              placeholder="Kurs qidirish..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <TouchableOpacity
            onPress={() => setCategoryModalVisible(true)}
            activeOpacity={0.8}
            className="flex-row items-center gap-1 bg-white/10 border border-white/20 rounded-2xl px-2.5 h-12"
            style={{ maxWidth: 118 }}
          >
            <Text className="text-xs font-sans-semibold text-white flex-shrink" numberOfLines={1}>
              {selectedCategory ? selectedCategory.name : 'Kategoriya'}
            </Text>
            <ChevronDown size={14} color="rgba(255,255,255,0.70)" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLevelModalVisible(true)}
            activeOpacity={0.8}
            className="flex-row items-center gap-1 bg-white/10 border border-white/20 rounded-2xl px-2.5 h-12"
            style={{ maxWidth: 96 }}
          >
            <Text className="text-xs font-sans-semibold text-white flex-shrink" numberOfLines={1}>
              {selectedLevel ? levels.find((l) => l.value === selectedLevel)?.label : 'Daraja'}
            </Text>
            <ChevronDown size={14} color="rgba(255,255,255,0.70)" />
          </TouchableOpacity>
        </View>

        {/* Course List */}
        {isLoading ? (
          <View className="px-5 pt-4">
            {[1, 2, 3].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </View>
        ) : (
          <FlatList
            className="flex-1"
            data={courses}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#60a5fa" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center py-8">
                {search.trim() ? (
                  <SearchEmptyIllustration size={140} />
                ) : (
                  <EmptyCoursesIllustration size={140} />
                )}
                <Text className="text-base font-sans-semibold text-white/80 mt-2">
                  {search.trim() ? 'Natija topilmadi' : "Kurslar yo'q"}
                </Text>
                <Text className="text-sm text-white/50 mt-1">
                  {search.trim() ? "Boshqa kalit so'z kiriting" : 'Hozircha kurslar mavjud emas'}
                </Text>
              </View>
            }
            renderItem={({ item }) => <CourseCard course={item} />}
          />
        )}
      </SafeAreaView>

      {/* Category select modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
          className="flex-1 bg-black/65 items-center justify-center px-5"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            className="w-full rounded-3xl border border-white/15 bg-slate-900 p-5"
            style={{ maxHeight: '70%' }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-sans-bold text-white">Kategoriya tanlang</Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
              >
                <X size={16} color="rgba(255,255,255,0.75)" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={categories ?? []}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(null);
                    setCategoryModalVisible(false);
                  }}
                  className="flex-row items-center justify-between py-3 border-b border-white/10"
                >
                  <Text className="text-sm font-sans-semibold text-white">Barcha kategoriyalar</Text>
                  {!selectedCategory && <Check size={18} color="#60a5fa" />}
                </TouchableOpacity>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(item);
                    setCategoryModalVisible(false);
                  }}
                  className="flex-row items-center justify-between py-3 border-b border-white/10"
                >
                  <Text className="text-sm font-sans-semibold text-white">
                    {item.icon ? `${item.icon} ` : ''}{item.name}
                  </Text>
                  {selectedCategory?.id === item.id && <Check size={18} color="#60a5fa" />}
                </TouchableOpacity>
              )}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Level select modal */}
      <Modal
        visible={levelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLevelModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setLevelModalVisible(false)}
          className="flex-1 bg-black/65 items-center justify-center px-5"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            className="w-full rounded-3xl border border-white/15 bg-slate-900 p-5"
            style={{ maxHeight: '70%' }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-sans-bold text-white">Darajani tanlang</Text>
              <TouchableOpacity
                onPress={() => setLevelModalVisible(false)}
                className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
              >
                <X size={16} color="rgba(255,255,255,0.75)" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={levels}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <TouchableOpacity
                  onPress={() => {
                    setSelectedLevel(null);
                    setLevelModalVisible(false);
                  }}
                  className="flex-row items-center justify-between py-3 border-b border-white/10"
                >
                  <Text className="text-sm font-sans-semibold text-white">Barcha darajalar</Text>
                  {!selectedLevel && <Check size={18} color="#60a5fa" />}
                </TouchableOpacity>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedLevel(item.value);
                    setLevelModalVisible(false);
                  }}
                  className="flex-row items-center justify-between py-3 border-b border-white/10"
                >
                  <Text className="text-sm font-sans-semibold text-white">{item.label}</Text>
                  {selectedLevel === item.value && <Check size={18} color="#60a5fa" />}
                </TouchableOpacity>
              )}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScreenBackground>
  );
}
