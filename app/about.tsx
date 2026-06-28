import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ChevronLeft, Globe, Phone, Mail, MapPin, Star } from 'lucide-react-native';

const CONTACTS = [
  { icon: <Globe size={18} color="#6366F1" />, label: 'Veb-sayt', value: 'beruniy-talim.uz', bg: 'bg-primary-100' },
  { icon: <Phone size={18} color="#22C55E" />, label: 'Telefon', value: '+998 71 200-00-00', bg: 'bg-green-100' },
  { icon: <Mail size={18} color="#F59E0B" />, label: 'Email', value: 'info@beruniy-talim.uz', bg: 'bg-yellow-100' },
  { icon: <MapPin size={18} color="#EF4444" />, label: 'Manzil', value: 'Toshkent, O\'zbekiston', bg: 'bg-red-100' },
];

const STATS = [
  { value: '500+', label: 'Kurslar' },
  { value: '50K+', label: 'O\'quvchilar' },
  { value: '200+', label: 'O\'qituvchilar' },
  { value: '4.8', label: 'Reyting' },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="flex-row items-center px-5 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1 mr-3">
          <ChevronLeft size={26} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-sans-bold text-slate-800 dark:text-white">Biz haqimizda</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="items-center py-10 bg-white dark:bg-slate-800 mx-5 mt-5 rounded-3xl">
          <Image
            source={{ uri: 'https://beruniy-talim.uz/_next/image?url=%2Flogo-400.png&w=750&q=75' }}
            style={{ width: 180, height: 90 }}
            contentFit="contain"
          />
          <Text className="text-xl font-sans-bold text-slate-800 dark:text-white mt-4">Beruniy Talim</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">O'zbekistonning yetakchi online ta'lim platformasi</Text>
        </View>

        {/* Stats */}
        <View className="flex-row mx-5 mt-4 gap-3">
          {STATS.map(({ value, label }) => (
            <View key={label} className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-3 items-center">
              <Text className="text-lg font-sans-bold text-primary-600">{value}</Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-center">{label}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View className="mx-5 mt-4 bg-white dark:bg-slate-800 rounded-2xl p-5">
          <Text className="text-base font-sans-bold text-slate-800 dark:text-white mb-3">Missiyamiz</Text>
          <Text className="text-sm text-slate-600 dark:text-slate-300 leading-6">
            Beruniy Talim — O'zbekistondagi har bir insonning sifatli ta'limga ega bo'lishini ta'minlash uchun yaratilgan
            zamonaviy online ta'lim platformasi. Biz eng yaxshi o'qituvchilar bilan hamkorlikda amaliy bilim va ko'nikmalar
            berishga intilmoqdamiz.
          </Text>
          <Text className="text-sm text-slate-600 dark:text-slate-300 leading-6 mt-3">
            Dasturlash, dizayn, biznes, til o'rganish va ko'plab sohalarda professional kurslar orqali
            o'z karerengizni yangi bosqichga olib chiqing.
          </Text>
        </View>

        {/* Contacts */}
        <View className="mx-5 mt-4 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-8">
          <Text className="text-base font-sans-bold text-slate-800 dark:text-white px-5 pt-5 pb-3">Bog'lanish</Text>
          {CONTACTS.map(({ icon, label, value, bg }, i) => (
            <TouchableOpacity
              key={label}
              className={`flex-row items-center px-5 py-3 ${i < CONTACTS.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}
              onPress={() => {
                if (label === 'Veb-sayt') Linking.openURL('https://beruniy-talim.uz');
                if (label === 'Telefon') Linking.openURL('tel:+998712000000');
                if (label === 'Email') Linking.openURL('mailto:info@beruniy-talim.uz');
              }}
            >
              <View className={`w-9 h-9 rounded-xl ${bg} items-center justify-center mr-3`}>{icon}</View>
              <View>
                <Text className="text-xs text-slate-400 dark:text-slate-500">{label}</Text>
                <Text className="text-sm font-sans-medium text-slate-700 dark:text-slate-200">{value}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
