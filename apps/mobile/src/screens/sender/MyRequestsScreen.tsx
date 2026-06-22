import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizing } from '@/theme';
import { Card, Badge, statusTone } from '@/components/Card';
import { EmptyState } from '@/components/widgets';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import type { DeliveryRequestDto } from '@carrymate/shared';
import type { RootStackParamList } from '@/navigation/types';

const EDITABLE = ['OPEN', 'BIDDING'];

export function MyRequestsScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const qc = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-requests'],
    queryFn: api.myRequests,
  });

  const del = useMutation({
    mutationFn: (id: string) => api.deleteRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-requests'] }),
    onError: (e) => Alert.alert('Could not delete', (e as Error).message),
  });

  const confirmDelete = (item: DeliveryRequestDto) =>
    Alert.alert('Delete request?', `“${item.title}” will be removed permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => del.mutate(item.id) },
    ]);

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
            <EmptyState icon="package" title="No requests yet" body="Use the Post tab to send your first item." />
          }
          renderItem={({ item }) => {
            const editable = EDITABLE.includes(item.status);
            return (
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

                {editable && (
                  <View style={styles.actions}>
                    <Pressable style={styles.action} onPress={() => nav.navigate('EditRequest', { request: item })}>
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
  title: { ...typography.titleL, color: colors.textPrimary },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  cardTitle: { ...typography.bodyL, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  meta: { ...typography.bodyM, color: colors.textSecondary, marginTop: spacing.xs },
  fee: { ...typography.label, color: colors.textSecondary, marginTop: spacing.sm },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.bgSecondary,
  },
  actionText: { ...typography.bodyM, fontWeight: '700', color: colors.skyBlue },
});
