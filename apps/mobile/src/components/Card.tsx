import { View, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import type { ReactNode } from 'react';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { Pressable3D } from './ui';

export function Card({
  children,
  onPress,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const content = <View style={[styles.card, style]}>{children}</View>;
  if (onPress) return <Pressable3D onPress={onPress}>{content}</Pressable3D>;
  return content;
}

type Tone = 'neutral' | 'gold' | 'mint' | 'amber' | 'danger' | 'sky';

const TONES: Record<Tone, { bg: string; fg: string; dot: string }> = {
  neutral: { bg: colors.bgSecondary, fg: colors.textSecondary, dot: colors.textHint },
  gold: { bg: colors.goldLight, fg: colors.goldPrimary, dot: colors.goldPrimary },
  mint: { bg: colors.mintLight, fg: '#096438', dot: colors.mintPrimary },
  amber: { bg: colors.cautionLight, fg: '#946A00', dot: colors.cautionAmber },
  danger: { bg: colors.dangerLight, fg: '#921010', dot: colors.dangerRed },
  sky: { bg: colors.skyLight, fg: '#185FA5', dot: colors.skyBlue },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <View style={[styles.dot, { backgroundColor: t.dot }]} />
      <Text style={[styles.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function statusTone(status: string): Tone {
  switch (status) {
    case 'DELIVERED':
    case 'CONFIRMED':
    case 'COMPLETED':
    case 'ESCROW_HELD':
    case 'VERIFIED':
      return 'mint';
    case 'IN_TRANSIT':
    case 'MATCHED':
    case 'BIDDING':
    case 'PENDING':
    case 'PENDING_PAYMENT':
    case 'IN_REVIEW':
      return 'amber';
    case 'CANCELLED':
    case 'REJECTED':
    case 'DISPUTED':
      return 'danger';
    case 'EXPIRED':
      return 'neutral';
    case 'OPEN':
      return 'sky';
    default:
      return 'neutral';
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.card + 4,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    ...shadows.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: radius.chip,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { ...typography.caption, fontWeight: '700', letterSpacing: 0.2 },
});
