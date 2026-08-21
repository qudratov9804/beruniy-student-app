import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Vibration, Platform } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';
import { Fingerprint } from 'lucide-react-native';
import { useAuthStore } from '@/stores';
import { ScreenBackground, PinKeypad } from '@/components/common';

export default function PinLoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { verifyPin, isBiometricEnabled, clearAuth } = useAuthStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleBiometric = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t('auth.pinLogin.biometricPrompt'),
      cancelLabel: t('common.cancel'),
      fallbackLabel: t('auth.pinLogin.biometricFallback'),
    });
    if (result.success) {
      router.replace('/(tabs)');
    }
  }, [router, t]);

  useEffect(() => {
    if (isBiometricEnabled) {
      handleBiometric();
    }
  }, [isBiometricEnabled, handleBiometric]);

  const handleDigit = async (digit: string) => {
    if (digit === '') return;
    if (digit === '⌫') {
      setPin((p) => p.slice(0, -1));
      setError('');
      return;
    }
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);

    if (next.length === 4) {
      const correct = await verifyPin(next);
      if (correct) {
        router.replace('/(tabs)');
      } else {
        if (Platform.OS !== 'web') Vibration.vibrate(300);
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 5) {
          await clearAuth();
          router.replace('/(auth)/login');
          return;
        }
        setError(t('auth.pinLogin.wrongPin', { count: 5 - newAttempts }));
        setPin('');
      }
    }
  };

  const dots = Array.from({ length: 4 }, (_, i) => i);

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1 bg-transparent">
        <View className="flex-1 items-center justify-between px-6 py-10">
          <View className="bg-white rounded-full p-2">
            <Image
              source={{ uri: 'https://beruniy-talim.uz/_next/image?url=%2Flogo-400.png&w=750&q=75' }}
              style={{ width: 76, height: 76 }}
              contentFit="contain"
            />
          </View>

          <View className="items-center gap-6">
            <Text className="text-2xl font-sans-bold text-white">
              {t('auth.pinLogin.title')}
            </Text>
            <View className="flex-row gap-4">
              {dots.map((i) => (
                <View
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    pin.length > i ? 'bg-blue-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </View>
            {error ? (
              <Text className="text-red-400 text-sm text-center">{error}</Text>
            ) : null}
          </View>

          <View className="w-full">
            <View className="mb-4">
              <PinKeypad onPress={handleDigit} variant="dark" />
            </View>

            {isBiometricEnabled && (
              <TouchableOpacity onPress={handleBiometric} className="items-center py-3">
                <Fingerprint size={36} color="#60a5fa" />
                <Text className="text-blue-300 text-sm mt-2 font-sans-medium">
                  {t('auth.pinLogin.useBiometric')}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              className="items-center py-3 mt-2"
            >
              <Text className="text-white/40 text-sm">{t('auth.pinLogin.useOtherAccount')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}
