import { View, Text, StyleSheet, FlatList } from 'react-native';
import { BrandLoader } from '@/components/BrandLoader';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, sizing } from '@/theme';
import { Card, Badge } from '@/components/Card';
import { EmptyState } from '@/components/widgets';
import { FadeInUp } from '@/components/anim';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import type { ScreenProps } from '@/navigation/types';

export function BrowseScreen({ route, navigation }: ScreenProps<'Browse'>) {
  const { routeId } = route.params;
  const { data, isLoading } = useQuery({
    queryKey: ['available', routeId],
    queryFn: () => api.availableForRoute(routeId),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Requests on this trip</Text>
      {isLoading ? (
        <BrandLoader style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ paddingVertical: spacing.lg, gap: spacing.md }}
          ListEmptyComponent={
            <EmptyState
              icon="package"
              title="No matching requests yet"
              body="Senders on this route haven't posted yet — check back soon."
            />
          }
          renderItem={({ item, index }) => (
            <FadeInUp index={index}>
              <Card
                onPress={() =>
                  navigation.navigate('PlaceBid', { requestId: item.id, routeId, title: item.title })
                }
              >
                <View style={styles.row}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Badge label={item.category} tone="neutral" />
                </View>
                <Text style={styles.meta}>
                  {item.originCity} → {item.destinationCity} · {item.weightKg}kg · by {item.deadlineDate}
                </Text>
                <View style={styles.senderRow}>
                  <Text style={styles.sender}>{item.senderName ?? 'Sender'}</Text>
                  <Icon name="star" size={12} color={colors.goldPrimary} weight="fill" />
                  <Text style={styles.sender}>{item.senderRating.toFixed(1)}</Text>
                </View>
                <Text style={styles.cta}>Place a bid →</Text>
              </Card>
            </FadeInUp>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX, paddingTop: spacing.md },
  title: { ...typography.titleL, color: colors.textPrimary },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  cardTitle: { ...typography.bodyL, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  meta: { ...typography.bodyM, color: colors.textSecondary, marginTop: spacing.xs },
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  sender: { ...typography.label, color: colors.textSecondary },
  cta: { ...typography.label, color: colors.skyBlue, marginTop: spacing.sm, fontWeight: '600' },
});
