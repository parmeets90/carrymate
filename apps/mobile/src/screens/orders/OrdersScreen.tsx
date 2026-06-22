import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizing } from '@/theme';
import { Card, Badge, statusTone } from '@/components/Card';
import { PrimaryButton } from '@/components/ui';
import { api } from '@/lib/api';
import type { OrderView } from '@carrymate/shared';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders'],
    queryFn: api.myOrders,
  });

  const pay = useMutation({
    mutationFn: (id: string) => api.payOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
    onError: (e) => Alert.alert('Payment failed', (e as Error).message),
  });
  const release = useMutation({
    mutationFn: (id: string) => api.releaseOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Released', 'Escrow released to the traveler. Thank you!');
    },
    onError: (e) => Alert.alert('Could not release', (e as Error).message),
  });

  const renderItem = ({ item }: { item: OrderView }) => {
    const isSender = item.role === 'SENDER';
    return (
      <Card>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>
            {item.requestTitle}
          </Text>
          <Badge label={item.status.replace('_', ' ')} tone={statusTone(item.status)} />
        </View>
        <Text style={styles.meta}>
          {item.originCity} → {item.destinationCity}
        </Text>

        <Text style={styles.amount}>
          {isSender ? `You pay ${inr(item.amountInr)}` : `You receive ${inr(item.payoutInr)}`}
        </Text>

        {item.status === 'ESCROW_HELD' && (
          <View style={styles.escrow}>
            <Text style={styles.escrowText}>🔒 Escrow secured — released only on delivery confirm</Text>
          </View>
        )}

        {item.counterpartyPhone && (
          <Text style={styles.contact}>
            {item.counterpartyName ?? (isSender ? 'Traveler' : 'Sender')} · {item.counterpartyPhone}
          </Text>
        )}

        {isSender && item.status === 'PENDING_PAYMENT' && (
          <View style={styles.action}>
            <PrimaryButton
              label={`Pay ${inr(item.amountInr)} into escrow`}
              onPress={() => pay.mutate(item.id)}
              loading={pay.isPending}
            />
          </View>
        )}
        {isSender && item.status === 'ESCROW_HELD' && (
          <View style={styles.action}>
            <PrimaryButton
              label="Confirm receipt & release"
              onPress={() => release.mutate(item.id)}
              loading={release.isPending}
            />
          </View>
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
          ListEmptyComponent={
            <Text style={styles.empty}>No orders yet. Accept a bid (sender) or get matched (traveler).</Text>
          }
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
  escrow: {
    marginTop: spacing.sm,
    backgroundColor: colors.mintLight,
    borderRadius: 8,
    padding: spacing.sm,
  },
  escrowText: { ...typography.caption, color: '#096438', fontWeight: '600' },
  contact: { ...typography.bodyM, color: colors.textPrimary, marginTop: spacing.sm },
  action: { marginTop: spacing.md },
  empty: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', marginTop: spacing['3xl'] },
});
