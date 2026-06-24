import { View, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import type { ReactNode } from 'react';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { Pressable3D } from './ui';
import { Icon, type IconName } from './Icon';

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

const TONES: Record<Tone, { bg: string; fg: string; dot: string; border: string }> = {
  neutral: { bg: colors.bgSecondary, fg: colors.textSecondary, dot: colors.textHint, border: colors.borderLight },
  gold: { bg: colors.goldLight, fg: colors.goldPrimary, dot: colors.goldPrimary, border: colors.goldBorder },
  mint: { bg: colors.mintLight, fg: '#096438', dot: colors.mintPrimary, border: colors.mintBorder },
  amber: { bg: colors.cautionLight, fg: '#946A00', dot: colors.cautionAmber, border: '#FFE066' },
  danger: { bg: colors.dangerLight, fg: '#921010', dot: colors.dangerRed, border: '#FF9090' },
  sky: { bg: colors.skyLight, fg: '#185FA5', dot: colors.skyBlue, border: '#80BBED' },
};

/**
 * Status / trust pill. Backward compatible: `<Badge label tone />` still renders
 * the leading dot. Pass `icon` to swap the dot for a Phosphor glyph — this is the
 * canonical trust-badge anatomy from CLAUDE.md ([icon 13px] [label 11px/600]).
 */
export function Badge({
  label,
  tone = 'neutral',
  icon,
}: {
  label: string;
  tone?: Tone;
  icon?: IconName;
}) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg, borderColor: t.border }]}>
      {icon ? (
        <Icon name={icon} size={13} color={t.fg} weight="fill" />
      ) : (
        <View style={[styles.dot, { backgroundColor: t.dot }]} />
      )}
      <Text style={[styles.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

/**
 * Named trust badges — the spec's exact variants (KYC, flight, escrow, …). Use
 * these instead of raw <Badge> wherever a trust signal is shown so the icon,
 * label, and color stay identical across every screen.
 */
const TRUST = {
  kycVerified: { tone: 'gold', icon: 'identity', label: 'KYC verified' },
  flightConfirmed: { tone: 'gold', icon: 'trips', label: 'Flight confirmed' },
  trustedCarrier: { tone: 'sky', icon: 'verified', label: 'Trusted carrier' },
  escrowHeld: { tone: 'mint', icon: 'lock', label: 'Escrow secured' },
  delivered: { tone: 'mint', icon: 'check', label: 'Delivered' },
  prohibited: { tone: 'danger', icon: 'alert', label: 'Prohibited item' },
  inTransit: { tone: 'amber', icon: 'inTransit', label: 'In transit' },
} as const satisfies Record<string, { tone: Tone; icon: IconName; label: string }>;

export type TrustVariant = keyof typeof TRUST;

export function TrustBadge({ variant, label }: { variant: TrustVariant; label?: string }) {
  const v = TRUST[variant];
  return <Badge tone={v.tone} icon={v.icon} label={label ?? v.label} />;
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
    gap: 5,
    alignSelf: 'flex-start',
    borderRadius: radius.chip,
    borderWidth: 0.5,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { ...typography.caption, fontWeight: '700', letterSpacing: 0.2 },
});
