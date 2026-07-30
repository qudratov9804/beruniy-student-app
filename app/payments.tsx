import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Wallet, Clock, CheckCircle2, XCircle, BanIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { usePayments } from '@/hooks/usePayments';
import { Skeleton } from '@/components/ui';
import { ScreenBackground } from '@/components/common';
import { formatPrice, formatDate, paymentProviderLabels } from '@/utils';
import type { Payment, PaymentStatus } from '@/types';

type Filter = 'all' | PaymentStatus;

const FILTER_KEYS: Filter[] = ['all', 'pending', 'completed', 'failed'];

const statusMeta: Record<PaymentStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  pending: { color: '#fbbf24', bg: 'rgba(251,191,36,0.16)', icon: <Clock size={14} color="#fbbf24" /> },
  completed: { color: '#34d399', bg: 'rgba(52,211,153,0.16)', icon: <CheckCircle2 size={14} color="#34d399" /> },
  failed: { color: '#f87171', bg: 'rgba(248,113,113,0.16)', icon: <XCircle size={14} color="#f87171" /> },
  cancelled: { color: 'rgba(255,255,255,0.55)', bg: 'rgba(255,255,255,0.08)', icon: <BanIcon size={14} color="rgba(255,255,255,0.55)" /> },
};

function PaymentRow({ item }: { item: Payment }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const meta = statusMeta[item.status];

  const handlePress = () => {
    if (item.status !== 'pending') return;
    router.push({
      pathname: '/payment/[transactionId]',
      params: { transactionId: item.transaction_id, paymentUrl: item.payment_url },
    });
  };

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={item.status === 'pending' ? 0.7 : 1}
      onPress={handlePress}
    >
      <View style={styles.rowIcon}>
        <Wallet size={20} color="#60a5fa" />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>
          {paymentProviderLabels[item.provider]} · {t(`enums.subscriptionType.${item.subscription_type}`)}
        </Text>
        <Text style={styles.rowSub}>{item.transaction_id}</Text>
        {item.paid_at && <Text style={styles.rowDate}>{formatDate(item.paid_at, i18n.language)}</Text>}
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowAmount}>{formatPrice(item.amount, t, i18n.language)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
          {meta.icon}
          <Text style={[styles.statusText, { color: meta.color }]}>
            {t(`enums.paymentStatus.${item.status}`)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PaymentsHistoryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { data: payments, isLoading, refetch } = usePayments(
    filter === 'all' ? undefined : { status: filter }
  );

  const FILTERS: { key: Filter; label: string }[] = FILTER_KEYS.map((key) => ({
    key,
    label: key === 'all' ? t('common.seeAll') : t(`enums.paymentStatus.${key}`),
  }));

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}
            style={styles.backBtn}
          >
            <ChevronLeft size={22} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.paymentHistory')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 4, gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={84} borderRadius={18} />
            ))}
          </View>
        ) : (
          <FlatList
            data={payments ?? []}
            keyExtractor={(item) => item.transaction_id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#60a5fa']} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Wallet size={52} color="rgba(255,255,255,0.15)" />
                <Text style={styles.emptyTitle}>{t('payments.notFound')}</Text>
                <Text style={styles.emptySub}>{t('payments.emptySubtitle')}</Text>
              </View>
            }
            renderItem={({ item }) => <PaymentRow item={item} />}
          />
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 4, marginBottom: 12 },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  filterTabActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterText: { color: 'rgba(255,255,255,0.60)', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#ffffff' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    padding: 14, marginBottom: 12,
  },
  rowIcon: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(37,99,235,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  rowInfo: { flex: 1 },
  rowTitle: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  rowSub: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 },
  rowDate: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 },
  rowRight: { alignItems: 'flex-end', gap: 6 },
  rowAmount: { color: '#60a5fa', fontSize: 13, fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { color: 'rgba(255,255,255,0.60)', fontSize: 15, fontWeight: '600', marginTop: 16, textAlign: 'center' },
  emptySub: { color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 19 },
});
