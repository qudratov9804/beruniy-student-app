import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Phone, ChevronLeft, Lock } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores';
import { ScreenBackground } from '@/components/common';

type Step = 'phone' | 'otp' | 'password';
const OTP_LENGTH = 6;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { sendOtp, verifyOtp, setPassword, isSendingOtp, isVerifyingOtp, isSettingPassword } = useAuth();
  const { setToken } = useAuthStore();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const hiddenOtpRef = useRef<TextInput>(null);
  const cellRefs = useRef<(TextInput | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const otp = digits.join('');

  const startCountdown = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleSendOtp = async () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      setPhoneError(t('auth.validation.phoneRequired'));
      return;
    }
    if (!/^\+998\d{9}$/.test(trimmed)) {
      setPhoneError(t('auth.validation.phoneInvalid'));
      return;
    }
    setPhoneError('');
    try {
      const res = await sendOtp({ phone: trimmed, type: 'reset' });
      if (res?.expires_in) startCountdown(res.expires_in);
      setDigits(Array(OTP_LENGTH).fill(''));
      setOtpError('');
      setStep('otp');
      setTimeout(() => hiddenOtpRef.current?.focus(), 300);
    } catch {
      setPhoneError(t('auth.forgotPassword.sendError'));
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isSendingOtp) return;
    setOtpError('');
    setDigits(Array(OTP_LENGTH).fill(''));
    try {
      const res = await sendOtp({ phone: phone.trim(), type: 'reset' });
      if (res?.expires_in) startCountdown(res.expires_in);
      setTimeout(() => hiddenOtpRef.current?.focus(), 300);
    } catch {
      setOtpError(t('auth.forgotPassword.sendError'));
    }
  };

  const handleHiddenOtpChange = (value: string) => {
    const clean = value.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    if (clean.length > 0) {
      const next = Array(OTP_LENGTH).fill('');
      clean.split('').forEach((d, i) => { next[i] = d; });
      setDigits(next);
      setOtpError('');
      if (clean.length === OTP_LENGTH) {
        setTimeout(() => handleVerifyOtp(clean), 100);
      }
    }
  };

  const handleCellChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setOtpError('');
    if (digit && index < OTP_LENGTH - 1) cellRefs.current[index + 1]?.focus();
    if (next.every((d) => d !== '') && digit) handleVerifyOtp(next.join(''));
  };

  const handleCellKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      cellRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const finalCode = code ?? otp;
    if (finalCode.length < OTP_LENGTH) {
      setOtpError(t('auth.register.errors.allDigitsRequired'));
      return;
    }
    setOtpError('');
    try {
      const res = await verifyOtp({ phone: phone.trim(), code: finalCode, type: 'reset' });
      if (res.token) {
        await setToken(res.token);
        setStep('password');
      } else {
        setOtpError(t('auth.register.errors.wrongCode'));
        setDigits(Array(OTP_LENGTH).fill(''));
        setTimeout(() => hiddenOtpRef.current?.focus(), 100);
      }
    } catch {
      setOtpError(t('auth.register.errors.wrongOrExpiredCode'));
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => hiddenOtpRef.current?.focus(), 100);
    }
  };

  const validatePassword = () => {
    const errs: Record<string, string> = {};
    if (!newPassword) errs.newPassword = t('editProfile.errors.newPasswordRequired');
    else if (newPassword.length < 6) errs.newPassword = t('editProfile.errors.passwordMinLength');
    if (!confirmPassword) errs.confirmPassword = t('editProfile.errors.confirmPasswordRequired');
    else if (newPassword !== confirmPassword) errs.confirmPassword = t('editProfile.errors.passwordMismatch');
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSetPassword = async () => {
    if (!validatePassword()) return;
    try {
      await setPassword({ password: newPassword, password_confirmation: confirmPassword });
      router.replace('/(auth)/pin-setup');
    } catch {
      setPasswordErrors({ newPassword: t('editProfile.passwordSaveError') });
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleBack = () => {
    if (step === 'phone') router.back();
    else if (step === 'otp') setStep('phone');
  };

  return (
    <ScreenBackground>
      <SafeAreaView className="flex-1 bg-transparent">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="px-6 pt-6 flex-1">
            {step !== 'password' && (
              <TouchableOpacity onPress={handleBack} className="mb-6 self-start p-2 -ml-2">
                <ChevronLeft size={28} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
            )}

            {step === 'phone' && (
              <View className="bg-white/10 rounded-3xl p-6 border border-white/20">
                <Text className="text-2xl font-sans-bold text-white mb-2">{t('auth.forgotPassword.title')}</Text>
                <Text className="text-base text-white/70 mb-8">
                  {t('auth.forgotPassword.subtitle')}
                </Text>
                <Input
                  label={t('auth.login.phoneLabel')}
                  placeholder="+998901234567"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  error={phoneError}
                  leftIcon={<Phone size={20} color="#94A3B8" />}
                />
                <Button fullWidth size="lg" onPress={handleSendOtp} loading={isSendingOtp}>
                  {t('auth.forgotPassword.submit')}
                </Button>
              </View>
            )}

            {step === 'otp' && (
              <View className="bg-white/10 rounded-3xl p-6 border border-white/20">
                <Text className="text-2xl font-sans-bold text-white mb-1">{t('auth.register.otpTitle')}</Text>
                <Text className="text-base text-white/70 mb-8">
                  {t('auth.register.otpSubtitle', { phone })}
                </Text>

                <TextInput
                  ref={hiddenOtpRef}
                  value={otp}
                  onChangeText={handleHiddenOtpChange}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  textContentType="oneTimeCode"
                  autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                  style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
                />

                <View className="flex-row justify-between mb-6">
                  {digits.map((digit, i) => (
                    <TouchableOpacity key={i} onPress={() => { hiddenOtpRef.current?.focus(); cellRefs.current[i]?.focus(); }}>
                      <TextInput
                        ref={(r) => { cellRefs.current[i] = r; }}
                        value={digit}
                        onChangeText={(v) => handleCellChange(v, i)}
                        onKeyPress={(e) => handleCellKeyPress(e, i)}
                        keyboardType="number-pad"
                        maxLength={2}
                        style={{
                          width: 44,
                          height: 56,
                          borderWidth: 2,
                          borderColor: digit ? '#60a5fa' : 'rgba(255,255,255,0.25)',
                          borderRadius: 12,
                          textAlign: 'center',
                          fontSize: 22,
                          fontWeight: '700',
                          color: '#ffffff',
                          backgroundColor: digit ? 'rgba(96,165,250,0.20)' : 'rgba(255,255,255,0.10)',
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {otpError ? (
                  <View className="bg-red-500/20 border border-red-400/40 rounded-2xl p-3 mb-4">
                    <Text className="text-red-300 text-sm text-center">{otpError}</Text>
                  </View>
                ) : null}

                <Button fullWidth size="lg" onPress={() => handleVerifyOtp()} loading={isVerifyingOtp} disabled={otp.length < OTP_LENGTH}>
                  {t('auth.register.verify')}
                </Button>

                <View className="items-center mt-5">
                  {countdown > 0 ? (
                    <Text className="text-white/60 text-sm">
                      {t('auth.register.resendIn')}<Text className="text-blue-300 font-sans-semibold">{formatTime(countdown)}</Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResend} disabled={isSendingOtp}>
                      <Text className="text-blue-300 text-sm font-sans-medium">{t('auth.register.resend')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {step === 'password' && (
              <View className="bg-white/10 rounded-3xl p-6 border border-white/20">
                <Text className="text-2xl font-sans-bold text-white mb-2">{t('auth.forgotPassword.newPasswordTitle')}</Text>
                <Text className="text-base text-white/70 mb-8">
                  {t('auth.forgotPassword.newPasswordSubtitle')}
                </Text>
                <Input
                  label={t('editProfile.newPassword')}
                  placeholder={t('editProfile.newPasswordPlaceholder')}
                  value={newPassword}
                  onChangeText={(v) => { setNewPassword(v); setPasswordErrors((e) => ({ ...e, newPassword: '' })); }}
                  isPassword
                  error={passwordErrors.newPassword}
                  leftIcon={<Lock size={20} color="#94A3B8" />}
                />
                <Input
                  label={t('editProfile.confirmPassword')}
                  placeholder={t('editProfile.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChangeText={(v) => { setConfirmPassword(v); setPasswordErrors((e) => ({ ...e, confirmPassword: '' })); }}
                  isPassword
                  error={passwordErrors.confirmPassword}
                  leftIcon={<Lock size={20} color="#94A3B8" />}
                />
                <Button fullWidth size="lg" onPress={handleSetPassword} loading={isSettingPassword}>
                  {t('auth.forgotPassword.newPasswordSubmit')}
                </Button>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}
