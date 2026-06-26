import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, radius } from '@/theme';
import { Screen } from '@/components/Screen';
import { Card, Badge, TrustBadge, type TrustVariant } from '@/components/Card';
import { Avatar, EmptyState } from '@/components/widgets';
import { FadeInUp } from '@/components/anim';
import { Icon, type IconName } from '@/components/Icon';
import { BrandLoader } from '@/components/BrandLoader';
import { api } from '@/lib/api';
import type { TrustBadgeKind, TrustProfile, TrustProfileReview } from '@carrymate/shared';
import type { ScreenProps } from '@/navigation/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function memberSinceLabel(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const roleLabel: Record<string, string> = {
  SENDER: 'Sender',
  TRAVELER: 'Traveler',
};

/** A platform-issued badge → its visual treatment. Trust-stack only, no PII. */
function renderBadge(kind: TrustBadgeKind) {
  switch (kind) {
    case 'KYC_VERIFIED':
      return <TrustBadge key={kind} variant={'kycVerified' satisfies TrustVariant} />;
    case 'TRUSTED_CARRIER':
      return <TrustBadge key={kind} variant={'trustedCarrier' satisfies TrustVariant} />;
    case 'PHONE_VERIFIED':
      return <Badge key={kind} tone="mint" icon="check" label="Phone verified" />;
    case 'TOP_RATED':
      return <Badge key={kind} tone="gold" icon="star" label="Top rated" />;
    case 'ESTABLISHED_MEMBER':
      return <Badge key={kind} tone="sky" icon="verified" label="Established member" />;
    default:
      return null;
  }
}

function Stat({ icon, value, label }: { icon: IconName; value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={18} color={colors.primary} weight="fill" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/** A derived, presentational trust score (0–100) from verified signals + history. */
function computeTrust(p: TrustProfile): { score: number; label: string; color: string } {
  const has = (k: TrustBadgeKind) => p.badges.includes(k);
  const completed = p.stats.deliveriesCompleted + p.stats.requestsCompleted;
  let score = 0;
  if (has('KYC_VERIFIED')) score += 35;
  if (has('PHONE_VERIFIED')) score += 15;
  if (p.ratingCount > 0) score += Math.round((p.ratingAvg / 5) * 25);
  score += Math.min(15, completed * 3);
  if (has('ESTABLISHED_MEMBER')) score += 10;
  score = Math.min(100, score);
  if (score >= 80) return { score, label: 'Highly trusted', color: colors.mintPrimary };
  if (score >= 55) return { score, label: 'Trusted', color: colors.primary };
  if (score >= 30) return { score, label: 'Building trust', color: colors.warningText };
  return { score, label: 'New member', color: colors.inkTertiary };
}

/** A single verified-facet row with a satisfied/unsatisfied state. */
function Facet({ ok, label, icon }: { ok: boolean; label: string; icon: IconName }) {
  return (
    <View style={styles.facet}>
      <View style={[styles.facetIcon, { backgroundColor: ok ? colors.successSurface : colors.surfaceSunken }]}>
        <Icon name={ok ? icon : 'cross'} size={15} color={ok ? colors.mintPrimary : colors.inkTertiary} weight="fill" />
      </View>
      <Text style={[styles.facetLabel, !ok && { color: colors.inkTertiary }]}>{label}</Text>
      {ok ? <Icon name="check" size={15} color={colors.mintPrimary} weight="bold" /> : null}
    </View>
  );
}

function Review({ review }: { review: TrustProfileReview }) {
  return (
    <View style={styles.review}>
      <View style={styles.reviewHead}>
        <View style={styles.stars}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              key={i}
              name="star"
              size={13}
              color={i < review.stars ? colors.goldPrimary : colors.borderLight}
              weight="fill"
            />
          ))}
        </View>
        <Text style={styles.reviewBy}>{review.raterInitials ?? 'Verified user'}</Text>
      </View>
      {review.comment ? <Text style={styles.reviewText}>“{review.comment}”</Text> : null}
    </View>
  );
}

export function UserProfileScreen({ route }: ScreenProps<'UserProfile'>) {
  const { userId, name } = route.params;
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => api.userProfile(userId),
  });

  if (isLoading) {
    return (
      <Screen>
        <BrandLoader style={{ marginTop: spacing['3xl'] }} />
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <EmptyState
          icon="warning"
          title="Profile unavailable"
          body="We couldn't load this person's profile. Please try again."
        />
      </Screen>
    );
  }

  const p: TrustProfile = data;
  // A user can switch roles over time, so show a stat tile when it's relevant to
  // their current role OR they have history on that side.
  const s = p.stats;
  const showTravelerStats = p.role === 'TRAVELER' || s.deliveriesCompleted > 0 || s.tripsPosted > 0;
  const showSenderStats = p.role === 'SENDER' || s.requestsPosted > 0 || s.requestsCompleted > 0;
  const rated = p.ratingCount > 0;
  const trust = computeTrust(p);

  return (
    <Screen scroll>
      {/* Identity header */}
      <Card style={styles.headerCard}>
        <Avatar name={p.fullName ?? name} size={72} />
        <Text style={styles.name}>{p.fullName ?? name ?? 'CarryMate user'}</Text>
        <Text style={styles.role}>{roleLabel[p.role] ?? 'Member'}</Text>
        <View style={styles.ratingRow}>
          {rated ? (
            <>
              <Icon name="star" size={15} color={colors.goldPrimary} weight="fill" />
              <Text style={styles.ratingText}>{p.ratingAvg.toFixed(1)}</Text>
              <Text style={styles.ratingMeta}>
                · {p.ratingCount} rating{p.ratingCount === 1 ? '' : 's'}
              </Text>
            </>
          ) : (
            <Text style={styles.ratingMeta}>No ratings yet</Text>
          )}
        </View>
        <Text style={styles.memberSince}>Member since {memberSinceLabel(p.memberSince)}</Text>

        {p.badges.length > 0 && <View style={styles.badges}>{p.badges.map(renderBadge)}</View>}
      </Card>

      {/* Trust dashboard — derived score + verified facets */}
      <Card style={{ gap: spacing.md }}>
        <View style={styles.trustHead}>
          <Text style={styles.trustLabel}>TRUST SCORE</Text>
          <Text style={[styles.trustScore, { color: trust.color }]}>{trust.score}</Text>
        </View>
        <View style={styles.trustTrack}>
          <View style={[styles.trustFill, { width: `${trust.score}%`, backgroundColor: trust.color }]} />
        </View>
        <Text style={[styles.trustVerdict, { color: trust.color }]}>{trust.label}</Text>
        <View style={styles.facets}>
          <Facet ok={p.badges.includes('KYC_VERIFIED')} label="Identity verified" icon="identity" />
          <Facet ok={p.badges.includes('PHONE_VERIFIED')} label="Phone verified" icon="check" />
          {p.role === 'TRAVELER' && (
            <Facet ok={p.badges.includes('TRUSTED_CARRIER')} label="Trusted carrier" icon="verified" />
          )}
        </View>
      </Card>

      {/* In-app track record */}
      <Text style={styles.sectionTitle}>Track record</Text>
      <Card>
        <View style={styles.statGrid}>
          {showTravelerStats && <Stat icon="check" value={s.deliveriesCompleted} label="Deliveries" />}
          {showTravelerStats && <Stat icon="trips" value={s.tripsPosted} label="Trips posted" />}
          {showSenderStats && <Stat icon="package" value={s.requestsPosted} label="Requests" />}
          {showSenderStats && <Stat icon="handshake" value={s.requestsCompleted} label="Completed" />}
        </View>
      </Card>

      {/* Reviews */}
      <Text style={styles.sectionTitle}>Reviews</Text>
      {p.reviews.length > 0 ? (
        <Card>
          {p.reviews.map((r, i) => (
            <FadeInUp key={i} index={i}>
              <View style={i > 0 ? styles.reviewDivider : undefined}>
                <Review review={r} />
              </View>
            </FadeInUp>
          ))}
        </Card>
      ) : (
        <Card>
          <Text style={styles.noReviews}>No written reviews yet.</Text>
        </Card>
      )}

      {/* Privacy assurance */}
      <View style={styles.privacy}>
        <Icon name="lock" size={14} color={colors.textSecondary} weight="fill" />
        <Text style={styles.privacyText}>
          For everyone's safety, we never show personal contact details — only verified trust
          signals and in-app history.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: { alignItems: 'center', gap: 6, paddingVertical: spacing.xl },
  name: { ...typography.titleL, color: colors.textPrimary, marginTop: spacing.sm },
  role: { ...typography.bodyM, color: colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { ...typography.bodyL, fontWeight: '700', color: colors.textPrimary },
  ratingMeta: { ...typography.bodyM, color: colors.textSecondary },
  memberSince: { ...typography.caption, color: colors.textHint, marginTop: 2 },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.sm,
    marginBottom: -spacing.xs,
  },
  trustHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  trustLabel: { ...typography.label, color: colors.inkSecondary, letterSpacing: 0.8 },
  trustScore: { ...typography.numericLg, fontSize: 26 },
  trustTrack: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceSunken, overflow: 'hidden' },
  trustFill: { height: 8, borderRadius: 4 },
  trustVerdict: { ...typography.bodyM, fontWeight: '700', marginTop: -spacing.xs },
  facets: { gap: spacing.sm, marginTop: spacing.xs },
  facet: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  facetIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  facetLabel: { ...typography.bodyM, color: colors.ink, fontWeight: '600', flex: 1 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', rowGap: spacing.lg },
  stat: { alignItems: 'center', gap: 3, minWidth: 72 },
  statValue: { ...typography.titleL, color: colors.textPrimary, fontWeight: '700' },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  review: { gap: 6 },
  reviewDivider: {
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  reviewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stars: { flexDirection: 'row', gap: 1 },
  reviewBy: { ...typography.caption, color: colors.textHint, fontWeight: '600' },
  reviewText: { ...typography.bodyM, color: colors.textPrimary, fontStyle: 'italic', lineHeight: 20 },
  noReviews: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center' },
  privacy: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.input,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  privacyText: { ...typography.caption, color: colors.textSecondary, flex: 1, lineHeight: 16 },
});
