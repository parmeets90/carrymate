import { View, Text, StyleSheet, FlatList } from 'react-native';
import { BrandLoader } from '@/components/BrandLoader';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, sizing } from '@/theme';
import { Card, Badge } from '@/components/Card';
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
            <Text style={styles.empty}>No matching requests right now. Check back soon.</Text>
          }
          renderItem={({ item }) => (
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
              <Text style={styles.sender}>
                {item.senderName ?? 'Sender'} · ★ {item.senderRating.toFixed(1)}
              </Text>
              <Text style={styles.cta}>Place a bid →</Text>
            </Card>
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
  sender: { ...typography.label, color: colors.textSecondary, marginTop: spacing.sm },
  cta: { ...typography.label, color: colors.skyBlue, marginTop: spacing.sm, fontWeight: '600' },
  empty: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', marginTop: spacing['3xl'] },
});
