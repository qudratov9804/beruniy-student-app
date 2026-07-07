import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react-native';
import { lessonsService } from '@/services/api';
import { Skeleton } from '@/components/ui';
import { QUERY_KEYS } from '@/constants/config';
import { formatTimestamp } from '@/utils';

interface TranscriptPanelProps {
  courseId: number;
  lessonId: number;
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  courseId,
  lessonId,
  currentTime,
  onSeek,
}) => {
  const { data: transcript, isLoading } = useQuery({
    queryKey: QUERY_KEYS.LESSONS.TRANSCRIPT(courseId, lessonId),
    queryFn: () => lessonsService.getTranscript(courseId, lessonId),
    enabled: !!courseId && !!lessonId,
  });

  const scrollRef = useRef<ScrollView>(null);
  const rowOffsets = useRef<Record<number, number>>({});
  const lastScrolledIndex = useRef<number | null>(null);

  const segments = transcript?.segments ?? [];
  const activeIndex = segments.findIndex((seg) => currentTime >= seg.start && currentTime < seg.end);

  useEffect(() => {
    if (activeIndex < 0 || activeIndex === lastScrolledIndex.current) return;
    lastScrolledIndex.current = activeIndex;
    const y = rowOffsets.current[activeIndex];
    if (y != null) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 60), animated: true });
    }
  }, [activeIndex]);

  if (isLoading) {
    return (
      <View className="mb-6">
        <Skeleton height={16} width="40%" className="mb-3" />
        <Skeleton height={44} borderRadius={12} className="mb-2" />
        <Skeleton height={44} borderRadius={12} />
      </View>
    );
  }

  if (!transcript || transcript.status !== 'completed' || segments.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      <View className="flex-row items-center gap-2 mb-3">
        <FileText size={16} color="#64748B" />
        <Text className="text-sm font-sans-bold text-slate-700">Transkripsiya</Text>
      </View>
      <ScrollView
        ref={scrollRef}
        style={{ maxHeight: 260 }}
        className="border border-slate-100 rounded-2xl"
        showsVerticalScrollIndicator={false}
      >
        {segments.map((segment, index) => {
          const isActive = index === activeIndex;
          return (
            <TouchableOpacity
              key={segment.id}
              onPress={() => onSeek(segment.start)}
              onLayout={(e: LayoutChangeEvent) => {
                rowOffsets.current[index] = e.nativeEvent.layout.y;
              }}
              activeOpacity={0.7}
              className={`flex-row gap-3 px-4 py-2.5 ${isActive ? 'bg-primary-50' : ''}`}
            >
              <Text
                className={`text-xs font-sans-semibold w-10 ${
                  isActive ? 'text-primary-600' : 'text-slate-400'
                }`}
              >
                {formatTimestamp(segment.start)}
              </Text>
              <Text
                className={`flex-1 text-sm leading-5 ${
                  isActive ? 'text-primary-700 font-sans-semibold' : 'text-slate-600'
                }`}
              >
                {segment.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
