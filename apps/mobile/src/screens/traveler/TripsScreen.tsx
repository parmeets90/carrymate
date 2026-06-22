import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizing } from '@/theme';
import { Card, Badge, statusTone } from '@/components/Card';
import { EmptyState } from '@/components/widgets';
import { api } from '@/lib/api';
import type { RootStackParamList } from '@/navigation/types';

export function TripsScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-routes'],
    queryFn: api.myRoutes,
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My trips</Text>
        <Pressable onPress={() => nav.navigate('AddRoute')} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add trip</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.skyBlue} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(r) => r.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ paddingVertical: spacing.lg, gap: spacing.md }}
          ListEmptyComponent={
            <EmptyState icon="✈️" title="No trips yet" body="Add a flight to start carrying items." />
          }
          renderItem={({ item }) => {
            const remaining = item.capacityKg - item.capacityUsedKg;
            return (
              <Card onPress={() => nav.navigate('Browse', { routeId: item.id })}>
                <View style={styles.row}>
                  <Text style={styles.cardTitle}>
                    {item.originAirport} → {item.destinationAirport}
                  </Text>
                  <Badge label={item.status} tone={statusTone(item.status)} />
                </View>
                <Text style={styles.meta}>
                  {item.departureDate} · {item.flightNumber ?? 'flight'} · {remaining.toFixed(1)}kg free
                </Text>
                <Text style={styles.cta}>Browse matching requests →</Text>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp, paddingHorizontal: sizing.screenPaddingX },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.titleL, color: colors.textPrimary },
  addBtn: {
    backgroundColor: colors.skyLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
  },
  addBtnText: { ...typography.label, color: '#185FA5', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...typography.bodyL, fontWeight: '700', color: colors.textPrimary },
  meta: { ...typography.bodyM, color: colors.textSecondary, marginTop: spacing.xs },
  cta: { ...typography.label, color: colors.skyBlue, marginTop: spacing.sm, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: spacing['3xl'], gap: spacing.xs },
  emptyTitle: { ...typography.titleM, color: colors.textPrimary },
  emptyBody: { ...typography.bodyM, color: colors.textSecondary },
});
