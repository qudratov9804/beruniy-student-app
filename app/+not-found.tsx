import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { NotFoundIllustration } from '@/components/common/illustrations';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <NotFoundIllustration size={200} />
        <Text className="text-2xl font-sans-bold text-slate-800 mt-4 mb-2">
          Sahifa topilmadi
        </Text>
        <Text className="text-sm text-slate-400 text-center mb-8">
          Siz izlayotgan sahifa mavjud emas yoki ko&apos;chirilgan.
        </Text>
        <Button fullWidth onPress={() => router.replace('/(tabs)')}>
          Bosh sahifaga qaytish
        </Button>
      </View>
    </SafeAreaView>
  );
}
