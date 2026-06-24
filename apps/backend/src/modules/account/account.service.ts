import { CURRENT_TERMS_VERSION } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { storage } from '../../lib/storage';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { writeAudit } from '../../utils/audit';
import { isStorageConfigured } from '../../config/env';

/** Order states that are still "in flight" — deletion is blocked while any exist. */
const LIVE_ORDER_STATES = [
  'PENDING_PAYMENT',
  'ESCROW_HELD',
  'IN_TRANSIT',
  'DELIVERY_PROOF_UPLOADED',
  'PAYOUT_INITIATED',
  'DISPUTED',
] as const;

/**
 * DPDP — Right to access (data portability). Returns everything we hold that is
 * personal to this user, in a single machine-readable object. Excludes secrets
 * (password/hashes/tokens) and other people's PII (e.g. recipient details on a
 * request belong to the sender's counterparties, but the request itself is the
 * user's own data so it's included).
 */
export async function exportAccountData(userId: string): Promise<Record<string, unknown>> {
  const [user, kyc, routes, requests, bids, ordersSender, ordersTraveler, ratingsGiven, ratingsReceived, messages, notifications, bankAccount] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      prisma.kycDocument.findMany({ where: { userId } }),
      prisma.travelRoute.findMany({ where: { travelerId: userId } }),
      prisma.deliveryRequest.findMany({ where: { senderId: userId } }),
      prisma.bid.findMany({ where: { travelerId: userId } }),
      prisma.order.findMany({ where: { senderId: userId } }),
      prisma.order.findMany({ where: { travelerId: userId } }),
      prisma.rating.findMany({ where: { raterId: userId } }),
      prisma.rating.findMany({ where: { rateeId: userId } }),
      prisma.message.findMany({ where: { senderId: userId } }),
      prisma.notification.findMany({ where: { userId } }),
      prisma.bankAccount.findUnique({ where: { userId } }),
    ]);

  // Strip secrets from the profile before handing it back.
  const { passwordHash: _pw, fcmToken: _fcm, ...profile } = user;

  await writeAudit({ actorId: userId, action: 'DATA_EXPORTED', entityType: 'user', entityId: userId });

  return {
    exportedAt: new Date().toISOString(),
    profile,
    kycDocuments: kyc.map(({ docNumberHash: _h, ...d }) => d), // hash is a secret
    travelRoutes: routes,
    deliveryRequests: requests,
    bids,
    orders: { asSender: ordersSender, asTraveler: ordersTraveler },
    ratings: { given: ratingsGiven, received: ratingsReceived },
    messages,
    notifications,
    bankAccount: bankAccount
      ? { ...bankAccount, accountNumberHash: undefined } // never export the hash
      : null,
  };
}

/**
 * DPDP — Right to erasure, done as anonymize-and-retain (founder decision). We
 * scrub all personal data and purge KYC images, but keep order/payment rows in
 * anonymized form to honor escrow, refund, tax and dispute-audit obligations.
 * Blocked while the user has any in-flight order so money/cargo never strands.
 */
export async function deleteAccount(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('Account not found');
  if (user.status === 'DELETED') return; // idempotent
  if (user.role === 'ADMIN') {
    throw new AppError(403, 'ADMIN_DELETE_FORBIDDEN', 'Admin accounts cannot be self-deleted.');
  }

  const liveOrders = await prisma.order.count({
    where: {
      OR: [{ senderId: userId }, { travelerId: userId }],
      status: { in: [...LIVE_ORDER_STATES] },
    },
  });
  if (liveOrders > 0) {
    throw new AppError(
      409,
      'ACCOUNT_HAS_ACTIVE_ORDERS',
      'You have active deliveries. Please complete or resolve them before deleting your account.',
    );
  }

  // Purge raw KYC images from storage (best-effort) before dropping the rows.
  const docs = await prisma.kycDocument.findMany({ where: { userId }, select: { fileKey: true } });
  const keys = docs.map((d) => d.fileKey).filter((k): k is string => !!k);
  if (keys.length && isStorageConfigured) {
    await storage()
      .remove(keys)
      .catch((e) => logger.error(`[account] KYC purge failed for ${userId}: ${(e as Error).message}`));
  }

  await prisma.$transaction([
    prisma.kycDocument.deleteMany({ where: { userId } }),
    prisma.bankAccount.deleteMany({ where: { userId } }),
    prisma.refreshToken.deleteMany({ where: { userId } }), // end all sessions
    // Pull their open listings out of the marketplace.
    prisma.travelRoute.updateMany({ where: { travelerId: userId, status: 'ACTIVE' }, data: { status: 'CANCELLED' } }),
    prisma.deliveryRequest.updateMany({
      where: { senderId: userId, status: { in: ['OPEN', 'BIDDING', 'PENDING_REVIEW'] } },
      data: { status: 'CANCELLED' },
    }),
    // Anonymize the identity; keep the row for referential integrity + audit.
    prisma.user.update({
      where: { id: userId },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
        fullName: 'Deleted user',
        phone: null,
        email: null,
        firebaseUid: null,
        fcmToken: null,
        passwordHash: null,
        kycStatus: 'PENDING',
        kycFailureReason: null,
        phoneVerified: false,
      },
    }),
  ]);

  await writeAudit({ actorId: userId, action: 'ACCOUNT_DELETED', entityType: 'user', entityId: userId });
  logger.info(`[account] anonymized + deleted user ${userId}`);
}

/** Record (or re-record) the user's consent to the current Terms/Privacy version. */
export async function recordConsent(userId: string): Promise<{ consentVersion: string; consentedAt: string }> {
  const now = new Date();
  await prisma.user.update({
    where: { id: userId },
    data: { consentVersion: CURRENT_TERMS_VERSION, consentedAt: now },
  });
  return { consentVersion: CURRENT_TERMS_VERSION, consentedAt: now.toISOString() };
}
