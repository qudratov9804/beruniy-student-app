import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Vibration, Platform } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint } from 'lucide-react-native';
import { useAuthStore } from '@/stores';

const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function PinLoginScreen() {
  const router = useRouter();
  const { verifyPin, isBiometricEnabled, clearAuth } = useAuthStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleBiometric = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Barmoq izi orqali kiring',
      cancelLabel: 'Bekor qilish',
      fallbackLabel: 'PIN kiriting',
    });
    if (result.success) {
      router.replace('/(tabs)');
    }
  }, [router]);

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
        setError(`Noto'g'ri PIN. ${5 - newAttempts} ta urinish qoldi`);
        setPin('');
      }
    }
  };

  const dots = Array.from({ length: 4 }, (_, i) => i);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-between px-6 py-10">
        <Image
          source={{ uri: 'https://beruniy-talim.uz/_next/image?url=%2Flogo-400.png&w=750&q=75' }}
          style={{ width: 140, height: 70 }}
          contentFit="contain"
        />

        <View className="items-center gap-6">
          <Text className="text-2xl font-sans-bold text-slate-800">
            PIN kod kiriting
          </Text>
          <View className="flex-row gap-4">
            {dots.map((i) => (
              <View
                key={i}
                className={`w-4 h-4 rounded-full ${
                  pin.length > i ? 'bg-primary-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </View>
          {error ? (
            <Text className="text-red-500 text-sm text-center">{error}</Text>
          ) : null}
        </View>

        <View className="w-full">
          <View className="flex-row flex-wrap justify-center gap-4 mb-4">
            {DIGITS.map((d, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleDigit(d)}
                disabled={d === ''}
                className={`w-20 h-20 rounded-full items-center justify-center ${
                  d === '' ? 'opacity-0' : 'bg-slate-100 active:bg-slate-200'
                }`}
              >
                <Text className={`text-2xl font-sans-bold ${d === '⌫' ? 'text-slate-600' : 'text-slate-800'}`}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isBiometricEnabled && (
            <TouchableOpacity onPress={handleBiometric} className="items-center py-3">
              <Fingerprint size={36} color="#6366F1" />
              <Text className="text-primary-600 text-sm mt-2 font-sans-medium">
                Barmoq izi bilan kiring
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            className="items-center py-3 mt-2"
          >
            <Text className="text-slate-400 text-sm">Boshqa hisob bilan kiring</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
