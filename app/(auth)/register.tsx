import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { User, ChevronLeft, GraduationCap, BookOpen } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import { useAuthStore } from '@/stores';
import { ScreenBackground } from '@/components/common';
import { PHONE_PREFIX, normalizePhoneInput, toFullPhone } from '@/utils/phone';

type Step = 'phone' | 'otp' | 'profile';
const OTP_LENGTH = 6;

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { sendOtp, verifyOtp, registerComplete, isSendingOtp, isVerifyingOtp, isRegisteringComplete } =
    useAuth();
  const { setToken } = useAuthStore();

  const [step, setStep] = useState<Step>('phone');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [registrationToken, setRegistrationToken] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const hiddenOtpRef = useRef<TextInput>(null);
  const cellRefs = useRef<(TextInput | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phone = toFullPhone(phoneDigits);
  const otp = digits.join('');

  const startCountdown = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleHiddenOtpChange = (value: string) => {
    const clean = value.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    if (clean.length > 0) {
      const next = Array(OTP_LENGTH).fill('');
      clean.split('').forEach((d, i) => { next[i] = d; });
      setDigits(next);
      setError('');
      if (clean.length === OTP_LENGTH) {
        setTimeout(() => handleVerifyOtp(clean), 100);
      }
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhoneDigits(normalizePhoneInput(value));
    setError('');
  };

  const formatPhoneDisplay = (digits: string) => {
    const d = digits.padEnd(9, '');
    return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`.trim();
  };

  const handleSendOtp = async () => {
    if (phoneDigits.length !== 9) { setError(t('auth.register.errors.digitsRequired')); return; }
    setError('');
    try {
      const res = await sendOtp({ phone, type: 'register' });
      if (res?.expires_in) startCountdown(res.expires_in);
      setDigits(Array(OTP_LENGTH).fill(''));
      setStep('otp');
      setTimeout(() => hiddenOtpRef.current?.focus(), 300);
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown }; message?: string };
      const detail = JSON.stringify(e?.response?.data ?? e?.message ?? err);
      setError(t('auth.register.errors.errorPrefix', { detail }));
    }
  };

  const handleCellChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');
    if (digit && index < OTP_LENGTH - 1) cellRefs.current[index + 1]?.focus();
    if (next.every((d) => d !== '') && digit) handleVerifyOtp(next.join(''));
  };

  const handleCellKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      cellRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const finalCode = code ?? otp;
    if (finalCode.length < OTP_LENGTH) { setError(t('auth.register.errors.allDigitsRequired')); return; }
    setError('');
    try {
      const res = await verifyOtp({ phone, code: finalCode, type: 'register' });
      if (res.registration_token) {
        setRegistrationToken(res.registration_token);
        setStep('profile');
      } else if (res.token) {
        await setToken(res.token);
        router.replace('/(tabs)');
      } else {
        setError(t('auth.register.errors.wrongCode'));
        setDigits(Array(OTP_LENGTH).fill(''));
        setTimeout(() => hiddenOtpRef.current?.focus(), 100);
      }
    } catch {
      setError(t('auth.register.errors.wrongOrExpiredCode'));
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => hiddenOtpRef.current?.focus(), 100);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isSendingOtp) return;
    setError('');
    setDigits(Array(OTP_LENGTH).fill(''));
    try {
      const res = await sendOtp({ phone, type: 'register' });
      if (res?.expires_in) startCountdown(res.expires_in);
      setTimeout(() => hiddenOtpRef.current?.focus(), 300);
    } catch { setError(t('auth.register.errors.smsSendError')); }
  };

  const handleComplete = async () => {
    if (!name.trim()) { setError(t('auth.register.errors.nameRequired')); return; }
    setError('');
    try {
      await registerComplete({ registration_token: registrationToken, name: name.trim(), role });
    } catch { setError(t('auth.register.errors.registerError')); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1 bg-transparent">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View className="px-6 pt-6 pb-8">
              <TouchableOpacity
                onPress={() => (step === 'phone' ? router.back() : setStep(step === 'otp' ? 'phone' : 'otp'))}
                className="mb-6 self-start p-2 -ml-2"
              >
                <ChevronLeft size={28} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>

              {/* Step indicator */}
              <View className="flex-row items-center mb-8 gap-2">
                {(['phone', 'otp', 'profile'] as Step[]).map((s, i) => (
                  <View key={s} className={`h-1.5 flex-1 rounded-full ${
                    step === s || (['otp', 'profile'].includes(step) && i === 0) || (step === 'profile' && i === 1)
                      ? 'bg-blue-400' : 'bg-white/20'
                  }`} />
                ))}
              </View>

              {/* Glass card wrapper */}
              <View className="bg-white/10 rounded-3xl p-6 border border-white/20">

                {/* PHONE STEP */}
                {step === 'phone' && (
                  <>
                    <Image
                      source={{ uri: 'https://beruniy-talim.uz/_next/image?url=%2Flogo-400.png&w=750&q=75' }}
                      style={{ width: 120, height: 60, marginBottom: 16 }}
                      contentFit="contain"
                    />
                    <Text className="text-2xl font-sans-bold text-white mb-1">{t('auth.register.title')}</Text>
                    <Text className="text-base text-white/70 mb-8">{t('auth.register.subtitle')}</Text>

                    <View className="mb-4">
                      <Text className="mb-2 text-sm font-sans-semibold text-white/80">{t('auth.register.phoneLabel')}</Text>
                      <View className={`flex-row items-center border rounded-2xl bg-white/85 px-4 ${error ? 'border-red-400' : 'border-white/40'}`}>
                        <View className="mr-2 pr-2 border-r border-slate-300 py-3">
                          <Text className="text-base font-sans-semibold text-slate-800">{PHONE_PREFIX}</Text>
                        </View>
                        <TextInput
                          className="flex-1 h-12 text-slate-900 text-base"
                          placeholder="XX XXX XX XX"
                          placeholderTextColor="#94A3B8"
                          value={formatPhoneDisplay(phoneDigits)}
                          onChangeText={handlePhoneChange}
                          keyboardType="number-pad"
                          maxLength={12}
                          autoComplete="tel"
                          textContentType="telephoneNumber"
                        />
                      </View>
                      {error ? <Text className="mt-1 text-xs text-red-400">{error}</Text> : null}
                    </View>

                    <Button fullWidth size="lg" onPress={handleSendOtp} loading={isSendingOtp}
                      disabled={phoneDigits.length !== 9}>
                      {t('auth.register.sendOtp')}
                    </Button>
                  </>
                )}

                {/* OTP STEP */}
                {step === 'otp' && (
                  <>
                    <Text className="text-2xl font-sans-bold text-white mb-1">{t('auth.register.otpTitle')}</Text>
                    <Text className="text-base text-white/70 mb-8">
                      {t('auth.register.otpSubtitle', { phone: `${PHONE_PREFIX} ${formatPhoneDisplay(phoneDigits)}` })}
                    </Text>

                    <TextInput
                      ref={hiddenOtpRef}
                      value={otp}
                      onChangeText={handleHiddenOtpChange}
                      keyboardType="number-pad"
                      maxLength={OTP_LENGTH}
                      textContentType="oneTimeCode"
                      autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                      style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
                    />

                    <View className="flex-row justify-between mb-6">
                      {digits.map((digit, i) => (
                        <TouchableOpacity key={i} onPress={() => { hiddenOtpRef.current?.focus(); cellRefs.current[i]?.focus(); }}>
                          <TextInput
                            ref={(r) => { cellRefs.current[i] = r; }}
                            value={digit}
                            onChangeText={(v) => handleCellChange(v, i)}
                            onKeyPress={(e) => handleCellKeyPress(e, i)}
                            keyboardType="number-pad"
                            maxLength={2}
                            style={{
                              width: 44,
                              height: 56,
                              borderWidth: 2,
                              borderColor: digit ? '#60a5fa' : 'rgba(255,255,255,0.25)',
                              borderRadius: 12,
                              textAlign: 'center',
                              fontSize: 22,
                              fontWeight: '700',
                              color: '#ffffff',
                              backgroundColor: digit ? 'rgba(96,165,250,0.20)' : 'rgba(255,255,255,0.10)',
                            }}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>

                    {error ? (
                      <View className="bg-red-500/20 border border-red-400/40 rounded-2xl p-3 mb-4">
                        <Text className="text-red-300 text-sm text-center">{error}</Text>
                      </View>
                    ) : null}

                    <Button fullWidth size="lg" onPress={() => handleVerifyOtp()} loading={isVerifyingOtp} disabled={otp.length < OTP_LENGTH}>
                      {t('auth.register.verify')}
                    </Button>

                    <View className="items-center mt-5">
                      {countdown > 0 ? (
                        <Text className="text-white/60 text-sm">
                          {t('auth.register.resendIn')}<Text className="text-blue-300 font-sans-semibold">{formatTime(countdown)}</Text>
                        </Text>
                      ) : (
                        <TouchableOpacity onPress={handleResend} disabled={isSendingOtp}>
                          <Text className="text-blue-300 text-sm font-sans-medium">{t('auth.register.resend')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}

                {/* PROFILE STEP */}
                {step === 'profile' && (
                  <>
                    <Text className="text-2xl font-sans-bold text-white mb-1">{t('auth.register.profileTitle')}</Text>
                    <Text className="text-base text-white/70 mb-8">{t('auth.register.profileSubtitle')}</Text>
                    <Input
                      label={t('auth.register.fullNameLabel')}
                      placeholder={t('auth.register.fullNamePlaceholder')}
                      value={name}
                      onChangeText={(v) => { setName(v); setError(''); }}
                      leftIcon={<User size={20} color="#94A3B8" />}
                      error={error || undefined}
                    />
                    <Text className="text-sm font-sans-semibold text-white/80 mb-3">{t('auth.register.chooseRole')}</Text>
                    <View className="flex-row gap-3 mb-6">
                      {(['student', 'instructor'] as const).map((r) => (
                        <TouchableOpacity
                          key={r}
                          onPress={() => setRole(r)}
                          className={`flex-1 border-2 rounded-2xl p-4 items-center ${role === r ? 'border-blue-400 bg-blue-500/20' : 'border-white/20 bg-white/5'}`}
                        >
                          {r === 'student'
                            ? <GraduationCap size={28} color={role === r ? '#60a5fa' : 'rgba(255,255,255,0.50)'} />
                            : <BookOpen size={28} color={role === r ? '#60a5fa' : 'rgba(255,255,255,0.50)'} />}
                          <Text className={`mt-2 text-sm font-sans-semibold ${role === r ? 'text-blue-300' : 'text-white/60'}`}>
                            {r === 'student' ? t('auth.register.roleStudent') : t('auth.register.roleInstructor')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {error ? (
                      <View className="bg-red-500/20 border border-red-400/40 rounded-2xl p-4 mb-4">
                        <Text className="text-red-300 text-sm text-center">{error}</Text>
                      </View>
                    ) : null}
                    <Button fullWidth size="lg" onPress={handleComplete} loading={isRegisteringComplete}>
                      {t('auth.register.finish')}
                    </Button>
                  </>
                )}
              </View>

              <View className="flex-row items-center justify-center mt-6">
                <Text className="text-white/70 text-base">{t('auth.register.haveAccount')}</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                  <Text className="text-blue-300 text-base font-sans-bold">{t('auth.register.loginLink')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
