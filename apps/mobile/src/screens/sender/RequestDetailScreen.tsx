import { View, Text, StyleSheet, FlatList } from 'react-native';
import { BrandLoader } from '@/components/BrandLoader';
import { Alert } from '@/components/AlertHost';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, spacing, typography, sizing } from '@/theme';
import { Card, Badge, statusTone } from '@/components/Card';
import { PrimaryButton } from '@/components/ui';
import { api } from '@/lib/api';
import type { ScreenProps } from '@/navigation/types';

export function RequestDetailScreen({ route, navigation }: ScreenProps<'RequestDetail'>) {
  const { requestId } = route.params;
  const qc = useQueryClient();
  const { data: bids, isLoading } = useQuery({
    queryKey: ['request-bids', requestId],
    queryFn: () => api.requestBids(requestId),
  });
  const insights = useQuery({
    queryKey: ['request-insights', requestId],
    queryFn: () => api.requestInsights(requestId),
  });

  const accept = useMutation({
    mutationFn: (bidId: string) => api.acceptBid(requestId, bidId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-requests'] });
      Alert.alert('Bid accepted', 'Payment & escrow arrive in the next update.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (e) => Alert.alert('Could not accept', (e as Error).message),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bids</Text>
      {insights.data && (
        <View style={styles.insights}>
          <Text style={styles.insightsText}>
            ✈️ {insights.data.activeTravelers} traveler{insights.data.activeTravelers === 1 ? '' : 's'} active to{' '}
            {insights.data.destinationCity} this week
            {insights.data.avgDaysToMatch != null
              ? ` · expected match ~${insights.data.avgDaysToMatch} day${insights.data.avgDaysToMatch === 1 ? '' : 's'}`
              : ''}
          </Text>
        </View>
      )}
      {isLoading ? (
        <BrandLoader style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={bids ?? []}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ paddingVertical: spacing.lg, gap: spacing.md }}
          ListEmptyComponent={
            <Text style={styles.empty}>No bids yet. We'll notify travelers on your route.</Text>
          }
          renderItem={({ item }) => {
            const accepted = item.status === 'ACCEPTED';
            return (
              <Card>
                <View style={styles.row}>
                  <Text style={styles.name}>{item.traveler.fullName ?? 'Traveler'}</Text>
                  <Badge label={item.status} tone={statusTone(item.status)} />
                </View>
                <Text style={styles.meta}>
                  ★ {item.traveler.ratingAvg.toFixed(1)} ({item.traveler.ratingCount}) ·{' '}
                  {item.route.originAirport}→{item.route.destinationAirport} · {item.route.departureDate}
                </Text>
                {item.message ? <Text style={styles.msg}>"{item.message}"</Text> : null}
                <Text style={styles.fee}>You pay ₹{item.carryFeeInr.toLocaleString('en-IN')}</Text>
                {!accepted && item.status === 'PENDING' && (
                  <View style={{ marginTop: spacing.md }}>
                    <PrimaryButton
                      label="Accept bid"
                      onPress={() => accept.mutate(item.id)}
                      loading={accept.isPending}
                    />
                  </View>
                )}
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX, paddingTop: spacing.md },
  title: { ...typography.titleL, color: colors.textPrimary },
  insights: { marginTop: spacing.sm, backgroundColor: colors.skyLight, borderRadius: 8, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  insightsText: { ...typography.bodyM, color: '#185FA5', fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...typography.bodyL, fontWeight: '600', color: colors.textPrimary },
  meta: { ...typography.bodyM, color: colors.textSecondary, marginTop: spacing.xs },
  msg: { ...typography.bodyM, color: colors.textPrimary, marginTop: spacing.sm, fontStyle: 'italic' },
  fee: { ...typography.bodyL, fontWeight: '700', color: colors.navyMid, marginTop: spacing.sm },
  empty: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', marginTop: spacing['3xl'] },
});
