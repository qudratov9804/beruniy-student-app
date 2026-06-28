import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Vibration, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '@/stores';

const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function PinSetupScreen() {
  const router = useRouter();
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
          setError("PIN kodlar mos kelmadi. Qaytadan urinib ko'ring");
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
        promptMessage: 'Barmoq izi orqali kirishni yoqing',
        cancelLabel: 'Keyinroq',
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
            {step === 'create' ? 'PIN kod o\'rnating' : 'PIN kodni tasdiqlang'}
          </Text>
          <Text className="text-slate-500 text-base text-center">
            {step === 'create'
              ? 'Keyingi kirishlarda foydalanish uchun 4 xonali PIN'
              : 'Xavfsizlik uchun PIN kodni qaytadan kiriting'}
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
          <View className="flex-row flex-wrap justify-center gap-4 mb-6">
            {DIGITS.map((d, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleDigit(d)}
                disabled={d === ''}
                className={`w-20 h-20 rounded-full items-center justify-center ${
                  d === '' ? 'opacity-0' : d === '⌫' ? 'bg-slate-100' : 'bg-slate-100 active:bg-slate-200'
                }`}
              >
                <Text className={`text-2xl font-sans-bold ${d === '⌫' ? 'text-slate-600' : 'text-slate-800'}`}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            className="items-center py-3"
          >
            <Text className="text-slate-400 text-sm">Hozircha o'tkazib yuborish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
