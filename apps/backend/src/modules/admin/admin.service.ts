import type { Prisma } from '@prisma/client';
import type {
  AdminKycReviewItem,
  PublicUser,
  Paginated,
  DeliveryRequestSummary,
} from '@carrymate/shared';
import { NotificationType } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
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

  return users.map((u) => ({
    user: toPublicUser(u),
    documents: u.kycDocuments.map(toKycDocumentDto),
  }));
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
  return { user: toPublicUser(user), documents: user.kycDocuments.map(toKycDocumentDto) };
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

export async function setUserStatus(
  userId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED',
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

  return toPublicUser(updated);
}
