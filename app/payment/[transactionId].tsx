import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, ExternalLink, ChevronLeft } from 'lucide-react-native';
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
  const queryClient = useQueryClient();
  const { data: payment, isLoading } = usePaymentStatus(transactionId ?? null);
  const openedOnce = useRef(false);
  const invalidatedOnce = useRef(false);

  useEffect(() => {
    if (!openedOnce.current && paymentUrl) {
      openedOnce.current = true;
      Linking.openURL(paymentUrl).catch(() => {});
    }
  }, [paymentUrl]);

  useEffect(() => {
    if (payment?.status === 'completed' && !invalidatedOnce.current) {
      invalidatedOnce.current = true;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS.ALL });
      if (courseSlug) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES.DETAIL(courseSlug) });
      }
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS.DETAIL(Number(courseId)) });
      }
    }
  }, [payment?.status, courseSlug, courseId, queryClient]);

  const handleReopen = () => {
    if (paymentUrl) Linking.openURL(paymentUrl).catch(() => {});
  };

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
              <Text style={styles.title}>Tekshirilmoqda...</Text>
            </>
          ) : status === 'completed' ? (
            <>
              <CheckCircle2 size={72} color="#34d399" />
              <Text style={styles.title}>To'lov muvaffaqiyatli amalga oshirildi!</Text>
              {payment && (
                <Text style={styles.sub}>{formatPrice(payment.amount)} to'landi</Text>
              )}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() =>
                  courseSlug ? router.replace(`/course/${courseSlug}`) : router.replace('/(tabs)/my-courses')
                }
              >
                <Text style={styles.primaryBtnText}>Kursni boshlash</Text>
              </TouchableOpacity>
            </>
          ) : status === 'failed' || status === 'cancelled' ? (
            <>
              <XCircle size={72} color="#f87171" />
              <Text style={styles.title}>
                {status === 'cancelled' ? "To'lov bekor qilindi" : "To'lov amalga oshmadi"}
              </Text>
              <Text style={styles.sub}>Qaytadan urinib ko'ring yoki boshqa usulni tanlang.</Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.replace(courseSlug ? `/course/${courseSlug}` : '/(tabs)/my-courses')
                }
              >
                <Text style={styles.primaryBtnText}>Ortga qaytish</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color="#60a5fa" />
              <Text style={styles.title}>To'lov kutilmoqda...</Text>
              <Text style={styles.sub}>
                To'lov sahifasida amalni yakunlang. Tasdiqlangach, bu sahifa avtomatik yangilanadi.
              </Text>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleReopen}>
                <ExternalLink size={16} color="#60a5fa" />
                <Text style={styles.secondaryBtnText}>To'lov sahifasini qayta ochish</Text>
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
