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
import { useTranslation } from 'react-i18next';
import { Input, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
  const [loadedUserId, setLoadedUserId] = useState(user?.id);

  if (user && user.id !== loadedUserId) {
    setLoadedUserId(user.id);
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setBio(user.bio ?? '');
    setHeadline(user.headline ?? '');
    setWebsite(user.website ?? '');
  }

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const validateProfile = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t('editProfile.errors.nameRequired');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t('editProfile.errors.emailInvalid');
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = () => {
    const errs: Record<string, string> = {};
    if (user?.has_password && !currentPassword) errs.currentPassword = t('editProfile.errors.currentPasswordRequired');
    if (!newPassword) errs.newPassword = t('editProfile.errors.newPasswordRequired');
    else if (newPassword.length < 6) errs.newPassword = t('editProfile.errors.passwordMinLength');
    if (!confirmPassword) errs.confirmPassword = t('editProfile.errors.confirmPasswordRequired');
    else if (newPassword !== confirmPassword) errs.confirmPassword = t('editProfile.errors.passwordMismatch');
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
      const msg = t('editProfile.profileUpdated');
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert(t('common.success'), msg);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message ?? t('editProfile.profileSaveError');
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert(t('common.error'), msg);
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
      const msg = t('editProfile.passwordSaved');
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert(t('common.success'), msg);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message ?? t('editProfile.passwordSaveError');
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert(t('common.error'), msg);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1 mr-3">
          <ChevronLeft size={26} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-sans-bold text-slate-800">{t('editProfile.title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Profile Info */}
        <View className="mx-5 mt-5 bg-white rounded-2xl p-5">
          <Text className="text-sm font-sans-bold text-slate-500 uppercase tracking-wider mb-4">
            {t('editProfile.personalInfo')}
          </Text>

          <Input
            label={t('editProfile.name')}
            placeholder={t('editProfile.namePlaceholder')}
            value={name}
            onChangeText={setName}
            error={profileErrors.name}
            leftIcon={<User size={18} color="#94A3B8" />}
          />
          <Input
            label={t('editProfile.email')}
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={profileErrors.email}
            leftIcon={<Mail size={18} color="#94A3B8" />}
          />
          <Input
            label={t('editProfile.phoneImmutable')}
            value={user?.phone ?? ''}
            editable={false}
            leftIcon={<User size={18} color="#94A3B8" />}
          />
          <Input
            label={t('editProfile.bio')}
            placeholder={t('editProfile.bioPlaceholder')}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            leftIcon={<FileText size={18} color="#94A3B8" />}
          />
          <Input
            label={t('editProfile.headline')}
            placeholder={t('editProfile.headlinePlaceholder')}
            value={headline}
            onChangeText={setHeadline}
            leftIcon={<Briefcase size={18} color="#94A3B8" />}
          />
          <Input
            label={t('editProfile.website')}
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
            {t('common.save')}
          </Button>
        </View>

        {/* Password */}
        <View className="mx-5 mt-4 mb-8 bg-white rounded-2xl p-5">
          <Text className="text-sm font-sans-bold text-slate-500 uppercase tracking-wider mb-4">
            {user?.has_password ? t('editProfile.changePassword') : t('editProfile.setPassword')}
          </Text>

          {user?.has_password && (
            <Input
              label={t('editProfile.currentPassword')}
              placeholder={t('editProfile.currentPasswordPlaceholder')}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              isPassword
              error={passwordErrors.currentPassword}
              leftIcon={<Lock size={18} color="#94A3B8" />}
            />
          )}
          <Input
            label={t('editProfile.newPassword')}
            placeholder={t('editProfile.newPasswordPlaceholder')}
            value={newPassword}
            onChangeText={setNewPassword}
            isPassword
            error={passwordErrors.newPassword}
            leftIcon={<Lock size={18} color="#94A3B8" />}
          />
          <Input
            label={t('editProfile.confirmPassword')}
            placeholder={t('editProfile.confirmPasswordPlaceholder')}
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
            {user?.has_password ? t('editProfile.changePassword') : t('editProfile.setPassword')}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
