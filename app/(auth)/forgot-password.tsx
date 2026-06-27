import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, ChevronLeft, CheckCircle } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { Button, Input } from '@/components/ui';
import { authService } from '@/services/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: () => authService.forgotPassword({ email: email.trim().toLowerCase() }),
    onSuccess: () => setSent(true),
  });

  const handleSubmit = () => {
    if (!email.trim()) {
      setEmailError('Email kiritish shart');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Email noto'g'ri");
      return;
    }
    setEmailError('');
    mutation.mutate();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-6 pt-6 flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mb-6 self-start p-2 -ml-2">
            <ChevronLeft size={28} color="#0F172A" />
          </TouchableOpacity>

          {sent ? (
            <View className="flex-1 items-center justify-center">
              <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                <CheckCircle size={40} color="#22C55E" />
              </View>
              <Text className="text-xl font-sans-bold text-slate-800 mb-2 text-center">
                Xat yuborildi!
              </Text>
              <Text className="text-base text-slate-500 text-center mb-8">
                {email} manziliga parolni tiklash uchun xat yuborildi.
              </Text>
              <Button fullWidth onPress={() => router.back()}>
                Ortga qaytish
              </Button>
            </View>
          ) : (
            <>
              <Text className="text-2xl font-sans-bold text-slate-800 mb-2">Parolni tiklash</Text>
              <Text className="text-base text-slate-500 mb-8">
                Email manzilingizni kiriting, tiklash uchun xat yuboramiz.
              </Text>
              <Input
                label="Email"
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
                leftIcon={<Mail size={20} color="#94A3B8" />}
              />
              <Button fullWidth size="lg" onPress={handleSubmit} loading={mutation.isPending}>
                Xat yuborish
              </Button>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
