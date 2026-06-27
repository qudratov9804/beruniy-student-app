import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Star, Clock, Users, BookOpen } from 'lucide-react-native';
import { Card, Badge, ProgressBar, XpBadge } from '@/components/ui';
import { formatDuration, formatPrice } from '@/utils';
import type { Course } from '@/types';

interface CourseCardProps {
  course: Course;
  variant?: 'full' | 'compact' | 'enrolled';
}

const levelColors: Record<string, string> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

const levelLabels: Record<string, string> = {
  beginner: 'Boshlang\'ich',
  intermediate: 'O\'rta',
  advanced: 'Yuqori',
};

export const CourseCard: React.FC<CourseCardProps> = ({ course, variant = 'full' }) => {
  const router = useRouter();

  const handlePress = () => router.push(`/course/${course.id}`);

  if (variant === 'compact') {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85} className="mr-4 w-56">
        <Card variant="elevated" padding="none" className="overflow-hidden">
          <Image
            source={course.thumbnail || 'https://picsum.photos/224/120'}
            style={{ width: '100%', height: 100 }}
            contentFit="cover"
          />
          <View className="p-3">
            <Text className="text-sm font-sans-bold text-slate-800 mb-1" numberOfLines={2}>
              {course.title}
            </Text>
            <View className="flex-row items-center justify-between mt-1">
              <XpBadge xp={course.xpReward} size="sm" />
              <Text className="text-xs text-slate-400">{formatDuration(course.duration)}</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  if (variant === 'enrolled' && course.progress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85} className="mb-4">
        <Card variant="elevated" padding="none" className="overflow-hidden">
          <Image
            source={course.thumbnail || 'https://picsum.photos/400/160'}
            style={{ width: '100%', height: 140 }}
            contentFit="cover"
          />
          <View className="p-4">
            <Badge variant={levelColors[course.level] as 'success' | 'warning' | 'danger'} size="sm">
              {levelLabels[course.level]}
            </Badge>
            <Text className="text-base font-sans-bold text-slate-800 mt-2 mb-1" numberOfLines={2}>
              {course.title}
            </Text>
            <View className="flex-row items-center mb-3">
              <Text className="text-xs text-slate-500">
                {course.progress.completedLessons}/{course.progress.totalLessons} dars
              </Text>
              <Text className="text-xs text-slate-400 ml-auto">
                {course.progress.percentage}%
              </Text>
            </View>
            <ProgressBar progress={course.progress.percentage} height={6} />
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} className="mb-4">
      <Card variant="elevated" padding="none" className="overflow-hidden">
        <Image
          source={course.thumbnail || 'https://picsum.photos/400/180'}
          style={{ width: '100%', height: 160 }}
          contentFit="cover"
        />
        <View className="p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Badge variant={levelColors[course.level] as 'success' | 'warning' | 'danger'} size="sm">
              {levelLabels[course.level]}
            </Badge>
            {course.isFree && <Badge variant="success" size="sm">Bepul</Badge>}
          </View>
          <Text className="text-base font-sans-bold text-slate-800 mb-1" numberOfLines={2}>
            {course.title}
          </Text>
          <Text className="text-sm text-slate-500 mb-3" numberOfLines={2}>
            {course.description}
          </Text>
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text className="text-xs font-sans-semibold text-slate-700">
                {course.rating.toFixed(1)}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Users size={14} color="#94A3B8" />
              <Text className="text-xs text-slate-500">{course.studentsCount}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <BookOpen size={14} color="#94A3B8" />
              <Text className="text-xs text-slate-500">{course.lessonsCount} dars</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Clock size={14} color="#94A3B8" />
              <Text className="text-xs text-slate-500">{formatDuration(course.duration)}</Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <XpBadge xp={course.xpReward} size="sm" />
            <Text className="text-base font-sans-bold text-primary-600">
              {formatPrice(course.price)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};
