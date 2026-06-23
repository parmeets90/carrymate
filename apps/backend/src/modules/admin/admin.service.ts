import type { Prisma } from '@prisma/client';
import type {
  AdminKycReviewItem,
  AdminMetrics,
  AdminQueueItem,
  SlaLevel,
  PublicUser,
  Paginated,
  DeliveryRequestSummary,
} from '@carrymate/shared';
import { NotificationType, REQUEST_EXPIRY_DAYS } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { writeAudit } from '../../utils/audit';
import { createNotification } from '../notifications/notifications.service';
import { toPublicUser } from '../users/user.serializer';
import { toKycDocumentDto } from '../kyc/kyc.serializer';
import { toRequestSummary } from '../marketplace/serializers';

/** Users awaiting KYC review, with their submitted documents. */
export async function listPendingKyc(): Promise<AdminKycReviewItem[]> {
  const users = await prisma.user.findMany({
    where: { kycStatus: 'IN_REVIEW' },
    orderBy: { updatedAt: 'asc' },
    include: { kycDocuments: { orderBy: { createdAt: 'asc' } } },
  });

  return users.map(buildReviewItem);
}

/** Assemble a KYC review item with IDFY context (scores + failure reason). */
function buildReviewItem(
  u: Prisma.UserGetPayload<{ include: { kycDocuments: true } }>,
): AdminKycReviewItem {
  const selfie = u.kycDocuments.find((d) => d.docType === 'SELFIE');
  const meta = (selfie?.meta ?? null) as { faceMatchScore?: number; ocrConfidence?: number } | null;
  return {
    user: toPublicUser(u),
    documents: u.kycDocuments.map(toKycDocumentDto),
    failureReason: u.kycFailureReason ?? null,
    faceMatchScore: meta?.faceMatchScore ?? null,
    ocrConfidence: meta?.ocrConfidence ?? null,
  };
}

export async function approveKyc(userId: string, adminId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found');

  await prisma.$transaction([
    prisma.kycDocument.updateMany({
      where: { userId },
      data: { status: 'APPROVED', reviewedById: adminId, reviewedAt: new Date(), rejectReason: null },
    }),
    prisma.user.update({ where: { id: userId }, data: { kycStatus: 'VERIFIED' } }),
  ]);
  await writeAudit({ actorId: adminId, action: 'KYC_APPROVED', entityType: 'user', entityId: userId });
  await createNotification({
    userId,
    type: NotificationType.KYC_VERIFIED,
    title: 'Identity verified ✅',
    body: 'Your KYC is approved. You can now send and carry items on CarryMate.',
  });
}

export async function rejectKyc(userId: string, adminId: string, reason: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found');

  await prisma.$transaction([
    prisma.kycDocument.updateMany({
      where: { userId },
      data: { status: 'REJECTED', reviewedById: adminId, reviewedAt: new Date(), rejectReason: reason },
    }),
    prisma.user.update({ where: { id: userId }, data: { kycStatus: 'REJECTED' } }),
  ]);
  await writeAudit({ actorId: adminId, action: 'KYC_REJECTED', entityType: 'user', entityId: userId, meta: { reason } });
  await createNotification({
    userId,
    type: NotificationType.KYC_REJECTED,
    title: 'KYC needs attention',
    body: `Your KYC was not approved: ${reason}. Please re-submit your documents.`,
  });
}

/** Paginated user search by name/phone/email. */
export async function listUsers(query: string, page: number, pageSize: number): Promise<Paginated<PublicUser>> {
  const where: Prisma.UserWhereInput = query
    ? {
        OR: [
          { phone: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { items: items.map(toPublicUser), page, pageSize, total };
}

export async function getUserDetail(userId: string): Promise<AdminKycReviewItem> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { kycDocuments: { orderBy: { createdAt: 'asc' } } },
  });
  if (!user) throw AppError.notFound('User not found');
  return buildReviewItem(user);
}

/** Marketplace request monitor for ops. */
export async function listRequests(
  status: string | undefined,
  page: number,
  pageSize: number,
): Promise<Paginated<DeliveryRequestSummary>> {
  const where: Prisma.DeliveryRequestWhereInput = status
    ? { status: status as Prisma.EnumRequestStatusFilter['equals'] }
    : {};

  const [items, total] = await Promise.all([
    prisma.deliveryRequest.findMany({
      where,
      include: { sender: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.deliveryRequest.count({ where }),
  ]);

  return { items: items.map(toRequestSummary), page, pageSize, total };
}

/** Force-cancel a stale or problematic request. */
export async function forceExpireRequest(requestId: string): Promise<void> {
  const request = await prisma.deliveryRequest.findUnique({ where: { id: requestId } });
  if (!request) throw AppError.notFound('Request not found');
  await prisma.deliveryRequest.update({
    where: { id: requestId },
    data: { status: 'CANCELLED' },
  });
}

/** Approve a prohibited-flagged request (Challenge 08) → goes live. */
export async function approveReviewRequest(requestId: string, adminId: string): Promise<void> {
  const request = await prisma.deliveryRequest.findUnique({ where: { id: requestId } });
  if (!request) throw AppError.notFound('Request not found');
  if (request.status !== 'PENDING_REVIEW') {
    throw new AppError(409, 'NOT_IN_REVIEW', 'This request is not awaiting review.');
  }
  await prisma.deliveryRequest.update({
    where: { id: requestId },
    data: {
      status: 'OPEN',
      prohibitedCheckPassed: true,
      expiresAt: new Date(Date.now() + REQUEST_EXPIRY_DAYS * 86_400_000),
    },
  });
  await createNotification({
    userId: request.senderId,
    type: NotificationType.SYSTEM,
    title: 'Request approved',
    body: `“${request.title}” passed review and is now live for travelers.`,
    data: { requestId },
  });
}

export async function setUserStatus(
  userId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED',
  adminId?: string,
): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found');
  if (user.role === 'ADMIN') throw AppError.forbidden('Cannot change an admin account status');

  const updated = await prisma.user.update({ where: { id: userId }, data: { status } });

  // Revoking access on suspend/ban: drop active refresh tokens.
  if (status !== 'ACTIVE') {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  await writeAudit({
    actorId: adminId ?? null,
    action: 'USER_STATUS_CHANGED',
    entityType: 'user',
    entityId: userId,
    meta: { from: user.status, to: status },
  });

  return toPublicUser(updated);
}

/** Ops dashboard KPIs (North-Star + funnel + trust health). */
export async function getMetrics(): Promise<AdminMetrics> {
  const [
    users,
    kycBacklog,
    suspended,
    requestsTotal,
    requestsMatched,
    ordersTotal,
    escrowHeld,
    completed,
    fraudHolds,
    disputesOpen,
    gmv,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
    prisma.user.count({ where: { kycStatus: 'IN_REVIEW' } }),
    prisma.user.count({ where: { status: { in: ['SUSPENDED', 'BANNED'] } } }),
    prisma.deliveryRequest.count(),
    prisma.deliveryRequest.count({
      where: { status: { in: ['MATCHED', 'IN_TRANSIT', 'DELIVERED', 'CONFIRMED'] } },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'ESCROW_HELD' } }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.order.count({ where: { fraudHold: true } }),
    prisma.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
    prisma.order.aggregate({ where: { status: 'COMPLETED' }, _sum: { amountInr: true } }),
  ]);

  const matchRate = requestsTotal ? Math.round((requestsMatched / requestsTotal) * 100) : 0;
  const disputeRate = ordersTotal ? Math.round((disputesOpen / ordersTotal) * 100) : 0;

  // SLA stats (computed in JS over recent rows — no portable date-diff in Prisma).
  const [reviewedDocs, resolvedDisputes, openDisputes] = await Promise.all([
    prisma.kycDocument.findMany({
      where: { reviewedAt: { not: null } },
      select: { createdAt: true, reviewedAt: true },
      orderBy: { reviewedAt: 'desc' },
      take: 200,
    }),
    prisma.dispute.findMany({
      where: { resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
      orderBy: { resolvedAt: 'desc' },
      take: 200,
    }),
    prisma.dispute.findMany({
      where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 1,
    }),
  ]);

  const avg = (xs: number[]): number =>
    xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
  const avgKycReviewMins = avg(
    reviewedDocs.map((d) => (d.reviewedAt!.getTime() - d.createdAt.getTime()) / 60_000),
  );
  const avgDisputeResolutionHours = avg(
    resolvedDisputes.map((d) => (d.resolvedAt!.getTime() - d.createdAt.getTime()) / 3_600_000),
  );
  const oldestOpenDisputeHours = openDisputes.length
    ? Math.round((Date.now() - openDisputes[0]!.createdAt.getTime()) / 3_600_000)
    : 0;

  return {
    users,
    kycBacklog,
    suspended,
    requestsTotal,
    requestsMatched,
    matchRate,
    ordersTotal,
    escrowHeld,
    completed,
    gmvInr: gmv._sum.amountInr ?? 0,
    disputesOpen,
    disputeRate,
    fraudHolds,
    avgKycReviewMins,
    avgDisputeResolutionHours,
    oldestOpenDisputeHours,
  };
}

// ── Unified admin work queue (B1) ──────────────────────────────

function hoursSince(d: Date): number {
  return (Date.now() - d.getTime()) / 3_600_000;
}
function slaOf(ageHours: number, amber: number, red: number): SlaLevel {
  return ageHours >= red ? 'red' : ageHours >= amber ? 'amber' : 'green';
}

/**
 * One prioritized list of everything needing a human, with SLA color per item
 * (Challenge 06). Priority across kinds: DISPUTE > FRAUD > KYC > PAYOUT; within a
 * kind, oldest first.
 */
export async function getAdminQueue(): Promise<AdminQueueItem[]> {
  const [disputes, fraudOrders, reviewRequests, kycUsers, failedPayouts] = await Promise.all([
    prisma.dispute.findMany({
      where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      include: { order: { include: { request: true } } },
    }),
    prisma.order.findMany({
      where: { fraudHold: true },
      include: { request: true },
    }),
    prisma.deliveryRequest.findMany({
      where: { status: 'PENDING_REVIEW' },
      select: { id: true, title: true, category: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { kycStatus: 'IN_REVIEW' },
      select: { id: true, fullName: true, kycFailureReason: true, kycSubmittedAt: true, updatedAt: true },
    }),
    prisma.order.findMany({
      where: { payoutStatus: 'FAILED' },
      include: { traveler: true, request: true },
    }),
  ]);

  const items: AdminQueueItem[] = [];

  for (const d of disputes) {
    const created = d.createdAt;
    const ageHours = hoursSince(created);
    items.push({
      kind: 'DISPUTE',
      id: d.id,
      title: `Dispute · ${d.order.request.title}`,
      subtitle: d.reason.replace(/_/g, ' ').toLowerCase(),
      createdAt: created.toISOString(),
      ageHours: Math.round(ageHours),
      sla: slaOf(ageHours, 12, 24),
      priority: 0,
      link: '/disputes',
    });
  }

  for (const o of fraudOrders) {
    const ageHours = hoursSince(o.createdAt);
    items.push({
      kind: 'FRAUD',
      id: o.id,
      title: `Fraud hold · ${o.request.title}`,
      subtitle: `risk ${o.riskScore} · ${o.riskFactors.join(', ').toLowerCase() || 'flagged'}`,
      createdAt: o.createdAt.toISOString(),
      ageHours: Math.round(ageHours),
      sla: slaOf(ageHours, 2, 12),
      priority: 1,
      link: '/risk',
    });
  }

  for (const r of reviewRequests) {
    const ageHours = hoursSince(r.createdAt);
    items.push({
      kind: 'REVIEW',
      id: r.id,
      title: `Item review · ${r.title}`,
      subtitle: `flagged · ${r.category.toLowerCase()}`,
      createdAt: r.createdAt.toISOString(),
      ageHours: Math.round(ageHours),
      sla: slaOf(ageHours, 2, 12),
      priority: 2,
      link: '/requests',
    });
  }

  for (const u of kycUsers) {
    const created = u.kycSubmittedAt ?? u.updatedAt;
    const ageHours = hoursSince(created);
    items.push({
      kind: 'KYC',
      id: u.id,
      title: `KYC · ${u.fullName ?? 'Unnamed user'}`,
      subtitle: u.kycFailureReason ?? 'manual review',
      createdAt: created.toISOString(),
      ageHours: Math.round(ageHours),
      sla: slaOf(ageHours, 1, 2),
      priority: 3,
      link: '/kyc',
    });
  }

  for (const o of failedPayouts) {
    const created = o.payoutInitiatedAt ?? o.createdAt;
    const ageHours = hoursSince(created);
    items.push({
      kind: 'PAYOUT',
      id: o.id,
      title: `Payout failed · ${o.traveler.fullName ?? 'Traveler'}`,
      subtitle: `₹${o.payoutInr.toLocaleString('en-IN')} · ${o.request.title}`,
      createdAt: created.toISOString(),
      ageHours: Math.round(ageHours),
      sla: slaOf(ageHours, 2, 12),
      priority: 4,
      link: '/payouts',
    });
  }

  // Priority across kinds, then oldest first within a kind.
  return items.sort((a, b) => a.priority - b.priority || b.ageHours - a.ageHours);
}
