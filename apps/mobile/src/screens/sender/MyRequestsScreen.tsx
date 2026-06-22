import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizing } from '@/theme';
import { Card, Badge, statusTone } from '@/components/Card';
import { EmptyState } from '@/components/widgets';
import { api } from '@/lib/api';
import type { RootStackParamList } from '@/navigation/types';

export function MyRequestsScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-requests'],
    queryFn: api.myRequests,
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.title}>My requests</Text>

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
            <EmptyState icon="📦" title="No requests yet" body="Use the Post tab to send your first item." />
          }
          renderItem={({ item }) => (
            <Card onPress={() => nav.navigate('RequestDetail', { requestId: item.id })}>
              <View style={styles.row}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Badge label={item.status} tone={statusTone(item.status)} />
              </View>
              <Text style={styles.meta}>
                {item.originCity} → {item.destinationCity} · {item.weightKg}kg · by {item.deadlineDate}
              </Text>
              <Text style={styles.fee}>Declared ₹{item.declaredValueInr.toLocaleString('en-IN')}</Text>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  cardTitle: { ...typography.bodyL, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  meta: { ...typography.bodyM, color: colors.textSecondary, marginTop: spacing.xs },
  fee: { ...typography.label, color: colors.textSecondary, marginTop: spacing.sm },
  empty: { alignItems: 'center', marginTop: spacing['3xl'], gap: spacing.xs },
  emptyTitle: { ...typography.titleM, color: colors.textPrimary },
  emptyBody: { ...typography.bodyM, color: colors.textSecondary },
});
