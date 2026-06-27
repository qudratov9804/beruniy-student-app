import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Phone, User, ChevronLeft, GraduationCap, BookOpen } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';

type Step = 'phone' | 'otp' | 'profile';

export default function RegisterScreen() {
  const router = useRouter();
  const { sendOtp, verifyOtp, registerComplete, isSendingOtp, isVerifyingOtp, isRegisteringComplete } =
    useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [registrationToken, setRegistrationToken] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    const trimmed = phone.trim();
    if (!trimmed) { setError('Telefon raqam kiritish shart'); return; }
    if (!/^\+998\d{9}$/.test(trimmed)) { setError("Telefon raqam noto'g'ri (+998XXXXXXXXX)"); return; }
    setError('');
    try {
      await sendOtp({ phone: trimmed, type: 'register' });
      setStep('otp');
    } catch {
      setError('SMS yuborishda xato yuz berdi');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { setError('Kodni kiriting'); return; }
    setError('');
    try {
      const res = await verifyOtp({ phone: phone.trim(), code: otp.trim(), type: 'register' });
      if (res.registration_token) {
        setRegistrationToken(res.registration_token);
        setStep('profile');
      } else if (res.token) {
        // already exists — token returned directly
        router.replace('/(tabs)');
      } else {
        setError("Noto'g'ri kod");
      }
    } catch {
      setError("Noto'g'ri kod yoki muddat tugagan");
    }
  };

  const handleComplete = async () => {
    if (!name.trim()) { setError('Ism kiritish shart'); return; }
    setError('');
    try {
      await registerComplete({ registration_token: registrationToken, name: name.trim(), role });
    } catch {
      setError("Ro'yxatdan o'tishda xatolik yuz berdi");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-6 pb-8">
            <TouchableOpacity
              onPress={() => (step === 'phone' ? router.back() : setStep(step === 'otp' ? 'phone' : 'otp'))}
              className="mb-6 self-start p-2 -ml-2"
            >
              <ChevronLeft size={28} color="#0F172A" />
            </TouchableOpacity>

            {/* Step indicator */}
            <View className="flex-row items-center mb-8 gap-2">
              {(['phone', 'otp', 'profile'] as Step[]).map((s, i) => (
                <View
                  key={s}
                  className={`h-1.5 flex-1 rounded-full ${
                    step === s || (['otp', 'profile'].includes(step) && i === 0) || (step === 'profile' && i === 1)
                      ? 'bg-primary-600'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </View>

            {step === 'phone' && (
              <>
                <Text className="text-2xl font-sans-bold text-slate-800 mb-1">
                  Ro&apos;yxatdan o&apos;ting
                </Text>
                <Text className="text-base text-slate-500 mb-8">
                  Telefon raqamingizni kiriting
                </Text>
                <Input
                  label="Telefon raqam"
                  placeholder="+998901234567"
                  value={phone}
                  onChangeText={(v) => { setPhone(v); setError(''); }}
                  keyboardType="phone-pad"
                  leftIcon={<Phone size={20} color="#94A3B8" />}
                  error={error || undefined}
                />
                <Button fullWidth size="lg" onPress={handleSendOtp} loading={isSendingOtp}>
                  SMS kod olish
                </Button>
              </>
            )}

            {step === 'otp' && (
              <>
                <Text className="text-2xl font-sans-bold text-slate-800 mb-1">
                  Kodni kiriting
                </Text>
                <Text className="text-base text-slate-500 mb-8">
                  {phone} raqamiga yuborilgan SMS kodni kiriting
                </Text>
                <Input
                  label="SMS kod"
                  placeholder="123456"
                  value={otp}
                  onChangeText={(v) => { setOtp(v); setError(''); }}
                  keyboardType="number-pad"
                  maxLength={6}
                  error={error || undefined}
                />
                <Button fullWidth size="lg" onPress={handleVerifyOtp} loading={isVerifyingOtp}>
                  Tasdiqlash
                </Button>
                <TouchableOpacity onPress={handleSendOtp} className="items-center mt-4">
                  <Text className="text-primary-600 text-sm font-sans-medium">
                    Kodni qayta yuborish
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {step === 'profile' && (
              <>
                <Text className="text-2xl font-sans-bold text-slate-800 mb-1">
                  Profilingiz
                </Text>
                <Text className="text-base text-slate-500 mb-8">
                  Ismingizni kiriting va rolingizni tanlang
                </Text>
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
                  <TouchableOpacity
                    onPress={() => setRole('student')}
                    className={`flex-1 border-2 rounded-2xl p-4 items-center ${
                      role === 'student' ? 'border-primary-500 bg-primary-50' : 'border-slate-200'
                    }`}
                  >
                    <GraduationCap size={28} color={role === 'student' ? '#6366F1' : '#94A3B8'} />
                    <Text
                      className={`mt-2 text-sm font-sans-semibold ${
                        role === 'student' ? 'text-primary-600' : 'text-slate-500'
                      }`}
                    >
                      Talaba
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setRole('instructor')}
                    className={`flex-1 border-2 rounded-2xl p-4 items-center ${
                      role === 'instructor' ? 'border-primary-500 bg-primary-50' : 'border-slate-200'
                    }`}
                  >
                    <BookOpen size={28} color={role === 'instructor' ? '#6366F1' : '#94A3B8'} />
                    <Text
                      className={`mt-2 text-sm font-sans-semibold ${
                        role === 'instructor' ? 'text-primary-600' : 'text-slate-500'
                      }`}
                    >
                      O&apos;qituvchi
                    </Text>
                  </TouchableOpacity>
                </View>

                <Button fullWidth size="lg" onPress={handleComplete} loading={isRegisteringComplete}>
                  Yakunlash
                </Button>
              </>
            )}

            {error && step === 'phone' ? null : error ? (
              <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-4">
                <Text className="text-red-600 text-sm text-center">{error}</Text>
              </View>
            ) : null}

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
