import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Phone, ChevronLeft, CheckCircle } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { sendOtp, isSendingOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      setPhoneError('Telefon raqam kiritish shart');
      return;
    }
    if (!/^\+998\d{9}$/.test(trimmed)) {
      setPhoneError("Telefon raqam noto'g'ri (+998XXXXXXXXX)");
      return;
    }
    setPhoneError('');
    try {
      await sendOtp({ phone: trimmed, type: 'reset' });
      setSent(true);
    } catch {
      setPhoneError('OTP yuborishda xato yuz berdi');
    }
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
                SMS yuborildi!
              </Text>
              <Text className="text-base text-slate-500 text-center mb-8">
                {phone} raqamiga tasdiqlash kodi yuborildi.
              </Text>
              <Button fullWidth onPress={() => router.back()}>
                Ortga qaytish
              </Button>
            </View>
          ) : (
            <>
              <Text className="text-2xl font-sans-bold text-slate-800 mb-2">Parolni tiklash</Text>
              <Text className="text-base text-slate-500 mb-8">
                Telefon raqamingizni kiriting, SMS kod yuboramiz.
              </Text>
              <Input
                label="Telefon raqam"
                placeholder="+998901234567"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                error={phoneError}
                leftIcon={<Phone size={20} color="#94A3B8" />}
              />
              <Button fullWidth size="lg" onPress={handleSubmit} loading={isSendingOtp}>
                SMS yuborish
              </Button>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
