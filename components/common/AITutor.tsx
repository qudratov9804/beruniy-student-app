import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Bot, Send, AlertTriangle } from 'lucide-react-native';
import { useAskAI } from '@/hooks/useAI';
import { useAIChatStore } from '@/stores';
import type { AIChatExchange } from '@/stores';
import type { Section } from '@/types';

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
  sections?: Section[];
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
  sections,
  variant = 'dark',
}) => {
  const t = theme[variant];
  const router = useRouter();
  const [question, setQuestion] = useState('');

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
          ? "AI xizmat hozircha mavjud emas. Birozdan so'ng qayta urinib ko'ring."
          : 'Savolga javob berishda xatolik yuz berdi.';
      resolveError(courseId, msg);
    },
  });

  const allLessons = (sections ?? []).flatMap((section) => section.lessons ?? []);

  const handleAsk = () => {
    const trimmed = question.trim();
    if (!trimmed || askAI.isPending) return;
    askQuestion(courseId, trimmed);
    setQuestion('');
    askAI.mutate({ question: trimmed, course_id: courseId, language: 'uz' });
  };

  return (
    <View className={`rounded-3xl border p-4 ${t.container}`}>
      <View className="flex-row items-center gap-3 mb-3.5">
        <View className={`w-9 h-9 rounded-xl border items-center justify-center ${t.headerIcon}`}>
          <Bot size={18} color="#2563EB" />
        </View>
        <View className="flex-1">
          <Text className={`text-sm font-sans-bold ${t.title}`}>AI yordamchi</Text>
          <Text className={`text-xs mt-0.5 ${t.subtitle}`}>
            Kurs bo'yicha savol bering, AI tutor javob beradi
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
              <View className={`self-start max-w-[92%] border rounded-2xl rounded-bl-md px-3.5 py-2.5 ${t.answerBubble}`}>
                <ActivityIndicator size="small" color="#2563EB" />
              </View>
            ) : ex.error ? (
              <View
                className={`self-start max-w-[92%] flex-row items-center gap-1.5 border rounded-2xl rounded-bl-md px-3.5 py-2.5 ${t.errorBubble}`}
              >
                <AlertTriangle size={14} color="#EF4444" />
                <Text className={`text-xs font-sans-semibold flex-1 ${t.errorText}`}>{ex.error}</Text>
              </View>
            ) : ex.answer ? (
              <View className={`self-start max-w-[92%] border rounded-2xl rounded-bl-md px-3.5 py-2.5 ${t.answerBubble}`}>
                <Text className={`text-sm leading-5 ${t.answerText}`}>{ex.answer}</Text>
                {ex.sources && ex.sources.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5 mt-2.5">
                    {ex.sources.map((source, si) => {
                      const matchedLesson = allLessons.find((l) => l.title === source.lesson_title);
                      const chipClass = `rounded-lg border px-2 py-1 ${
                        matchedLesson ? t.sourceChipLinkable : t.sourceChip
                      }`;
                      const chipContent = (
                        <Text className={`text-[10px] font-sans-semibold ${t.sourceText}`} numberOfLines={1}>
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

      <View className="flex-row items-end gap-2 mt-1">
        <TextInput
          className={`flex-1 rounded-2xl border px-3.5 py-2.5 text-sm max-h-[100px] ${t.input}`}
          value={question}
          onChangeText={setQuestion}
          placeholder="Masalan: React hookslar nima?"
          placeholderTextColor={t.placeholderColor}
          multiline
        />
        <TouchableOpacity
          onPress={handleAsk}
          disabled={!question.trim() || askAI.isPending}
          className={`w-11 h-11 rounded-2xl items-center justify-center ${
            !question.trim() || askAI.isPending ? t.sendBgDisabled : 'bg-primary-600'
          }`}
        >
          <Send size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
