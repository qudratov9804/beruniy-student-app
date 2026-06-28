import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Appearance } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'nativewind';
import '../global.css';
import { useAuthStore, useThemeStore } from '@/stores';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function RootLayout() {
  const { initialize } = useAuthStore();
  const { mode } = useThemeStore();
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    if (mode === 'system') {
      const raw = Appearance.getColorScheme();
      setColorScheme(raw === 'dark' ? 'dark' : 'light');
    } else {
      setColorScheme(mode);
    }
  }, [mode, setColorScheme]);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="notifications" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen name="wishlist" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen name="settings" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen name="about" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen
              name="course/[id]"
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen name="lesson/[id]" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen
              name="quiz/[id]"
              options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
