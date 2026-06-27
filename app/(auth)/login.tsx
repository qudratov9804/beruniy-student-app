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
import { Mail, Lock } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email kiritish shart';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email noto\'g\'ri';
    if (!password) newErrors.password = 'Parol kiritish shart';
    else if (password.length < 6) newErrors.password = 'Parol kamida 6 ta belgi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    login({ email: email.trim().toLowerCase(), password });
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
          <View className="flex-1 px-6 pt-12 pb-8">
            {/* Header */}
            <View className="items-center mb-10">
              <View className="w-20 h-20 bg-primary-600 rounded-3xl items-center justify-center mb-4">
                <Text className="text-4xl">🎓</Text>
              </View>
              <Text className="text-2xl font-sans-bold text-slate-800 mb-2">
                Xush kelibsiz!
              </Text>
              <Text className="text-base text-slate-500 text-center">
                Beruniy Talim platformasiga kiring
              </Text>
            </View>

            {/* Form */}
            <View className="mb-6">
              <Input
                label="Email"
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
                leftIcon={<Mail size={20} color="#94A3B8" />}
              />
              <Input
                label="Parol"
                placeholder="Parolni kiriting"
                value={password}
                onChangeText={setPassword}
                isPassword
                autoComplete="password"
                error={errors.password}
                leftIcon={<Lock size={20} color="#94A3B8" />}
              />
              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                className="self-end mb-4"
              >
                <Text className="text-primary-600 text-sm font-sans-semibold">
                  Parolni unutdingizmi?
                </Text>
              </TouchableOpacity>
            </View>

            {loginError && (
              <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                <Text className="text-red-600 text-sm text-center">
                  Email yoki parol noto'g'ri
                </Text>
              </View>
            )}

            <Button fullWidth size="lg" onPress={handleLogin} loading={isLoggingIn}>
              Kirish
            </Button>

            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-slate-500 text-base">Hisob yo'qmi? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-primary-600 text-base font-sans-bold">
                  Ro'yxatdan o'ting
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
