import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, ExternalLink, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { usePaymentStatus } from '@/hooks/usePayments';
import { ScreenBackground } from '@/components/common/ScreenBackground';
import { QUERY_KEYS } from '@/constants/config';
import { formatPrice } from '@/utils';

export default function PaymentStatusScreen() {
  const { transactionId, paymentUrl, courseSlug, courseId } = useLocalSearchParams<{
    transactionId: string;
    paymentUrl?: string;
    courseSlug?: string;
    courseId?: string;
  }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { data: payment, isLoading } = usePaymentStatus(transactionId ?? null);
  const openedOnce = useRef(false);
  const invalidatedOnce = useRef(false);

  // `paymentUrl` travels through expo-router's URL-serialized params, so it can
  // arrive as an array if the value was ever duplicated, and Linking.openURL
  // throws synchronously (not a promise rejection) on a malformed/non-string
  // URI on Android — that throw was previously uncaught and crashed the app.
  const openPaymentUrl = (url?: string | string[]) => {
    const target = Array.isArray(url) ? url[0] : url;
    if (!target) return;
    try {
      Linking.openURL(target).catch(() => {});
    } catch {
      // Malformed URI on the native side — nothing more we can do here.
    }
  };

  useEffect(() => {
    if (!openedOnce.current && paymentUrl) {
      openedOnce.current = true;
      openPaymentUrl(paymentUrl);
    }
  }, [paymentUrl]);

  useEffect(() => {
    if (payment?.status !== 'completed' || invalidatedOnce.current) return;
    invalidatedOnce.current = true;

    const invalidateEnrollmentState = () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS.ALL });
      if (courseSlug) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.DETAIL(courseSlug) });
      }
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS.DETAIL(Number(courseId)) });
      }
    };

    // The payment gateway confirms completion before the backend's enrollment
    // record is necessarily created (webhook lag), so a single invalidation
    // right away can still read "not enrolled". Retry for a few seconds.
    invalidateEnrollmentState();
    const retryDelaysMs = [1500, 4000, 8000];
    const timers = retryDelaysMs.map((delay) => setTimeout(invalidateEnrollmentState, delay));
    return () => timers.forEach(clearTimeout);
  }, [payment?.status, courseSlug, courseId, queryClient]);

  const handleReopen = () => openPaymentUrl(paymentUrl);

  const status = payment?.status;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace(courseSlug ? `/course/${courseSlug}` : '/(tabs)/my-courses')
          }
          style={styles.backBtn}
        >
          <ChevronLeft size={22} color="rgba(255,255,255,0.75)" />
        </TouchableOpacity>

        <View style={styles.center}>
          {isLoading && !payment ? (
            <>
              <ActivityIndicator size="large" color="#60a5fa" />
              <Text style={styles.title}>{t('paymentStatus.checking')}</Text>
            </>
          ) : status === 'completed' ? (
            <>
              <CheckCircle2 size={72} color="#34d399" />
              <Text style={styles.title}>{t('paymentStatus.success')}</Text>
              {payment && (
                <Text style={styles.sub}>{t('paymentStatus.amountPaid', { amount: formatPrice(payment.amount, t, i18n.language) })}</Text>
              )}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() =>
                  courseSlug ? router.replace(`/course/${courseSlug}`) : router.replace('/(tabs)/my-courses')
                }
              >
                <Text style={styles.primaryBtnText}>{t('paymentStatus.startCourse')}</Text>
              </TouchableOpacity>
            </>
          ) : status === 'failed' || status === 'cancelled' ? (
            <>
              <XCircle size={72} color="#f87171" />
              <Text style={styles.title}>
                {status === 'cancelled' ? t('paymentStatus.cancelled') : t('paymentStatus.failed')}
              </Text>
              <Text style={styles.sub}>{t('paymentStatus.retryHint')}</Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.replace(courseSlug ? `/course/${courseSlug}` : '/(tabs)/my-courses')
                }
              >
                <Text style={styles.primaryBtnText}>{t('common.back')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color="#60a5fa" />
              <Text style={styles.title}>{t('paymentStatus.pending')}</Text>
              <Text style={styles.sub}>
                {t('paymentStatus.pendingHint')}
              </Text>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleReopen}>
                <ExternalLink size={16} color="#60a5fa" />
                <Text style={styles.secondaryBtnText}>{t('paymentStatus.reopenPage')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backBtn: {
    marginTop: 8, marginLeft: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  sub: { color: 'rgba(255,255,255,0.55)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  primaryBtn: {
    marginTop: 10, backgroundColor: '#2563eb', borderRadius: 16, height: 50,
    paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(96,165,250,0.35)',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  secondaryBtnText: { color: '#60a5fa', fontSize: 14, fontWeight: '600' },
});
