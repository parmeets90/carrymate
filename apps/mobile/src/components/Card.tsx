import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { colors, spacing, radius, typography, shadow } from '@/theme';

export function Card({
  children,
  onPress,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

type Tone = 'neutral' | 'gold' | 'mint' | 'amber' | 'danger' | 'sky';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.bgSecondary, fg: colors.textSecondary },
  gold: { bg: colors.goldLight, fg: colors.goldPrimary },
  mint: { bg: colors.mintLight, fg: '#096438' },
  amber: { bg: colors.cautionLight, fg: colors.cautionAmber },
  danger: { bg: colors.dangerLight, fg: '#921010' },
  sky: { bg: colors.skyLight, fg: '#185FA5' },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

/** Map a marketplace status to a badge tone. */
export function statusTone(status: string): Tone {
  switch (status) {
    case 'DELIVERED':
    case 'CONFIRMED':
    case 'COMPLETED':
    case 'ESCROW_HELD':
      return 'mint';
    case 'IN_TRANSIT':
    case 'MATCHED':
    case 'BIDDING':
    case 'PENDING':
    case 'PENDING_PAYMENT':
      return 'amber';
    case 'CANCELLED':
    case 'REJECTED':
    case 'DISPUTED':
      return 'danger';
    case 'OPEN':
      return 'sky';
    default:
      return 'neutral';
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.card,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    ...shadow,
  },
  pressed: { opacity: 0.92 },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.chip,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  badgeText: { ...typography.caption, fontWeight: '600' },
});
