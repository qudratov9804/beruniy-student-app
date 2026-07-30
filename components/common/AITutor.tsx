import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Bot, Send, AlertTriangle } from 'lucide-react-native';
import { useAskAI } from '@/hooks/useAI';
import { useAIChatStore } from '@/stores';
import type { AIChatExchange } from '@/stores';
import type { SectionLesson } from '@/types';

// Must be a stable reference — `?? []` in the selector below would create a new
// array every call, and zustand's useSyncExternalStore treats that as a changed
// snapshot on every render, causing an infinite re-render loop ("Maximum update
// depth exceeded").
const EMPTY_EXCHANGES: AIChatExchange[] = [];

interface AITutorProps {
  courseId: number;
  courseSlug: string;
  // Used to resolve a source's `lesson_title` back to a lesson id, so the source
  // chip can link straight to that lesson (the AI response itself has no lesson id).
  lessons?: SectionLesson[];
  variant?: 'dark' | 'light';
}

// course/[id].tsx uses a dark glassmorphism theme; lesson/[id].tsx is plain light.
// This is the one part of the UI that genuinely differs between the two hosts.
const theme = {
  dark: {
    container: 'bg-white/5 border-white/10',
    headerIcon: 'bg-primary-600/20 border-primary-400/30',
    title: 'text-white',
    subtitle: 'text-white/45',
    answerBubble: 'bg-white/8 border-white/12',
    answerText: 'text-white/90',
    errorBubble: 'bg-red-500/15 border-red-400/30',
    errorText: 'text-red-300',
    sourceChip: 'bg-primary-400/15 border-primary-400/30',
    sourceChipLinkable: 'bg-primary-400/25 border-primary-300/50',
    sourceText: 'text-primary-200',
    input: 'bg-white/8 border-white/15 text-white',
    placeholderColor: 'rgba(255,255,255,0.35)',
    sendBgDisabled: 'bg-primary-600/45',
  },
  light: {
    container: 'bg-primary-50 border-primary-100',
    headerIcon: 'bg-primary-100 border-primary-200',
    title: 'text-slate-800',
    subtitle: 'text-slate-400',
    answerBubble: 'bg-white border-slate-200',
    answerText: 'text-slate-700',
    errorBubble: 'bg-red-50 border-red-200',
    errorText: 'text-red-600',
    sourceChip: 'bg-primary-50 border-primary-200',
    sourceChipLinkable: 'bg-primary-100 border-primary-300',
    sourceText: 'text-primary-600',
    input: 'bg-white border-slate-200 text-slate-800',
    placeholderColor: '#94A3B8',
    sendBgDisabled: 'bg-primary-300',
  },
} as const;

export const AITutor: React.FC<AITutorProps> = ({
  courseId,
  courseSlug,
  lessons,
  variant = 'dark',
}) => {
  const ui = theme[variant];
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [question, setQuestion] = useState('');
  // useAnimatedKeyboard tracks the real native keyboard frame directly, unlike
  // windowSoftInputMode which doesn't reliably resize the window on Android
  // 15+ edge-to-edge — so the input row lifts itself above the keyboard.
  const keyboard = useAnimatedKeyboard();
  const inputRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value }],
  }));

  const exchanges = useAIChatStore((s) => s.exchangesByCourse[courseId] ?? EMPTY_EXCHANGES);
  const askQuestion = useAIChatStore((s) => s.askQuestion);
  const resolveAnswer = useAIChatStore((s) => s.resolveAnswer);
  const resolveError = useAIChatStore((s) => s.resolveError);

  const askAI = useAskAI({
    onSuccess: (res) => resolveAnswer(courseId, res.answer, res.sources),
    onError: (err: unknown) => {
      const e = err as { response?: { status?: number } };
      const msg =
        e?.response?.status === 503
          ? t('aiTutor.serviceUnavailable')
          : t('aiTutor.answerError');
      resolveError(courseId, msg);
    },
  });

  const allLessons = lessons ?? [];

  const handleAsk = () => {
    const trimmed = question.trim();
    if (!trimmed || askAI.isPending) return;
    askQuestion(courseId, trimmed);
    setQuestion('');
    askAI.mutate({ question: trimmed, course_id: courseId, language: i18n.language as 'uz' | 'ru' | 'en' });
  };

  return (
    <View className={`rounded-3xl border p-4 ${ui.container}`}>
      <View className="flex-row items-center gap-3 mb-3.5">
        <View className={`w-9 h-9 rounded-xl border items-center justify-center ${ui.headerIcon}`}>
          <Bot size={18} color="#2563EB" />
        </View>
        <View className="flex-1">
          <Text className={`text-sm font-sans-bold ${ui.title}`}>{t('aiTutor.title')}</Text>
          <Text className={`text-xs mt-0.5 ${ui.subtitle}`}>
            {t('aiTutor.subtitle')}
          </Text>
        </View>
      </View>

      {exchanges.map((ex, i) => {
        const isPending = i === exchanges.length - 1 && askAI.isPending && !ex.answer && !ex.error;
        return (
          <View key={i} className="mb-3.5 gap-2">
            <View className="self-end max-w-[85%] bg-primary-600 rounded-2xl rounded-br-md px-3.5 py-2.5">
              <Text className="text-white text-sm leading-5">{ex.question}</Text>
            </View>
            {isPending ? (
              <View
                className={`self-start max-w-[85%] flex-row items-center gap-2 border rounded-2xl rounded-bl-md px-3.5 py-2.5 ${ui.answerBubble}`}
              >
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className={`text-xs font-sans-medium ${ui.subtitle}`}>{t('aiTutor.thinking')}</Text>
              </View>
            ) : ex.error ? (
              <View
                className={`self-start max-w-[85%] flex-row items-center gap-1.5 border rounded-2xl rounded-bl-md px-3.5 py-2.5 ${ui.errorBubble}`}
              >
                <AlertTriangle size={14} color="#EF4444" />
                <Text className={`text-xs font-sans-semibold flex-1 ${ui.errorText}`}>{ex.error}</Text>
              </View>
            ) : ex.answer ? (
              <View className={`self-start max-w-[85%] border rounded-2xl rounded-bl-md px-3.5 py-2.5 ${ui.answerBubble}`}>
                <Text className={`text-sm leading-5 ${ui.answerText}`}>{ex.answer}</Text>
                {ex.sources && ex.sources.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5 mt-2.5">
                    {ex.sources.map((source, si) => {
                      const matchedLesson = allLessons.find((l) => l.title === source.lesson_title);
                      const chipClass = `rounded-lg border px-2 py-1 ${
                        matchedLesson ? ui.sourceChipLinkable : ui.sourceChip
                      }`;
                      const chipContent = (
                        <Text className={`text-[10px] font-sans-semibold ${ui.sourceText}`} numberOfLines={1}>
                          {source.lesson_title} · {source.timestamp}
                        </Text>
                      );
                      return matchedLesson ? (
                        <TouchableOpacity
                          key={si}
                          className={chipClass}
                          onPress={() =>
                            router.push(
                              `/lesson/${matchedLesson.id}?courseId=${courseId}&courseSlug=${courseSlug}`
                            )
                          }
                        >
                          {chipContent}
                        </TouchableOpacity>
                      ) : (
                        <View key={si} className={chipClass}>
                          {chipContent}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : null}
          </View>
        );
      })}

      <Animated.View style={inputRowStyle}>
        <View className="flex-row items-end gap-2 mt-1">
          <TextInput
            className={`flex-1 rounded-2xl border px-3.5 py-2.5 text-sm max-h-[100px] ${ui.input}`}
            value={question}
            onChangeText={setQuestion}
            placeholder={t('aiTutor.inputPlaceholder')}
            placeholderTextColor={ui.placeholderColor}
            multiline
          />
          <TouchableOpacity
            onPress={handleAsk}
            disabled={!question.trim() || askAI.isPending}
            className={`w-11 h-11 rounded-2xl items-center justify-center ${
              !question.trim() || askAI.isPending ? ui.sendBgDisabled : 'bg-primary-600'
            }`}
          >
            <Send size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};
