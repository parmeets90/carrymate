import type { TrustProfile, TrustBadgeKind, TrustProfileReview } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';

const MAX_REVIEWS = 6;

/** "Arjun Sharma" → "A.S." · single name → "A." · empty → null. */
export function toInitials(fullName: string | null): string | null {
  if (!fullName) return null;
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  return parts.map((p) => `${p.charAt(0).toUpperCase()}.`).join('');
}

export function deriveBadges(input: {
  kycVerified: boolean;
  phoneVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  deliveriesCompleted: number;
  memberSince: Date;
}): TrustBadgeKind[] {
  const badges: TrustBadgeKind[] = [];
  if (input.kycVerified) badges.push('KYC_VERIFIED');
  if (input.phoneVerified) badges.push('PHONE_VERIFIED');
  // A carrier the platform trusts: a track record plus a strong rating.
  if (input.deliveriesCompleted >= 5 && input.ratingAvg >= 4.5) badges.push('TRUSTED_CARRIER');
  if (input.ratingCount >= 3 && input.ratingAvg >= 4.8) badges.push('TOP_RATED');
  const ageDays = (Date.now() - input.memberSince.getTime()) / 86_400_000;
  if (ageDays >= 90) badges.push('ESTABLISHED_MEMBER');
  return badges;
}

/**
 * The public trust profile for a user — what a counterparty is allowed to see
 * when vetting them. Carries only legitimacy signals + in-app history; never
 * phone, email, address, or KYC document data. Admin accounts are not exposed.
 */
export async function getTrustProfile(userId: string): Promise<TrustProfile> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === 'ADMIN' || user.status === 'BANNED') {
    throw new AppError(404, 'USER_NOT_FOUND', 'Profile not found');
  }

  const [
    deliveriesCompleted,
    tripsPosted,
    requestsCompleted,
    requestsPosted,
    ratings,
  ] = await Promise.all([
    prisma.order.count({ where: { travelerId: userId, status: 'COMPLETED' } }),
    prisma.travelRoute.count({ where: { travelerId: userId } }),
    prisma.order.count({ where: { senderId: userId, status: 'COMPLETED' } }),
    prisma.deliveryRequest.count({ where: { senderId: userId } }),
    prisma.rating.findMany({
      where: { rateeId: userId, comment: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: MAX_REVIEWS,
    }),
  ]);

  // Resolve reviewer initials in one batch (Rating has no User relation).
  const raterIds = [...new Set(ratings.map((r) => r.raterId))];
  const raters = raterIds.length
    ? await prisma.user.findMany({
        where: { id: { in: raterIds } },
        select: { id: true, fullName: true },
      })
    : [];
  const initialsById = new Map(raters.map((r) => [r.id, toInitials(r.fullName)]));

  const reviews: TrustProfileReview[] = ratings.map((r) => ({
    stars: r.stars,
    comment: r.comment,
    raterInitials: initialsById.get(r.raterId) ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  const ratingAvg = Number(user.ratingAvg);
  const kycVerified = user.kycStatus === 'VERIFIED';

  return {
    id: user.id,
    fullName: user.fullName,
    role: user.role,
    memberSince: user.createdAt.toISOString(),
    kycVerified,
    phoneVerified: user.phoneVerified,
    ratingAvg,
    ratingCount: user.ratingCount,
    badges: deriveBadges({
      kycVerified,
      phoneVerified: user.phoneVerified,
      ratingAvg,
      ratingCount: user.ratingCount,
      deliveriesCompleted,
      memberSince: user.createdAt,
    }),
    stats: { deliveriesCompleted, tripsPosted, requestsCompleted, requestsPosted },
    reviews,
  };
}
