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
import { User, ChevronLeft, GraduationCap, BookOpen } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';

type Step = 'phone' | 'otp' | 'profile';
const OTP_LENGTH = 6;
const PREFIX = '+998';

export default function RegisterScreen() {
  const router = useRouter();
  const { sendOtp, verifyOtp, registerComplete, isSendingOtp, isVerifyingOtp, isRegisteringComplete } =
    useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phoneDigits, setPhoneDigits] = useState(''); // faqat 9 ta raqam
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [registrationToken, setRegistrationToken] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const hiddenOtpRef = useRef<TextInput>(null);
  const cellRefs = useRef<(TextInput | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phone = `${PREFIX}${phoneDigits}`;
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

  // SMS auto-fill: yashirin input to'ldirilganda
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
    const clean = value.replace(/[^0-9]/g, '').slice(0, 9);
    setPhoneDigits(clean);
    setError('');
  };

  const formatPhoneDisplay = (digits: string) => {
    // XX XXX XX XX
    const d = digits.padEnd(9, '');
    return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`.trim();
  };

  const handleSendOtp = async () => {
    if (phoneDigits.length !== 9) { setError('9 ta raqam kiriting'); return; }
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
      setError(`Xato: ${detail}`);
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
    if (finalCode.length < OTP_LENGTH) { setError('Barcha raqamlarni kiriting'); return; }
    setError('');
    try {
      const res = await verifyOtp({ phone, code: finalCode, type: 'register' });
      if (res.registration_token) {
        setRegistrationToken(res.registration_token);
        setStep('profile');
      } else if (res.token) {
        router.replace('/(tabs)');
      } else {
        setError("Noto'g'ri kod");
        setDigits(Array(OTP_LENGTH).fill(''));
        setTimeout(() => hiddenOtpRef.current?.focus(), 100);
      }
    } catch {
      setError("Noto'g'ri kod yoki muddat tugagan");
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
    } catch { setError('SMS yuborishda xato'); }
  };

  const handleComplete = async () => {
    if (!name.trim()) { setError('Ism kiritish shart'); return; }
    setError('');
    try {
      await registerComplete({ registration_token: registrationToken, name: name.trim(), role });
    } catch { setError("Ro'yxatdan o'tishda xatolik yuz berdi"); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-6 pb-8">
            <TouchableOpacity
              onPress={() => (step === 'phone' ? router.back() : setStep(step === 'otp' ? 'phone' : 'otp'))}
              className="mb-6 self-start p-2 -ml-2"
            >
              <ChevronLeft size={28} color="#0F172A" />
            </TouchableOpacity>

            <View className="flex-row items-center mb-8 gap-2">
              {(['phone', 'otp', 'profile'] as Step[]).map((s, i) => (
                <View key={s} className={`h-1.5 flex-1 rounded-full ${
                  step === s || (['otp', 'profile'].includes(step) && i === 0) || (step === 'profile' && i === 1)
                    ? 'bg-primary-600' : 'bg-slate-200'
                }`} />
              ))}
            </View>

            {/* PHONE STEP */}
            {step === 'phone' && (
              <>
                <Image
                  source={{ uri: 'https://beruniy-talim.uz/_next/image?url=%2Flogo-400.png&w=750&q=75' }}
                  style={{ width: 160, height: 80, marginBottom: 16 }}
                  contentFit="contain"
                />
                <Text className="text-2xl font-sans-bold text-slate-800 mb-1">Ro&apos;yxatdan o&apos;ting</Text>
                <Text className="text-base text-slate-500 mb-8">Telefon raqamingizni kiriting</Text>

                <View className="mb-4">
                  <Text className="mb-2 text-sm font-sans-semibold text-slate-700">Telefon raqam</Text>
                  <View className={`flex-row items-center border rounded-2xl bg-slate-50 px-4 ${error ? 'border-red-400' : 'border-slate-200'}`}>
                    <View className="mr-2 pr-2 border-r border-slate-200 py-3">
                      <Text className="text-base font-sans-semibold text-slate-800">{PREFIX}</Text>
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
                  {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
                </View>

                <Button fullWidth size="lg" onPress={handleSendOtp} loading={isSendingOtp}
                  disabled={phoneDigits.length !== 9}>
                  SMS kod olish
                </Button>
              </>
            )}

            {/* OTP STEP */}
            {step === 'otp' && (
              <>
                <Text className="text-2xl font-sans-bold text-slate-800 mb-1">Kodni kiriting</Text>
                <Text className="text-base text-slate-500 mb-8">
                  {PREFIX} {formatPhoneDisplay(phoneDigits)} raqamiga yuborilgan kodni kiriting
                </Text>

                {/* Yashirin SMS auto-fill input */}
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

                {/* Ko'rinadigan yacheykalar */}
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
                          borderColor: digit ? '#6366F1' : '#E2E8F0',
                          borderRadius: 12,
                          textAlign: 'center',
                          fontSize: 22,
                          fontWeight: '700',
                          color: '#0F172A',
                          backgroundColor: digit ? '#F5F3FF' : '#F8FAFC',
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {error ? (
                  <View className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-4">
                    <Text className="text-red-600 text-sm text-center">{error}</Text>
                  </View>
                ) : null}

                <Button fullWidth size="lg" onPress={() => handleVerifyOtp()} loading={isVerifyingOtp} disabled={otp.length < OTP_LENGTH}>
                  Tasdiqlash
                </Button>

                <View className="items-center mt-5">
                  {countdown > 0 ? (
                    <Text className="text-slate-500 text-sm">
                      Qayta yuborish: <Text className="text-primary-600 font-sans-semibold">{formatTime(countdown)}</Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResend} disabled={isSendingOtp}>
                      <Text className="text-primary-600 text-sm font-sans-medium">Kodni qayta yuborish</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            {/* PROFILE STEP */}
            {step === 'profile' && (
              <>
                <Text className="text-2xl font-sans-bold text-slate-800 mb-1">Profilingiz</Text>
                <Text className="text-base text-slate-500 mb-8">Ismingizni kiriting va rolingizni tanlang</Text>
                <Input
                  label="To'liq ism"
                  placeholder="Ismingizni kiriting"
                  value={name}
                  onChangeText={(v) => { setName(v); setError(''); }}
                  leftIcon={<User size={20} color="#94A3B8" />}
                  error={error || undefined}
                />
                <Text className="text-sm font-sans-semibold text-slate-700 mb-3">Rol tanlang</Text>
                <View className="flex-row gap-3 mb-6">
                  {(['student', 'instructor'] as const).map((r) => (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setRole(r)}
                      className={`flex-1 border-2 rounded-2xl p-4 items-center ${role === r ? 'border-primary-500 bg-primary-50' : 'border-slate-200'}`}
                    >
                      {r === 'student'
                        ? <GraduationCap size={28} color={role === r ? '#6366F1' : '#94A3B8'} />
                        : <BookOpen size={28} color={role === r ? '#6366F1' : '#94A3B8'} />}
                      <Text className={`mt-2 text-sm font-sans-semibold ${role === r ? 'text-primary-600' : 'text-slate-500'}`}>
                        {r === 'student' ? 'Talaba' : "O'qituvchi"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {error ? (
                  <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                    <Text className="text-red-600 text-sm text-center">{error}</Text>
                  </View>
                ) : null}
                <Button fullWidth size="lg" onPress={handleComplete} loading={isRegisteringComplete}>
                  Yakunlash
                </Button>
              </>
            )}

            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-slate-500 text-base">Hisobingiz bormi? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-primary-600 text-base font-sans-bold">Kirish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
