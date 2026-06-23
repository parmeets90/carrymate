import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { BrandLoader } from '@/components/BrandLoader';
import { Alert } from '@/components/AlertHost';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizing } from '@/theme';
import { Card, Badge, statusTone } from '@/components/Card';
import { EmptyState } from '@/components/widgets';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import type { TravelRouteDto } from '@carrymate/shared';
import type { RootStackParamList } from '@/navigation/types';

export function TripsScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const qc = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-routes'],
    queryFn: api.myRoutes,
  });

  const del = useMutation({
    mutationFn: (id: string) => api.deleteRoute(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-routes'] }),
    onError: (e) => Alert.alert('Could not delete', (e as Error).message),
  });

  const confirmDelete = (item: TravelRouteDto) =>
    Alert.alert('Delete trip?', `${item.originAirport} → ${item.destinationAirport} will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => del.mutate(item.id) },
    ]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My trips</Text>
        <Pressable onPress={() => nav.navigate('AddRoute')} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add trip</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <BrandLoader style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(r) => r.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ paddingVertical: spacing.lg, gap: spacing.md }}
          ListEmptyComponent={
            <EmptyState icon="trips" title="No trips yet" body="Add a flight to start carrying items." />
          }
          renderItem={({ item }) => {
            const remaining = item.capacityKg - item.capacityUsedKg;
            const manageable = item.status === 'ACTIVE' && item.capacityUsedKg === 0;
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

                {manageable && (
                  <View style={styles.actions}>
                    <Pressable style={styles.action} onPress={() => nav.navigate('AddRoute', { route: item })}>
                      <Icon name="edit" size={16} color={colors.skyBlue} />
                      <Text style={styles.actionText}>Edit</Text>
                    </Pressable>
                    <Pressable style={styles.action} onPress={() => confirmDelete(item)}>
                      <Icon name="delete" size={16} color={colors.dangerRed} />
                      <Text style={[styles.actionText, { color: colors.dangerRed }]}>Delete</Text>
                    </Pressable>
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
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 0.5, borderTopColor: colors.borderLight },
  action: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm, borderRadius: 8, backgroundColor: colors.bgSecondary },
  actionText: { ...typography.bodyM, fontWeight: '700', color: colors.skyBlue },
  empty: { alignItems: 'center', marginTop: spacing['3xl'], gap: spacing.xs },
  emptyTitle: { ...typography.titleM, color: colors.textPrimary },
  emptyBody: { ...typography.bodyM, color: colors.textSecondary },
});
