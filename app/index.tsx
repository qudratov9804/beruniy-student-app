import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading, hasPin } = useAuthStore();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (hasPin) return <Redirect href="/(auth)/pin-login" />;
  return <Redirect href="/(tabs)" />;
}
