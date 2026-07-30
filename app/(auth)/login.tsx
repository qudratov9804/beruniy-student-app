import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { Button, Input, PhoneField } from '@/components/ui';
import { useAuth } from '@/hooks';
import { ScreenBackground } from '@/components/common';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { loginWithPassword, isLoggingIn, loginError } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!phone.trim()) newErrors.phone = t('auth.validation.phoneRequired');
    else if (!/^\+998\d{9}$/.test(phone.trim())) newErrors.phone = t('auth.validation.phoneInvalid');
    if (!password) newErrors.password = t('auth.validation.passwordRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await loginWithPassword({ phone: phone.trim(), password });
    } catch {
      // loginError from the mutation state renders the inline message below
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1 bg-transparent">
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
                <Image
                  source={{ uri: 'https://beruniy-talim.uz/_next/image?url=%2Flogo-400.png&w=750&q=75' }}
                  style={{ width: 160, height: 80, marginBottom: 16 }}
                  contentFit="contain"
                />
                <Text className="text-2xl font-sans-bold text-white mb-2">{t('auth.login.title')}</Text>
                <Text className="text-base text-white/70 text-center">
                  {t('auth.login.subtitle')}
                </Text>
              </View>

              {/* Glass Form */}
              <View className="bg-white/10 rounded-3xl p-6 border border-white/20 mb-4">
                <PhoneField
                  label={t('auth.login.phoneLabel')}
                  onChangeText={setPhone}
                  error={errors.phone}
                />
                <Input
                  label={t('auth.login.passwordLabel')}
                  placeholder={t('auth.login.passwordPlaceholder')}
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
                  <Text className="text-blue-300 text-sm font-sans-semibold">
                    {t('auth.login.forgotPassword')}
                  </Text>
                </TouchableOpacity>

                {loginError && (
                  <View className="bg-red-500/20 border border-red-400/40 rounded-2xl p-4 mb-4">
                    <Text className="text-red-300 text-sm text-center">
                      {t('auth.login.invalidCredentials')}
                    </Text>
                  </View>
                )}

                <Button fullWidth size="lg" onPress={handleLogin} loading={isLoggingIn}>
                  {t('auth.login.submit')}
                </Button>
              </View>

              <View className="flex-row items-center justify-center mt-4">
                <Text className="text-white/70 text-base">{t('auth.login.noAccount')}</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Text className="text-blue-300 text-base font-sans-bold">{t('auth.login.registerLink')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
