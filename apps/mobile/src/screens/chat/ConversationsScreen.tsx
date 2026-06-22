import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, sizing, radius } from '@/theme';
import { Card } from '@/components/Card';
import { Avatar, EmptyState } from '@/components/widgets';
import { Pressable3D } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import type { ConversationSummary } from '@carrymate/shared';
import type { RootStackParamList } from '@/navigation/types';

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function ConversationsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['conversations'],
    queryFn: api.conversations,
    refetchInterval: 15_000,
  });
  const notif = useQuery({
    queryKey: ['notifUnread'],
    queryFn: api.unreadCount,
    refetchInterval: 20_000,
  });

  const renderItem = ({ item }: { item: ConversationSummary }) => (
    <Pressable3D
      onPress={() =>
        nav.navigate('Chat', {
          conversationId: item.id,
          title: item.requestTitle,
          counterparty: item.counterpartyName,
        })
      }
    >
      <Card style={styles.card}>
        <Avatar name={item.counterpartyName} size={48} />
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.counterpartyName ?? (item.role === 'SENDER' ? 'Traveler' : 'Sender')}
            </Text>
            <Text style={styles.time}>{timeAgo(item.lastMessageAt)}</Text>
          </View>
          <Text style={styles.request} numberOfLines={1}>
            {item.requestTitle}
          </Text>
          <View style={styles.lastRow}>
            <Text
              style={[styles.preview, item.unreadCount > 0 && styles.previewUnread]}
              numberOfLines={1}
            >
              {item.lastMessage ?? 'Say hello to coordinate the handover'}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </Pressable3D>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.heading}>Messages</Text>
        <Pressable onPress={() => nav.navigate('Notifications')} hitSlop={12} style={styles.bell}>
          <Icon name="bell" size={24} color={colors.textPrimary} />
          {(notif.data?.count ?? 0) > 0 && <View style={styles.bellDot} />}
        </Pressable>
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.skyBlue} style={{ marginTop: spacing['3xl'] }} />
          ) : (
            <EmptyState
              icon="chat"
              title="No conversations yet"
              body="Chat unlocks once a payment is held in escrow, so you can safely coordinate the handover."
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizing.screenPaddingX,
    paddingBottom: spacing.sm,
  },
  heading: { ...typography.display, color: colors.textPrimary },
  bell: { padding: spacing.xs },
  bellGlyph: { fontSize: 22 },
  bellDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.dangerRed,
    borderWidth: 1.5,
    borderColor: colors.bgApp,
  },
  list: { paddingHorizontal: sizing.screenPaddingX, paddingBottom: spacing['3xl'], gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { ...typography.bodyL, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  time: { ...typography.caption, color: colors.textHint, marginLeft: spacing.sm },
  request: { ...typography.caption, color: colors.skyBlue, fontWeight: '600', marginTop: 1 },
  lastRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: spacing.sm },
  preview: { ...typography.bodyM, color: colors.textSecondary, flex: 1 },
  previewUnread: { color: colors.textPrimary, fontWeight: '600' },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.skyBlue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { ...typography.caption, color: colors.white, fontWeight: '800' },
});
