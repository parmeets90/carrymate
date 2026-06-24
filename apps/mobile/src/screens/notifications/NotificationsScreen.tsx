import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { BrandLoader } from '@/components/BrandLoader';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, spacing, typography, sizing, radius } from '@/theme';
import { EmptyState } from '@/components/widgets';
import { FadeInUp } from '@/components/anim';
import { Pressable3D } from '@/components/ui';
import { Icon, type IconName } from '@/components/Icon';
import { api } from '@/lib/api';
import type { NotificationDto } from '@carrymate/shared';
import type { RootStackParamList } from '@/navigation/types';

const ICONS: Record<string, { name: IconName; color: string }> = {
  BID_RECEIVED: { name: 'bids', color: colors.skyBlue },
  BID_ACCEPTED: { name: 'handshake', color: colors.mintPrimary },
  ORDER_PAID: { name: 'lock', color: colors.mintPrimary },
  OPEN_BOX_DONE: { name: 'package', color: colors.cautionAmber },
  IN_TRANSIT: { name: 'inTransit', color: colors.cautionAmber },
  DELIVERED: { name: 'location', color: colors.mintPrimary },
  ESCROW_RELEASED: { name: 'wallet', color: colors.mintPrimary },
  DISPUTE_OPENED: { name: 'warning', color: colors.dangerRed },
  DISPUTE_RESOLVED: { name: 'check', color: colors.mintPrimary },
  KYC_VERIFIED: { name: 'verified', color: colors.goldPrimary },
  KYC_REJECTED: { name: 'cross', color: colors.dangerRed },
  NEW_MESSAGE: { name: 'chat', color: colors.skyBlue },
  RATING_RECEIVED: { name: 'star', color: colors.goldPrimary },
  SYSTEM: { name: 'bell', color: colors.textSecondary },
};

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const qc = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['notifications'] });
    qc.invalidateQueries({ queryKey: ['notifUnread'] });
  };
  const markRead = useMutation({ mutationFn: (id: string) => api.markNotificationRead(id), onSuccess: invalidate });
  const markAll = useMutation({ mutationFn: () => api.markAllNotificationsRead(), onSuccess: invalidate });

  const open = (n: NotificationDto) => {
    if (!n.read) markRead.mutate(n.id);
    const convId = n.data?.conversationId as string | undefined;
    if (convId) nav.navigate('ChatThread', { conversationId: convId, title: 'Chat' });
  };

  const renderItem = ({ item, index }: { item: NotificationDto; index: number }) => (
    <FadeInUp index={index}>
    <Pressable3D onPress={() => open(item)}>
      <View style={[styles.card, !item.read && styles.cardUnread]}>
        <View style={styles.iconWrap}>
          <Icon {...(ICONS[item.type] ?? { name: 'bell', color: colors.textSecondary })} size={20} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        </View>
      </View>
    </Pressable3D>
    </FadeInUp>
  );

  const hasUnread = (data?.items ?? []).some((n) => !n.read);

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(n) => n.id}
        renderItem={renderItem}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          hasUnread ? (
            <Pressable onPress={() => markAll.mutate()} style={styles.markAll}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </Pressable>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <BrandLoader style={{ marginTop: spacing['3xl'] }} />
          ) : (
            <EmptyState icon="bell" title="You're all caught up" body="Updates about your bids, orders and deliveries will appear here." />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp },
  list: { padding: sizing.screenPaddingX, paddingBottom: spacing['3xl'], gap: spacing.sm },
  markAll: { alignSelf: 'flex-end', paddingVertical: spacing.xs },
  markAllText: { ...typography.bodyM, color: colors.skyBlue, fontWeight: '700' },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.card + 4,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    padding: spacing.lg,
  },
  cardUnread: { backgroundColor: colors.skyLight, borderColor: '#CFE5F8' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.bodyL, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.skyBlue },
  body: { ...typography.bodyM, color: colors.textSecondary, marginTop: 2, lineHeight: 20 },
  time: { ...typography.caption, color: colors.textHint, marginTop: 6 },
});
