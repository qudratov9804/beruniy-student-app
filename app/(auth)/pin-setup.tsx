import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Vibration, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores';
import { PinKeypad } from '@/components/common';

export default function PinSetupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setupPin, enableBiometric } = useAuthStore();
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(async (has) => {
      if (has) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setBiometricAvailable(enrolled);
      }
    });
  }, []);

  const current = step === 'create' ? pin : confirmPin;
  const setCurrent = step === 'create' ? setPin : setConfirmPin;

  const handleDigit = (digit: string) => {
    if (digit === '') return;
    if (digit === '⌫') {
      setCurrent((p) => p.slice(0, -1));
      setError('');
      return;
    }
    if (current.length >= 4) return;
    const next = current + digit;
    setCurrent(next);

    if (next.length === 4) {
      if (step === 'create') {
        setTimeout(() => setStep('confirm'), 200);
      } else {
        if (next === pin) {
          handleFinish(pin);
        } else {
          if (Platform.OS !== 'web') Vibration.vibrate(300);
          setError(t('auth.pinSetup.mismatch'));
          setConfirmPin('');
          setTimeout(() => {
            setStep('create');
            setPin('');
            setError('');
          }, 1500);
        }
      }
    }
  };

  const handleFinish = async (finalPin: string) => {
    await setupPin(finalPin);
    if (biometricAvailable) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('auth.pinSetup.biometricPrompt'),
        cancelLabel: t('auth.pinSetup.later'),
      });
      if (result.success) await enableBiometric();
    }
    router.replace('/(tabs)');
  };

  const dots = Array.from({ length: 4 }, (_, i) => i);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-between px-6 py-10">
        <View className="items-center">
          <Text className="text-2xl font-sans-bold text-slate-800 mb-2">
            {step === 'create' ? t('auth.pinSetup.createTitle') : t('auth.pinSetup.confirmTitle')}
          </Text>
          <Text className="text-slate-500 text-base text-center">
            {step === 'create'
              ? t('auth.pinSetup.createSubtitle')
              : t('auth.pinSetup.confirmSubtitle')}
          </Text>
        </View>

        <View className="items-center gap-6">
          <View className="flex-row gap-4">
            {dots.map((i) => (
              <View
                key={i}
                className={`w-4 h-4 rounded-full ${
                  current.length > i ? 'bg-primary-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </View>
          {error ? (
            <Text className="text-red-500 text-sm text-center">{error}</Text>
          ) : null}
        </View>

        <View className="w-full">
          <View className="mb-6">
            <PinKeypad onPress={handleDigit} variant="light" />
          </View>

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            className="items-center py-3"
          >
            <Text className="text-slate-400 text-sm">{t('auth.pinSetup.skip')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
