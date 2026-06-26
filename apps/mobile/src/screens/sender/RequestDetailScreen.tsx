import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SkeletonList } from '@/components/Skeleton';
import { Alert } from '@/components/AlertHost';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, spacing, typography, sizing, radius } from '@/theme';
import { Card, Badge, TrustBadge, statusTone } from '@/components/Card';
import { Avatar, EmptyState } from '@/components/widgets';
import { FadeInUp } from '@/components/anim';
import { Icon } from '@/components/Icon';
import { PrimaryButton } from '@/components/ui';
import { api } from '@/lib/api';
import type { BidDto } from '@carrymate/shared';
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
      <Text style={styles.title}>Choose your carrier</Text>
      <Text style={styles.subtitle}>
        Every traveler is identity-checked. Funds stay in escrow until your item is delivered.
      </Text>

      {insights.data && (
        <View style={styles.insights}>
          <Icon name="trips" size={16} color={colors.primary} weight="fill" />
          <Text style={styles.insightsText}>
            {insights.data.activeTravelers} traveler{insights.data.activeTravelers === 1 ? '' : 's'} active to{' '}
            {insights.data.destinationCity} this week
            {insights.data.avgDaysToMatch != null
              ? ` · ~${insights.data.avgDaysToMatch} day${insights.data.avgDaysToMatch === 1 ? '' : 's'} to match`
              : ''}
          </Text>
        </View>
      )}

      {isLoading ? (
        <SkeletonList />
      ) : (
        <FlatList
          data={bids ?? []}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="trips"
              title="No bids yet"
              body="We'll notify verified travelers on your route the moment they post a matching flight."
            />
          }
          renderItem={({ item, index }) => (
            <FadeInUp index={index}>
              <BidCard
                bid={item}
                accepting={accept.isPending}
                onAccept={() => accept.mutate(item.id)}
                onViewProfile={() =>
                  navigation.navigate('UserProfile', {
                    userId: item.traveler.id,
                    name: item.traveler.fullName,
                  })
                }
              />
            </FadeInUp>
          )}
        />
      )}
    </View>
  );
}

function BidCard({
  bid,
  onAccept,
  accepting,
  onViewProfile,
}: {
  bid: BidDto;
  onAccept: () => void;
  accepting: boolean;
  onViewProfile: () => void;
}) {
  const { traveler, route } = bid;
  const pending = bid.status === 'PENDING';
  const rated = traveler.ratingCount > 0;
  const trustedCarrier = traveler.ratingAvg >= 4.8 && traveler.ratingCount >= 10;

  return (
    <Card>
      {/* Identity + headline price — tap identity to view the trust profile */}
      <View style={styles.head}>
        <Pressable style={styles.identity} onPress={onViewProfile} hitSlop={6}>
          <Avatar name={traveler.fullName} size={sizing.avatarLarge} />
          <View style={styles.headText}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {traveler.fullName ?? 'Traveler'}
              </Text>
              <Icon name="chevronRight" size={15} color={colors.textHint} />
            </View>
            <View style={styles.ratingRow}>
              {rated ? (
                <>
                  <Icon name="star" size={13} color={colors.goldPrimary} weight="fill" />
                  <Text style={styles.ratingText}>{traveler.ratingAvg.toFixed(1)}</Text>
                  <Text style={styles.ratingMeta}>
                    · {traveler.ratingCount} trip{traveler.ratingCount === 1 ? '' : 's'}
                  </Text>
                </>
              ) : (
                <Text style={styles.ratingMeta}>New traveler</Text>
              )}
            </View>
          </View>
        </Pressable>
        <View style={styles.pricePill}>
          <Text style={styles.priceLabel}>You pay</Text>
          <Text style={styles.priceValue}>₹{bid.carryFeeInr.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Trust badge stack (UX rule 5) */}
      <View style={styles.badges}>
        {traveler.kycStatus === 'VERIFIED' && <TrustBadge variant="kycVerified" />}
        {route.flightVerified && <TrustBadge variant="flightConfirmed" />}
        {trustedCarrier && <TrustBadge variant="trustedCarrier" />}
        {pending ? null : <Badge label={bid.status} tone={statusTone(bid.status)} />}
      </View>

      {/* Route */}
      <View style={styles.routeRow}>
        <Icon name="location" size={15} color={colors.textSecondary} />
        <Text style={styles.routeText}>
          {route.originAirport} → {route.destinationAirport} · {route.departureDate}
          {route.flightNumber ? ` · ${route.flightNumber}` : ''}
        </Text>
      </View>

      {bid.message ? <Text style={styles.msg}>“{bid.message}”</Text> : null}

      {/* Escrow reassurance (UX rule 2) */}
      <View style={styles.escrow}>
        <Icon name="lock" size={15} color="#096438" weight="fill" />
        <Text style={styles.escrowText}>Held in escrow · released only on delivery confirm</Text>
      </View>

      {pending && (
        <View style={styles.cta}>
          <PrimaryButton label="Accept & secure escrow" icon="lock" onPress={onAccept} loading={accepting} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
    paddingHorizontal: sizing.screenPaddingX,
    paddingTop: spacing.md,
  },
  title: { ...typography.titleL, color: colors.textPrimary },
  subtitle: { ...typography.bodyM, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
  insights: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.skyLight,
    borderRadius: radius.input,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  insightsText: { ...typography.bodyM, color: colors.primary, fontWeight: '600', flex: 1 },
  list: { paddingVertical: spacing.lg, gap: spacing.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  headText: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  name: { ...typography.bodyL, fontWeight: '700', color: colors.textPrimary, flexShrink: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { ...typography.bodyM, fontWeight: '700', color: colors.textPrimary },
  ratingMeta: { ...typography.bodyM, color: colors.textSecondary },
  pricePill: { alignItems: 'flex-end' },
  priceLabel: { ...typography.caption, color: colors.textHint },
  priceValue: { ...typography.titleM, fontWeight: '700', color: colors.navyMid },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  routeText: { ...typography.bodyM, color: colors.textSecondary },
  msg: { ...typography.bodyM, color: colors.textPrimary, marginTop: spacing.sm, fontStyle: 'italic' },
  escrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    backgroundColor: colors.mintLight,
    borderRadius: radius.input,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  escrowText: { ...typography.caption, color: '#096438', fontWeight: '600' },
  cta: { marginTop: spacing.md },
});
