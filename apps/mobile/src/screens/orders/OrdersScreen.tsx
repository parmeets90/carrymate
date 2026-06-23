import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizing, radius } from '@/theme';
import { Card, Badge, statusTone } from '@/components/Card';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { Avatar, Timeline, EmptyState } from '@/components/widgets';
import { Icon } from '@/components/Icon';
import { PlaneTrack, SuccessPop } from '@/components/anim';
import { api } from '@/lib/api';
import type { OrderView } from '@carrymate/shared';
import type { RootStackParamList } from '@/navigation/types';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function OrdersScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['orders'], queryFn: api.myOrders });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['orders'] });
  const pay = useMutation({ mutationFn: (id: string) => api.payOrder(id), onSuccess: invalidate, onError: (e) => Alert.alert('Payment failed', (e as Error).message) });
  const release = useMutation({ mutationFn: (id: string) => api.releaseOrder(id), onSuccess: () => { invalidate(); Alert.alert('Released', 'Escrow released to the traveler.'); }, onError: (e) => Alert.alert('Could not release', (e as Error).message) });
  const chat = useMutation({
    mutationFn: async (o: OrderView) => ({ conv: await api.conversationForOrder(o.id), order: o }),
    onSuccess: ({ conv, order }) => nav.navigate('ChatThread', { conversationId: conv.id, title: order.requestTitle, counterparty: order.counterpartyName }),
    onError: (e) => Alert.alert('Chat unavailable', (e as Error).message),
  });

  const renderItem = ({ item }: { item: OrderView }) => {
    const isSender = item.role === 'SENDER';
    return (
      <Card>
        <View style={styles.row}>
          <Avatar name={item.counterpartyName} size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{item.requestTitle}</Text>
            <Text style={styles.meta}>{item.originCity} → {item.destinationCity}</Text>
          </View>
          <Badge label={(item.hasDispute ? 'DISPUTED' : item.requestStatus).replace('_', ' ')} tone={item.hasDispute ? 'danger' : statusTone(item.requestStatus)} />
        </View>

        {['MATCHED', 'IN_TRANSIT', 'DELIVERED', 'CONFIRMED'].includes(item.requestStatus) && (
          <Timeline status={item.requestStatus} />
        )}

        {item.requestStatus === 'IN_TRANSIT' && (
          <PlaneTrack
            label={`${item.counterpartyName ?? (isSender ? 'Your traveler' : 'You')} ${isSender ? 'is on the way to' : 'are carrying this to'} ${item.destinationCity}…`}
          />
        )}

        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>{isSender ? 'You pay' : 'You receive'}</Text>
          <Text style={styles.amount}>{inr(isSender ? item.amountInr : item.payoutInr)}</Text>
        </View>

        {item.escrowHeldAt && !item.releasedAt && item.status !== 'REFUNDED' && (
          <View style={styles.escrow}>
            <Icon name="lock" size={14} color="#096438" weight="fill" />
            <Text style={styles.escrowText}>Escrow secured — released only on delivery confirm</Text>
          </View>
        )}
        {item.counterpartyPhone && (
          <Text style={styles.contact}>{item.counterpartyName ?? (isSender ? 'Traveler' : 'Sender')} · {item.counterpartyPhone}</Text>
        )}

        {isSender && item.deliveryOtp && (
          <View style={styles.otpBox}>
            <Text style={styles.otpLabel}>Share this handover code with your recipient</Text>
            <Text style={styles.otpCode}>{item.deliveryOtp}</Text>
          </View>
        )}

        <View style={styles.actions}>
          {isSender && item.status === 'PENDING_PAYMENT' && (
            <>
              <PrimaryButton label={`Pay ${inr(item.amountInr)} into escrow`} onPress={() => pay.mutate(item.id)} loading={pay.isPending} />
              <Text style={styles.fema}>
                All transactions are personal in nature. CarryMate must not be used for commercial
                imports, exports, or currency transfer.
              </Text>
            </>
          )}
          {!isSender && item.status === 'ESCROW_HELD' && item.requestStatus === 'MATCHED' && (
            <PrimaryButton label="Open-box & pick up" onPress={() => nav.navigate('OpenBox', { orderId: item.id, title: item.requestTitle })} />
          )}
          {!isSender && item.requestStatus === 'IN_TRANSIT' && (
            <PrimaryButton label="Enter handover code & deliver" onPress={() => nav.navigate('Deliver', { orderId: item.id, title: item.requestTitle })} />
          )}
          {isSender && item.status === 'DELIVERY_PROOF_UPLOADED' && (
            <PrimaryButton label="Confirm receipt & release" onPress={() => release.mutate(item.id)} loading={release.isPending} />
          )}
          {item.status === 'COMPLETED' && (
            <SuccessPop>
              <View style={styles.doneRow}>
                <Icon name="check" size={16} color="#096438" weight="fill" />
                <Text style={styles.doneText}>Delivered & released</Text>
              </View>
              <PrimaryButton label="Rate" onPress={() => nav.navigate('Rate', { orderId: item.id, counterparty: item.counterpartyName ?? 'them' })} />
            </SuccessPop>
          )}
          {item.escrowHeldAt && (
            <SecondaryButton
              label={`Message ${item.counterpartyName ?? (isSender ? 'traveler' : 'sender')}`}
              onPress={() => chat.mutate(item)}
            />
          )}
        </View>

        {['ESCROW_HELD', 'IN_TRANSIT', 'DELIVERY_PROOF_UPLOADED'].includes(item.status) && !item.hasDispute && (
          <Pressable onPress={() => nav.navigate('Dispute', { orderId: item.id, title: item.requestTitle })}>
            <Text style={styles.disputeLink}>Something wrong? Raise a dispute</Text>
          </Pressable>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data ?? []}
        keyExtractor={(o) => o.id}
        renderItem={renderItem}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListHeaderComponent={<Text style={styles.heading}>Orders</Text>}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + spacing.lg }]}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.skyBlue} style={{ marginTop: spacing['3xl'] }} />
          ) : (
            <EmptyState icon="orders" title="No orders yet" body="Accept a bid (sender) or get matched (traveler) to start an order." />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp },
  list: { paddingHorizontal: sizing.screenPaddingX, paddingBottom: spacing['3xl'], gap: spacing.md },
  heading: { ...typography.display, color: colors.textPrimary, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { ...typography.bodyL, fontWeight: '700', color: colors.textPrimary },
  meta: { ...typography.bodyM, color: colors.textSecondary, marginTop: 1 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 0.5, borderTopColor: colors.borderLight },
  amountLabel: { ...typography.bodyM, color: colors.textSecondary },
  amount: { ...typography.titleM, fontWeight: '700', color: colors.navyMid },
  escrow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, backgroundColor: colors.mintLight, borderRadius: radius.input, padding: spacing.sm },
  escrowText: { ...typography.caption, color: '#096438', fontWeight: '600' },
  contact: { ...typography.bodyM, color: colors.textPrimary, marginTop: spacing.sm },
  otpBox: { marginTop: spacing.md, backgroundColor: colors.goldLight, borderRadius: radius.card, padding: spacing.md, alignItems: 'center' },
  otpLabel: { ...typography.caption, color: colors.goldPrimary, fontWeight: '700' },
  otpCode: { ...typography.display, color: colors.navyDark, letterSpacing: 8, marginTop: 4 },
  actions: { marginTop: spacing.md, gap: spacing.sm },
  disputeLink: { ...typography.bodyM, color: colors.dangerRed, marginTop: spacing.md, textAlign: 'center', fontWeight: '600' },
  fema: { ...typography.caption, color: colors.textHint, fontSize: 10, lineHeight: 14, marginTop: spacing.xs },
  doneRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: spacing.sm },
  doneText: { ...typography.bodyM, color: '#096438', fontWeight: '700' },
});

