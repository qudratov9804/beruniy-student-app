import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Globe, Phone, Mail, MapPin } from 'lucide-react-native';

const CONTACTS = [
  { key: 'website', icon: <Globe size={18} color="#6366F1" />, value: 'beruniy-talim.uz', bg: 'bg-primary-100' },
  { key: 'phone', icon: <Phone size={18} color="#22C55E" />, value: '+998 71 200-00-00', bg: 'bg-green-100' },
  { key: 'email', icon: <Mail size={18} color="#F59E0B" />, value: 'info@beruniy-talim.uz', bg: 'bg-yellow-100' },
  { key: 'address', icon: <MapPin size={18} color="#EF4444" />, value: null, bg: 'bg-red-100' },
] as const;

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const STATS = [
    { value: '500+', label: t('about.stats.courses') },
    { value: '50K+', label: t('about.stats.students') },
    { value: '200+', label: t('about.stats.instructors') },
    { value: '4.8', label: t('about.stats.rating') },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="flex-row items-center px-5 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1 mr-3">
          <ChevronLeft size={26} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-sans-bold text-slate-800 dark:text-white">{t('settings.aboutUs')}</Text>
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
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('about.tagline')}</Text>
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
          <Text className="text-base font-sans-bold text-slate-800 dark:text-white mb-3">{t('about.missionTitle')}</Text>
          <Text className="text-sm text-slate-600 dark:text-slate-300 leading-6">
            {t('about.missionParagraph1')}
          </Text>
          <Text className="text-sm text-slate-600 dark:text-slate-300 leading-6 mt-3">
            {t('about.missionParagraph2')}
          </Text>
        </View>

        {/* Contacts */}
        <View className="mx-5 mt-4 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-8">
          <Text className="text-base font-sans-bold text-slate-800 dark:text-white px-5 pt-5 pb-3">{t('about.contact')}</Text>
          {CONTACTS.map(({ key, icon, value, bg }, i) => (
            <TouchableOpacity
              key={key}
              className={`flex-row items-center px-5 py-3 ${i < CONTACTS.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}
              onPress={() => {
                if (key === 'website') Linking.openURL('https://beruniy-talim.uz');
                if (key === 'phone') Linking.openURL('tel:+998712000000');
                if (key === 'email') Linking.openURL('mailto:info@beruniy-talim.uz');
              }}
            >
              <View className={`w-9 h-9 rounded-xl ${bg} items-center justify-center mr-3`}>{icon}</View>
              <View>
                <Text className="text-xs text-slate-400 dark:text-slate-500">{t(`about.contacts.${key}`)}</Text>
                <Text className="text-sm font-sans-medium text-slate-700 dark:text-slate-200">
                  {value ?? t('about.contacts.addressValue')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
