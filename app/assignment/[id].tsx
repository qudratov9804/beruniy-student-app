import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import { assignmentService } from '@/services/api';
import { Button, Card, Skeleton } from '@/components/ui';
import { HtmlText } from '@/components/common/HtmlText';
import { EmptyState } from '@/components/common/EmptyState';
import { QUERY_KEYS } from '@/constants/config';
import { formatDate } from '@/utils';
import type { AssignmentSubmissionStatus } from '@/types';

const getErrorMessage = (err: unknown): string => {
  const e = err as { response?: { status?: number; data?: { message?: string } } };
  if (e?.response?.status === 403) {
    return "Bu topshiriqni ko'rish uchun kursga yozilgan bo'lishingiz kerak.";
  }
  return e?.response?.data?.message ?? 'Topshiriqni yuklashda xatolik yuz berdi.';
};

const noRetryOnAuthError = (failureCount: number, err: unknown) => {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 401 || status === 403 || status === 404 || status === 422) return false;
  return failureCount < 2;
};

const statusMeta: Record<AssignmentSubmissionStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: 'Tekshirilmoqda', color: '#f59e0b', icon: Clock },
  approved: { label: 'Qabul qilindi', color: '#22c55e', icon: CheckCircle2 },
  rejected: { label: 'Rad etildi', color: '#ef4444', icon: XCircle },
};

export default function AssignmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const lessonId = Number(id);

  const [content, setContent] = useState('');

  const {
    data: assignment,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.ASSIGNMENT.DETAIL(lessonId),
    queryFn: () => assignmentService.getByLessonId(lessonId),
    enabled: !!lessonId,
    retry: noRetryOnAuthError,
  });

  const submitMutation = useMutation({
    mutationFn: () => assignmentService.submit(lessonId, content.trim()),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNMENT.DETAIL(lessonId) });
    },
  });

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-5 py-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft size={28} color="#0F172A" />
          </TouchableOpacity>
        </View>
        <EmptyState
          emoji="😕"
          title={getErrorMessage(error)}
          actionLabel="Qayta urinish"
          onAction={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  if (isLoading || !assignment) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 pt-4">
          <Skeleton height={24} width="60%" className="mb-4" />
          <Skeleton height={80} borderRadius={12} className="mb-4" />
          <Skeleton height={120} borderRadius={12} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-5 py-4 border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-3">
          <ChevronLeft size={28} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-base font-sans-bold text-slate-800">Topshiriq</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-4 mb-6">
          <HtmlText html={assignment.content} baseFontSize={15} color="#334155" />
        </View>

        {assignment.submissions.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-sans-bold text-slate-700 mb-3">Yuborilgan javoblar</Text>
            {assignment.submissions.map((submission) => {
              const meta = statusMeta[submission.status];
              const StatusIcon = meta.icon;
              return (
                <Card key={submission.id} variant="filled" padding="md" className="mb-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-1.5">
                      <StatusIcon size={15} color={meta.color} />
                      <Text style={{ color: meta.color }} className="text-xs font-sans-semibold">
                        {meta.label}
                      </Text>
                    </View>
                    <Text className="text-xs text-slate-400">
                      {formatDate(submission.submitted_at)}
                    </Text>
                  </View>
                  {submission.content && (
                    <Text className="text-sm text-slate-600 mb-1">{submission.content}</Text>
                  )}
                  {submission.grade != null && (
                    <Text className="text-xs text-slate-500">Baho: {submission.grade}</Text>
                  )}
                  {submission.feedback && (
                    <Text className="text-xs text-slate-500 mt-1">Izoh: {submission.feedback}</Text>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        <Text className="text-sm font-sans-bold text-slate-700 mb-2">Javobingizni yozing</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Topshiriq bo'yicha javobingizni shu yerga yozing..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          className="border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 mb-4 min-h-[120px]"
        />

        <View className="h-24" />
      </ScrollView>

      <View className="px-5 pb-6 pt-3 border-t border-slate-100">
        <Button
          fullWidth
          size="lg"
          onPress={() => submitMutation.mutate()}
          disabled={!content.trim() || submitMutation.isPending}
          loading={submitMutation.isPending}
        >
          Yuborish
        </Button>
      </View>
    </SafeAreaView>
  );
}
