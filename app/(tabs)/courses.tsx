import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { useCourses, useCategories } from '@/hooks/useCourses';
import { CourseCard, CategoryChip } from '@/components/course';
import { CourseCardSkeleton } from '@/components/ui';
import { EmptyCoursesIllustration, SearchEmptyIllustration } from '@/components/common/illustrations';
import type { Category, CoursesFilter, CourseLevel } from '@/types';

export default function CoursesScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | null>(null);

  const filters: CoursesFilter = {
    search: search.trim() || undefined,
    category_id: selectedCategory?.id,
    level: selectedLevel ?? undefined,
  };

  const { data, isLoading } = useCourses(filters);
  const { data: categories } = useCategories();

  const levels: { label: string; value: CourseLevel }[] = [
    { label: "Boshlang'ich", value: 'beginner' },
    { label: "O'rta", value: 'intermediate' },
    { label: 'Yuqori', value: 'advanced' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 bg-white">
        <Text className="text-xl font-sans-bold text-slate-800 mb-3">Kurslar</Text>
        <View className="flex-row items-center bg-slate-100 rounded-2xl px-4 h-12">
          <Search size={20} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-3 text-base text-slate-800"
            placeholder="Kurs qidirish..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filters */}
      <View className="bg-white border-b border-slate-100 pb-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-2xl border mr-1 ${!selectedCategory ? 'bg-primary-600 border-primary-600' : 'bg-white border-slate-200'}`}
          >
            <Text
              className={`text-sm font-sans-semibold ${!selectedCategory ? 'text-white' : 'text-slate-600'}`}
            >
              Barchasi
            </Text>
          </TouchableOpacity>
          {categories?.map((cat) => (
            <CategoryChip
              key={cat.id}
              category={cat}
              selected={selectedCategory?.id === cat.id}
              onPress={(c) => setSelectedCategory(selectedCategory?.id === c.id ? null : c)}
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, gap: 8 }}
        >
          {levels.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              onPress={() => setSelectedLevel(selectedLevel === value ? null : value)}
              className={`px-3 py-1.5 rounded-xl border mr-2 ${selectedLevel === value ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <Text
                className={`text-xs font-sans-semibold ${selectedLevel === value ? 'text-white' : 'text-slate-600'}`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
          data={data?.data ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-8">
              {search.trim() ? (
                <SearchEmptyIllustration size={140} />
              ) : (
                <EmptyCoursesIllustration size={140} />
              )}
              <Text className="text-base font-sans-semibold text-slate-600 mt-2">
                {search.trim() ? 'Natija topilmadi' : 'Kurslar yo\'q'}
              </Text>
              <Text className="text-sm text-slate-400 mt-1">
                {search.trim() ? 'Boshqa kalit so\'z kiriting' : 'Hozircha kurslar mavjud emas'}
              </Text>
            </View>
          }
          renderItem={({ item }) => <CourseCard course={item} />}
        />
      )}
    </SafeAreaView>
  );
}
