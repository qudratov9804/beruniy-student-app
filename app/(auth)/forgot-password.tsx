import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Phone, ChevronLeft, CheckCircle } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ScreenBackground } from '@/components/common';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { sendOtp, isSendingOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      setPhoneError(t('auth.validation.phoneRequired'));
      return;
    }
    if (!/^\+998\d{9}$/.test(trimmed)) {
      setPhoneError(t('auth.validation.phoneInvalid'));
      return;
    }
    setPhoneError('');
    try {
      await sendOtp({ phone: trimmed, type: 'reset' });
      setSent(true);
    } catch {
      setPhoneError(t('auth.forgotPassword.sendError'));
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1 bg-transparent">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="px-6 pt-6 flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mb-6 self-start p-2 -ml-2">
              <ChevronLeft size={28} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>

            {sent ? (
              <View className="flex-1 items-center justify-center">
                <View className="w-20 h-20 bg-green-500/20 rounded-full items-center justify-center mb-4 border border-green-400/30">
                  <CheckCircle size={40} color="#34d399" />
                </View>
                <Text className="text-xl font-sans-bold text-white mb-2 text-center">
                  {t('auth.forgotPassword.sentTitle')}
                </Text>
                <Text className="text-base text-white/70 text-center mb-8">
                  {t('auth.forgotPassword.sentSubtitle', { phone })}
                </Text>
                <Button fullWidth onPress={() => router.back()}>
                  {t('auth.forgotPassword.back')}
                </Button>
              </View>
            ) : (
              <View className="bg-white/10 rounded-3xl p-6 border border-white/20">
                <Text className="text-2xl font-sans-bold text-white mb-2">{t('auth.forgotPassword.title')}</Text>
                <Text className="text-base text-white/70 mb-8">
                  {t('auth.forgotPassword.subtitle')}
                </Text>
                <Input
                  label={t('auth.login.phoneLabel')}
                  placeholder="+998901234567"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  error={phoneError}
                  leftIcon={<Phone size={20} color="#94A3B8" />}
                />
                <Button fullWidth size="lg" onPress={handleSubmit} loading={isSendingOtp}>
                  {t('auth.forgotPassword.submit')}
                </Button>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
