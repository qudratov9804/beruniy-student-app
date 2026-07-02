import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Mail, FileText, Briefcase, Globe, Lock } from 'lucide-react-native';
import { Input, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function EditProfileScreen() {
  const router = useRouter();
  const {
    user,
    updateProfile, isUpdatingProfile,
    setPassword, isSettingPassword,
    changePassword, isChangingPassword,
  } = useAuth();
  const isPasswordLoading = isSettingPassword || isChangingPassword;

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [headline, setHeadline] = useState(user?.headline ?? '');
  const [website, setWebsite] = useState(user?.website ?? '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const validateProfile = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Ism kiritish shart';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Email noto'g'ri";
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = () => {
    const errs: Record<string, string> = {};
    if (user?.has_password && !currentPassword) errs.currentPassword = 'Joriy parolni kiriting';
    if (!newPassword) errs.newPassword = 'Yangi parol kiriting';
    else if (newPassword.length < 6) errs.newPassword = 'Parol kamida 6 ta belgi';
    if (!confirmPassword) errs.confirmPassword = 'Parolni tasdiqlang';
    else if (newPassword !== confirmPassword) errs.confirmPassword = 'Parollar mos kelmaydi';
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        bio: bio.trim() || undefined,
        headline: headline.trim() || undefined,
        website: website.trim() || undefined,
      });
      const msg = "Profil muvaffaqiyatli yangilandi";
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Muvaffaqiyatli!', msg);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message ?? "Profilni saqlashda xatolik";
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Xatolik', msg);
    }
  };

  const handleSavePassword = async () => {
    if (!validatePassword()) return;
    try {
      if (user?.has_password) {
        await changePassword({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        });
      } else {
        await setPassword({
          password: newPassword,
          password_confirmation: confirmPassword,
        });
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      const msg = "Parol muvaffaqiyatli saqlandi";
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Muvaffaqiyatli!', msg);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message ?? "Parolni saqlashda xatolik";
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Xatolik', msg);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1 mr-3">
          <ChevronLeft size={26} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-sans-bold text-slate-800">Profilni tahrirlash</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Profile Info */}
        <View className="mx-5 mt-5 bg-white rounded-2xl p-5">
          <Text className="text-sm font-sans-bold text-slate-500 uppercase tracking-wider mb-4">
            Shaxsiy ma'lumotlar
          </Text>

          <Input
            label="Ism"
            placeholder="Ismingizni kiriting"
            value={name}
            onChangeText={setName}
            error={profileErrors.name}
            leftIcon={<User size={18} color="#94A3B8" />}
          />
          <Input
            label="Email"
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={profileErrors.email}
            leftIcon={<Mail size={18} color="#94A3B8" />}
          />
          <Input
            label="Telefon (o'zgartirib bo'lmaydi)"
            value={user?.phone ?? ''}
            editable={false}
            leftIcon={<User size={18} color="#94A3B8" />}
          />
          <Input
            label="Bio"
            placeholder="O'zingiz haqingizda qisqacha"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            leftIcon={<FileText size={18} color="#94A3B8" />}
          />
          <Input
            label="Sarlavha"
            placeholder="Masalan: Frontend dasturchi"
            value={headline}
            onChangeText={setHeadline}
            leftIcon={<Briefcase size={18} color="#94A3B8" />}
          />
          <Input
            label="Veb-sayt"
            placeholder="https://example.com"
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
            autoCapitalize="none"
            leftIcon={<Globe size={18} color="#94A3B8" />}
          />

          <Button
            fullWidth
            onPress={handleSaveProfile}
            loading={isUpdatingProfile}
          >
            Saqlash
          </Button>
        </View>

        {/* Password */}
        <View className="mx-5 mt-4 mb-8 bg-white rounded-2xl p-5">
          <Text className="text-sm font-sans-bold text-slate-500 uppercase tracking-wider mb-4">
            {user?.has_password ? "Parolni o'zgartirish" : 'Parol o\'rnatish'}
          </Text>

          {user?.has_password && (
            <Input
              label="Joriy parol"
              placeholder="Joriy parolni kiriting"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              isPassword
              error={passwordErrors.currentPassword}
              leftIcon={<Lock size={18} color="#94A3B8" />}
            />
          )}
          <Input
            label="Yangi parol"
            placeholder="Kamida 6 ta belgi"
            value={newPassword}
            onChangeText={setNewPassword}
            isPassword
            error={passwordErrors.newPassword}
            leftIcon={<Lock size={18} color="#94A3B8" />}
          />
          <Input
            label="Parolni tasdiqlang"
            placeholder="Yangi parolni qayta kiriting"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            error={passwordErrors.confirmPassword}
            leftIcon={<Lock size={18} color="#94A3B8" />}
          />

          <Button
            fullWidth
            variant="secondary"
            onPress={handleSavePassword}
            loading={isPasswordLoading}
          >
            {user?.has_password ? "Parolni o'zgartirish" : 'Parol o\'rnatish'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
