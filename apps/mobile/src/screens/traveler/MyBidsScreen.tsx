import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizing } from '@/theme';
import { Card, Badge, statusTone } from '@/components/Card';
import { EmptyState } from '@/components/widgets';
import { api } from '@/lib/api';

export function MyBidsScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-bids'],
    queryFn: api.myBids,
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.title}>My bids</Text>
      {isLoading ? (
        <ActivityIndicator color={colors.skyBlue} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(b) => b.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ paddingVertical: spacing.lg, gap: spacing.md }}
          ListEmptyComponent={
            <EmptyState icon="bids" title="No bids yet" body="Browse requests from your trips to place a bid." />
          }
          renderItem={({ item }) => (
            <Card>
              <View style={styles.row}>
                <Text style={styles.route}>
                  {item.route.originAirport} → {item.route.destinationAirport}
                </Text>
                <Badge label={item.status} tone={statusTone(item.status)} />
              </View>
              <Text style={styles.fee}>You receive ₹{item.payoutInr.toLocaleString('en-IN')}</Text>
              <Text style={styles.meta}>Est. delivery {item.estimatedDeliveryDate}</Text>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  title: { ...typography.titleL, color: colors.textPrimary },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  route: { ...typography.bodyL, fontWeight: '700', color: colors.textPrimary },
  fee: { ...typography.bodyL, fontWeight: '700', color: colors.navyMid, marginTop: spacing.sm },
  meta: { ...typography.bodyM, color: colors.textSecondary, marginTop: spacing.xs },
  empty: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', marginTop: spacing['3xl'] },
});
