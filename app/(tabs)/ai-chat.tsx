import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot, Send, User } from 'lucide-react-native';
import { ScreenBackground } from '@/components/common/ScreenBackground';
import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL || 'http://localhost:3001';
const CHAT_URL =
  Platform.OS === 'web'
    ? `${PROXY_URL}/chat`
    : 'https://api.beruniy-talim.uz/api/v1/ai-chat';

const WELCOME: Message = {
  id: '0',
  role: 'assistant',
  content:
    "Assalomu alaykum! Men Beruniy Talim platformasining AI yordamchisiman. Kurslar, darslar yoki ta'lim bo'yicha savollaringizga javob berishga tayyorman.",
};

export default function AiChatScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = next.map((m) => ({ role: m.role, content: m.content }));
      const { data } = await axios.post(CHAT_URL, { messages: apiMessages });
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, messages, isLoading]);

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Bot size={16} color="#60a5fa" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={isUser ? styles.userText : styles.aiText}>{item.content}</Text>
        </View>
        {isUser && (
          <View style={styles.avatar}>
            <User size={16} color="rgba(255,255,255,0.7)" />
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Bot size={22} color="#60a5fa" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Yordamchi</Text>
            <Text style={styles.headerSub}>Beruniy Talim AI</Text>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />

        {isLoading && (
          <View style={styles.typingRow}>
            <View style={styles.avatar}>
              <Bot size={16} color="#60a5fa" />
            </View>
            <View style={[styles.aiBubble, styles.typingBubble]}>
              <ActivityIndicator size="small" color="#60a5fa" />
            </View>
          </View>
        )}

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Xabar yozing..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!input.trim() || isLoading}
              style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnOff]}
            >
              <Send size={18} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(37,99,235,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.45)', fontSize: 12 },
  list: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8 },
  row: { flexDirection: 'row', marginBottom: 12 },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginHorizontal: 6,
  },
  bubble: { maxWidth: '74%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  userBubble: { backgroundColor: '#2563eb', borderBottomRightRadius: 4 },
  aiBubble: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderBottomLeftRadius: 4,
  },
  userText: { color: '#ffffff', fontSize: 15, lineHeight: 22 },
  aiText: { color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 22 },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  typingBubble: { paddingHorizontal: 16, paddingVertical: 12 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(10,15,30,0.5)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 15,
    maxHeight: 120,
    marginRight: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnOff: { backgroundColor: 'rgba(37,99,235,0.35)' },
});
