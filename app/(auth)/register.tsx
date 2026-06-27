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
import { User, Mail, Lock, Phone, ChevronLeft } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isRegistering, registerError } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim()) e.firstName = 'Ism kiritish shart';
    if (!form.lastName.trim()) e.lastName = 'Familiya kiritish shart';
    if (!form.email.trim()) e.email = 'Email kiritish shart';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email noto'g'ri";
    if (!form.password) e.password = 'Parol kiritish shart';
    else if (form.password.length < 8) e.password = 'Parol kamida 8 ta belgi';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Parollar mos kelmaydi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;
    register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || undefined,
      password: form.password,
    });
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
            <TouchableOpacity onPress={() => router.back()} className="mb-6 self-start p-2 -ml-2">
              <ChevronLeft size={28} color="#0F172A" />
            </TouchableOpacity>

            <Text className="text-2xl font-sans-bold text-slate-800 mb-1">Ro'yxatdan o'ting</Text>
            <Text className="text-base text-slate-500 mb-8">Yangi hisob yarating</Text>

            <Input
              label="Ism"
              placeholder="Ismingizni kiriting"
              value={form.firstName}
              onChangeText={set('firstName')}
              error={errors.firstName}
              leftIcon={<User size={20} color="#94A3B8" />}
            />
            <Input
              label="Familiya"
              placeholder="Familiyangizni kiriting"
              value={form.lastName}
              onChangeText={set('lastName')}
              error={errors.lastName}
              leftIcon={<User size={20} color="#94A3B8" />}
            />
            <Input
              label="Email"
              placeholder="email@example.com"
              value={form.email}
              onChangeText={set('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={<Mail size={20} color="#94A3B8" />}
            />
            <Input
              label="Telefon (ixtiyoriy)"
              placeholder="+998 90 000 00 00"
              value={form.phone}
              onChangeText={set('phone')}
              keyboardType="phone-pad"
              leftIcon={<Phone size={20} color="#94A3B8" />}
            />
            <Input
              label="Parol"
              placeholder="Parolni kiriting"
              value={form.password}
              onChangeText={set('password')}
              isPassword
              error={errors.password}
              leftIcon={<Lock size={20} color="#94A3B8" />}
            />
            <Input
              label="Parolni tasdiqlang"
              placeholder="Parolni qayta kiriting"
              value={form.confirmPassword}
              onChangeText={set('confirmPassword')}
              isPassword
              error={errors.confirmPassword}
              leftIcon={<Lock size={20} color="#94A3B8" />}
            />

            {registerError && (
              <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                <Text className="text-red-600 text-sm text-center">
                  Ro'yxatdan o'tishda xatolik yuz berdi
                </Text>
              </View>
            )}

            <Button
              fullWidth
              size="lg"
              onPress={handleRegister}
              loading={isRegistering}
              className="mt-2"
            >
              Ro'yxatdan o'tish
            </Button>

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
