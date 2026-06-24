import { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizing, radius } from '@/theme';
import { Card, Badge } from '@/components/Card';
import { EmptyState } from '@/components/widgets';
import { FadeInUp } from '@/components/anim';
import { Icon } from '@/components/Icon';
import { BrandLoader } from '@/components/BrandLoader';
import { api } from '@/lib/api';
import type { OrderView } from '@carrymate/shared';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

type Txn = {
  id: string;
  title: string;
  counterparty: string;
  date: string;
  amount: number;
  incoming: boolean;
  settled: boolean;
  state: string;
  tone: 'mint' | 'amber' | 'neutral' | 'danger';
};

/** Derive a per-order transaction from the viewer's perspective. */
function toTxn(o: OrderView): Txn {
  const base = {
    id: o.id,
    title: o.requestTitle,
    counterparty: o.counterpartyName ?? (o.role === 'SENDER' ? 'Traveler' : 'Sender'),
    date: fmtDate(o.createdAt),
  };
  if (o.role === 'TRAVELER') {
    if (o.status === 'REFUNDED') {
      return { ...base, amount: o.payoutInr, incoming: true, settled: false, state: 'Cancelled', tone: 'danger' };
    }
    const received = o.status === 'COMPLETED' || o.releasedAt != null;
    return {
      ...base,
      amount: o.payoutInr,
      incoming: true,
      settled: received,
      state: received ? 'Received' : 'Pending payout',
      tone: received ? 'mint' : 'amber',
    };
  }
  // SENDER
  if (o.status === 'REFUNDED') {
    return { ...base, amount: o.amountInr, incoming: true, settled: true, state: 'Refunded', tone: 'mint' };
  }
  const paidOut = o.status === 'COMPLETED' || o.releasedAt != null;
  const inEscrow = o.escrowHeldAt != null && !paidOut;
  return {
    ...base,
    amount: o.amountInr,
    incoming: false,
    settled: o.escrowHeldAt != null,
    state: paidOut ? 'Paid to traveler' : inEscrow ? 'Held in escrow' : 'Awaiting payment',
    tone: paidOut ? 'neutral' : inEscrow ? 'mint' : 'amber',
  };
}

export function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['orders'], queryFn: api.myOrders });

  const { txns, isTraveler, primary, pending } = useMemo(() => {
    const orders = data ?? [];
    const isTraveler = orders.length > 0 && orders.every((o) => o.role === 'TRAVELER');
    const traveler = orders.some((o) => o.role === 'TRAVELER');
    const txns = orders.map(toTxn);
    // Role-aware totals: travelers earn (incoming), senders spend (outgoing).
    const earned = orders
      .filter((o) => o.role === 'TRAVELER' && (o.status === 'COMPLETED' || o.releasedAt != null))
      .reduce((s, o) => s + o.payoutInr, 0);
    const pendingEarn = orders
      .filter((o) => o.role === 'TRAVELER' && o.status !== 'COMPLETED' && o.releasedAt == null && o.status !== 'REFUNDED')
      .reduce((s, o) => s + o.payoutInr, 0);
    const spent = orders
      .filter((o) => o.role === 'SENDER' && o.escrowHeldAt != null && o.status !== 'REFUNDED')
      .reduce((s, o) => s + o.amountInr, 0);
    const inEscrow = orders
      .filter((o) => o.role === 'SENDER' && o.escrowHeldAt != null && o.status !== 'COMPLETED' && o.releasedAt == null)
      .reduce((s, o) => s + o.amountInr, 0);
    return {
      txns,
      isTraveler: traveler,
      primary: traveler ? earned : spent,
      pending: traveler ? pendingEarn : inEscrow,
    };
  }, [data]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <Text style={styles.heading}>Transactions</Text>

      {!isLoading && (data?.length ?? 0) > 0 && (
        <View style={styles.summary}>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>{isTraveler ? 'Total earned' : 'Total spent'}</Text>
            <Text style={[styles.statValue, { color: isTraveler ? '#096438' : colors.navyMid }]}>
              {inr(primary)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statTile}>
            <View style={styles.statLabelRow}>
              <Icon name="lock" size={12} color={colors.textSecondary} weight="fill" />
              <Text style={styles.statLabel}>{isTraveler ? 'Pending payout' : 'In escrow'}</Text>
            </View>
            <Text style={styles.statValue}>{inr(pending)}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={txns}
        keyExtractor={(t) => t.id}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <BrandLoader style={{ marginTop: spacing['3xl'] }} />
          ) : (
            <EmptyState
              icon="wallet"
              title="No transactions yet"
              body="Your payments and payouts will appear here once you complete an order."
            />
          )
        }
        renderItem={({ item, index }) => (
          <FadeInUp index={index}>
            <Card style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: item.incoming ? colors.mintLight : colors.skyLight }]}>
                <Icon
                  name={item.incoming ? 'wallet' : 'send'}
                  size={18}
                  color={item.incoming ? colors.mintPrimary : colors.skyBlue}
                  weight="fill"
                />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {item.counterparty} · {item.date}
                </Text>
                <View style={styles.badgeWrap}>
                  <Badge label={item.state} tone={item.tone} />
                </View>
              </View>
              <Text
                style={[
                  styles.amount,
                  { color: item.incoming ? '#096438' : colors.navyMid },
                  !item.settled && styles.amountPending,
                ]}
              >
                {item.incoming ? '+' : '−'}{inr(item.amount)}
              </Text>
            </Card>
          </FadeInUp>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  heading: { ...typography.display, color: colors.textPrimary, marginBottom: spacing.md },
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: radius.card,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    paddingVertical: spacing.lg,
  },
  statTile: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 0.5, backgroundColor: colors.borderLight },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  statValue: { ...typography.titleL, fontWeight: '700', color: colors.textPrimary },
  list: { paddingVertical: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, gap: 3 },
  rowTitle: { ...typography.bodyL, fontWeight: '700', color: colors.textPrimary },
  rowMeta: { ...typography.caption, color: colors.textSecondary },
  badgeWrap: { marginTop: 2 },
  amount: { ...typography.bodyL, fontWeight: '800' },
  amountPending: { opacity: 0.55 },
});
