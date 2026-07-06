import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Bot, Send, AlertTriangle } from 'lucide-react-native';
import { useAskAI } from '@/hooks/useAI';
import type { AISource } from '@/types';

interface AiAskPanelProps {
  courseId: number;
  title?: string;
  subtitle?: string;
}

interface Exchange {
  question: string;
  answer?: string;
  sources?: AISource[];
  error?: string;
}

export const AiAskPanel: React.FC<AiAskPanelProps> = ({
  courseId,
  title = 'AI yordamchi',
  subtitle = "Kurs bo'yicha savol bering, AI tutor javob beradi",
}) => {
  const [question, setQuestion] = useState('');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);

  const askAI = useAskAI({
    onSuccess: (res) => {
      setExchanges((prev) =>
        prev.map((ex, i) =>
          i === prev.length - 1 ? { ...ex, answer: res.answer, sources: res.sources } : ex
        )
      );
    },
    onError: (err: unknown) => {
      const e = err as { response?: { status?: number } };
      const msg =
        e?.response?.status === 503
          ? "AI xizmat hozircha mavjud emas. Birozdan so'ng qayta urinib ko'ring."
          : 'Savolga javob berishda xatolik yuz berdi.';
      setExchanges((prev) => prev.map((ex, i) => (i === prev.length - 1 ? { ...ex, error: msg } : ex)));
    },
  });

  const handleAsk = () => {
    const q = question.trim();
    if (!q || askAI.isPending) return;
    setExchanges((prev) => [...prev, { question: q }]);
    setQuestion('');
    askAI.mutate({ question: q, course_id: courseId, language: 'uz' });
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Bot size={18} color="#60a5fa" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {exchanges.map((ex, i) => {
        const isPending = i === exchanges.length - 1 && askAI.isPending && !ex.answer && !ex.error;
        return (
          <View key={i} style={styles.exchange}>
            <View style={styles.questionBubble}>
              <Text style={styles.questionText}>{ex.question}</Text>
            </View>
            {isPending ? (
              <View style={styles.answerBubble}>
                <ActivityIndicator size="small" color="#60a5fa" />
              </View>
            ) : ex.error ? (
              <View style={styles.errorBubble}>
                <AlertTriangle size={14} color="#f87171" />
                <Text style={styles.errorText}>{ex.error}</Text>
              </View>
            ) : ex.answer ? (
              <View style={styles.answerBubble}>
                <Text style={styles.answerText}>{ex.answer}</Text>
                {ex.sources && ex.sources.length > 0 && (
                  <View style={styles.sources}>
                    {ex.sources.map((s, si) => (
                      <View key={si} style={styles.sourceChip}>
                        <Text style={styles.sourceText} numberOfLines={1}>
                          {s.lesson_title} · {s.timestamp}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : null}
          </View>
        );
      })}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="Masalan: React hookslar nima?"
          placeholderTextColor="rgba(255,255,255,0.35)"
          multiline
        />
        <TouchableOpacity
          onPress={handleAsk}
          disabled={!question.trim() || askAI.isPending}
          style={[styles.sendBtn, (!question.trim() || askAI.isPending) && styles.sendBtnDisabled]}
        >
          <Send size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 20, marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    padding: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  headerIcon: {
    width: 38, height: 38, borderRadius: 13,
    backgroundColor: 'rgba(37,99,235,0.20)',
    borderWidth: 1, borderColor: 'rgba(96,165,250,0.30)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 1 },
  exchange: { marginBottom: 14, gap: 8 },
  questionBubble: {
    alignSelf: 'flex-end', maxWidth: '85%',
    backgroundColor: '#2563eb', borderRadius: 14, borderBottomRightRadius: 4,
    paddingHorizontal: 13, paddingVertical: 9,
  },
  questionText: { color: '#ffffff', fontSize: 13, lineHeight: 19 },
  answerBubble: {
    alignSelf: 'flex-start', maxWidth: '92%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14, borderBottomLeftRadius: 4,
    paddingHorizontal: 13, paddingVertical: 10,
  },
  answerText: { color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 20 },
  errorBubble: {
    alignSelf: 'flex-start', maxWidth: '92%', flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(239,68,68,0.14)',
    borderWidth: 1, borderColor: 'rgba(248,113,113,0.30)',
    borderRadius: 14, borderBottomLeftRadius: 4,
    paddingHorizontal: 13, paddingVertical: 9,
  },
  errorText: { color: '#fca5a5', fontSize: 12, fontWeight: '600', flex: 1 },
  sources: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  sourceChip: {
    maxWidth: '100%',
    backgroundColor: 'rgba(96,165,250,0.14)',
    borderWidth: 1, borderColor: 'rgba(96,165,250,0.28)',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  sourceText: { color: '#93c5fd', fontSize: 10, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 4 },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 13, paddingVertical: 10,
    color: '#ffffff', fontSize: 13, maxHeight: 100,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: 'rgba(37,99,235,0.45)' },
});
