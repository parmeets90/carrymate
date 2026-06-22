import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizing, radius } from '@/theme';
import { Card, Badge, statusTone } from '@/components/Card';
import { PrimaryButton } from '@/components/ui';
import { api } from '@/lib/api';
import type { OrderView } from '@carrymate/shared';
import type { RootStackParamList } from '@/navigation/types';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// 4-step delivery timeline driven by the request status.
const STEPS = ['MATCHED', 'IN_TRANSIT', 'DELIVERED', 'CONFIRMED'];
const STEP_LABEL: Record<string, string> = {
  MATCHED: 'Matched',
  IN_TRANSIT: 'In transit',
  DELIVERED: 'Delivered',
  CONFIRMED: 'Confirmed',
};

export function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const qc = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['orders'], queryFn: api.myOrders });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['orders'] });
  const pay = useMutation({ mutationFn: (id: string) => api.payOrder(id), onSuccess: invalidate, onError: (e) => Alert.alert('Payment failed', (e as Error).message) });
  const release = useMutation({ mutationFn: (id: string) => api.releaseOrder(id), onSuccess: () => { invalidate(); Alert.alert('Released', 'Escrow released to the traveler.'); }, onError: (e) => Alert.alert('Could not release', (e as Error).message) });
  const openBox = useMutation({
    mutationFn: (id: string) => api.openBox(id, { checklist: { inspected: true, contentsMatch: true, noProhibited: true, sealed: true }, photos: ['pending-upload'] }),
    onSuccess: invalidate,
    onError: (e) => Alert.alert('Open-box failed', (e as Error).message),
  });

  const confirmOpenBox = (id: string) =>
    Alert.alert('Open-box declaration', 'Confirm you inspected the package, contents match, no prohibited items, and it is sealed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm & pick up', onPress: () => openBox.mutate(id) },
    ]);

  const renderItem = ({ item }: { item: OrderView }) => {
    const isSender = item.role === 'SENDER';
    const stepIdx = STEPS.indexOf(item.requestStatus);

    return (
      <Card>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>{item.requestTitle}</Text>
          <Badge label={(item.hasDispute ? 'DISPUTED' : item.requestStatus).replace('_', ' ')} tone={item.hasDispute ? 'danger' : statusTone(item.requestStatus)} />
        </View>
        <Text style={styles.meta}>{item.originCity} → {item.destinationCity}</Text>
        <Text style={styles.amount}>{isSender ? `You pay ${inr(item.amountInr)}` : `You receive ${inr(item.payoutInr)}`}</Text>

        {/* Timeline */}
        {stepIdx >= 0 && (
          <View style={styles.timeline}>
            {STEPS.map((s, i) => (
              <View key={s} style={styles.step}>
                <View style={[styles.dot, i <= stepIdx && styles.dotActive]} />
                <Text style={[styles.stepLabel, i <= stepIdx && styles.stepLabelActive]}>{STEP_LABEL[s]}</Text>
              </View>
            ))}
          </View>
        )}

        {item.status === 'ESCROW_HELD' && (
          <Text style={styles.escrow}>🔒 Escrow secured — released only on delivery confirm</Text>
        )}
        {item.counterpartyPhone && (
          <Text style={styles.contact}>{item.counterpartyName ?? (isSender ? 'Traveler' : 'Sender')} · {item.counterpartyPhone}</Text>
        )}

        {/* Sender: share OTP while in transit */}
        {isSender && item.deliveryOtp && (
          <View style={styles.otpBox}>
            <Text style={styles.otpLabel}>Share this handover code with your recipient</Text>
            <Text style={styles.otpCode}>{item.deliveryOtp}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {isSender && item.status === 'PENDING_PAYMENT' && (
            <PrimaryButton label={`Pay ${inr(item.amountInr)} into escrow`} onPress={() => pay.mutate(item.id)} loading={pay.isPending} />
          )}
          {!isSender && item.status === 'ESCROW_HELD' && item.requestStatus === 'MATCHED' && (
            <PrimaryButton label="Confirm open-box & pick up" onPress={() => confirmOpenBox(item.id)} loading={openBox.isPending} />
          )}
          {!isSender && item.requestStatus === 'IN_TRANSIT' && (
            <PrimaryButton label="Enter handover code & deliver" onPress={() => nav.navigate('Deliver', { orderId: item.id, title: item.requestTitle })} />
          )}
          {isSender && item.requestStatus === 'DELIVERED' && item.status === 'ESCROW_HELD' && (
            <PrimaryButton label="Confirm receipt & release" onPress={() => release.mutate(item.id)} loading={release.isPending} />
          )}
          {item.status === 'COMPLETED' && (
            <PrimaryButton label="Rate" onPress={() => nav.navigate('Rate', { orderId: item.id, counterparty: item.counterpartyName ?? 'them' })} />
          )}
        </View>

        {/* Dispute link while escrow held and not completed/disputed */}
        {item.status === 'ESCROW_HELD' && !item.hasDispute && (
          <Pressable onPress={() => nav.navigate('Dispute', { orderId: item.id, title: item.requestTitle })}>
            <Text style={styles.disputeLink}>Something wrong? Raise a dispute</Text>
          </Pressable>
        )}
      </Card>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.heading}>Orders</Text>
      {isLoading ? (
        <ActivityIndicator color={colors.skyBlue} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(o) => o.id}
          renderItem={renderItem}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ paddingVertical: spacing.lg, gap: spacing.md }}
          ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  heading: { ...typography.titleL, color: colors.textPrimary },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.bodyL, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  meta: { ...typography.bodyM, color: colors.textSecondary, marginTop: spacing.xs },
  amount: { ...typography.bodyL, fontWeight: '700', color: colors.navyMid, marginTop: spacing.sm },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  step: { alignItems: 'center', flex: 1, gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.borderLight },
  dotActive: { backgroundColor: colors.mintPrimary },
  stepLabel: { ...typography.caption, color: colors.textHint },
  stepLabelActive: { color: colors.textPrimary, fontWeight: '600' },
  escrow: { ...typography.caption, color: '#096438', fontWeight: '600', marginTop: spacing.md },
  contact: { ...typography.bodyM, color: colors.textPrimary, marginTop: spacing.sm },
  otpBox: { marginTop: spacing.md, backgroundColor: colors.goldLight, borderRadius: radius.card, padding: spacing.md, alignItems: 'center' },
  otpLabel: { ...typography.caption, color: colors.goldPrimary, fontWeight: '600' },
  otpCode: { ...typography.display, color: colors.navyDark, letterSpacing: 6, marginTop: 4 },
  actions: { marginTop: spacing.md, gap: spacing.sm },
  disputeLink: { ...typography.bodyM, color: colors.dangerRed, marginTop: spacing.md, textAlign: 'center' },
  empty: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', marginTop: spacing['3xl'] },
});
