import type { OrderView, Paginated } from '@carrymate/shared';
import { DELIVERY_AUTO_CONFIRM_HOURS } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { generateNumericOtp } from '../../utils/crypto';
import { toOrderView } from './orders.serializer';

const withRelations = { request: true, sender: true, traveler: true, dispute: true } as const;

export async function listMyOrders(userId: string): Promise<OrderView[]> {
  const orders = await prisma.order.findMany({
    where: { OR: [{ senderId: userId }, { travelerId: userId }] },
    include: withRelations,
    orderBy: { createdAt: 'desc' },
  });
  return orders.map((o) => toOrderView(o, userId));
}

export async function getOrder(orderId: string, userId: string): Promise<OrderView> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: withRelations });
  if (!order || (order.senderId !== userId && order.travelerId !== userId)) {
    throw AppError.notFound('Order not found');
  }
  return toOrderView(order, userId);
}

/**
 * Sender pays into escrow.
 * Stub mode (ENABLE_REAL_PAYMENTS=false): marks the order ESCROW_HELD directly.
 * Real mode: a Razorpay order would be created and escrow confirmed via webhook
 * (see modules/payments). Funds are only ever "held" here — released on delivery.
 */
export async function payOrder(orderId: string, senderId: string): Promise<OrderView> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.senderId !== senderId) throw AppError.notFound('Order not found');
  if (order.status !== 'PENDING_PAYMENT') {
    throw new AppError(409, 'ORDER_NOT_PAYABLE', 'This order is not awaiting payment.');
  }

  if (env.ENABLE_REAL_PAYMENTS) {
    // Real flow is webhook-driven; never mark held without a captured payment.
    throw new AppError(501, 'REAL_PAYMENTS_PENDING', 'Razorpay checkout is not wired yet.');
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'ESCROW_HELD', escrowHeldAt: new Date(), paymentMethod: 'stub' },
    include: withRelations,
  });
  logger.info(`[escrow] held (stub) for order ${orderId}`);
  return toOrderView(updated, senderId);
}

/**
 * Traveler open-box declaration at pickup → item goes in transit.
 * Generates the delivery handover code (shown to the sender).
 */
export async function openBoxOrder(
  orderId: string,
  travelerId: string,
  input: { checklist: Record<string, boolean>; photos: string[]; lat?: number; lng?: number },
): Promise<OrderView> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { request: true } });
  if (!order || order.travelerId !== travelerId) throw AppError.notFound('Order not found');
  if (order.status !== 'ESCROW_HELD' || order.request.status !== 'MATCHED') {
    throw new AppError(409, 'NOT_READY_FOR_PICKUP', 'This order is not ready for pickup.');
  }
  const allChecked = ['inspected', 'contentsMatch', 'noProhibited', 'sealed'].every(
    (k) => input.checklist[k] === true,
  );
  if (!allChecked) {
    throw AppError.badRequest('All open-box checklist items must be confirmed.');
  }

  const deliveryOtp = generateNumericOtp(6);
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        openBox: { checklist: input.checklist, photos: input.photos, lat: input.lat, lng: input.lng, at: new Date().toISOString() },
        openBoxAt: new Date(),
        pickedUpAt: new Date(),
        deliveryOtp,
      },
    }),
    prisma.deliveryRequest.update({ where: { id: order.requestId }, data: { status: 'IN_TRANSIT' } }),
  ]);
  const fresh = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: withRelations });
  logger.info(`[fulfillment] open-box done, in transit: order ${orderId}`);
  return toOrderView(fresh, travelerId);
}

/** Traveler delivers: verify handover OTP + upload proof → delivered (starts auto-confirm clock). */
export async function deliverOrder(
  orderId: string,
  travelerId: string,
  input: { otp: string; photos: string[] },
): Promise<OrderView> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { request: true } });
  if (!order || order.travelerId !== travelerId) throw AppError.notFound('Order not found');
  if (order.request.status !== 'IN_TRANSIT') {
    throw new AppError(409, 'NOT_IN_TRANSIT', 'This order is not in transit.');
  }
  if (!order.deliveryOtp || input.otp.trim() !== order.deliveryOtp) {
    throw new AppError(400, 'OTP_INVALID', 'Invalid handover code.');
  }

  const autoConfirmAt = new Date(Date.now() + DELIVERY_AUTO_CONFIRM_HOURS * 3_600_000);
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { deliveryProof: input.photos, deliveredAt: new Date(), autoConfirmAt },
    }),
    prisma.deliveryRequest.update({ where: { id: order.requestId }, data: { status: 'DELIVERED' } }),
  ]);
  const fresh = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: withRelations });
  logger.info(`[fulfillment] delivered: order ${orderId} (auto-confirm ${autoConfirmAt.toISOString()})`);
  return toOrderView(fresh, travelerId);
}

/**
 * Sender confirms receipt → release escrow to the traveler.
 * Gated: the item must be DELIVERED and not under dispute.
 */
export async function releaseOrder(orderId: string, senderId: string): Promise<OrderView> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { request: true } });
  if (!order || order.senderId !== senderId) throw AppError.notFound('Order not found');
  if (order.status === 'DISPUTED') {
    throw new AppError(409, 'ORDER_DISPUTED', 'This order is under dispute.');
  }
  if (order.status !== 'ESCROW_HELD' || order.request.status !== 'DELIVERED') {
    throw new AppError(409, 'NOT_DELIVERED', 'You can release escrow only after delivery.');
  }
  return doRelease(orderId, senderId);
}

async function doRelease(orderId: string, viewerId: string): Promise<OrderView> {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  const [updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED', releasedAt: new Date() },
      include: withRelations,
    }),
    prisma.deliveryRequest.update({ where: { id: order.requestId }, data: { status: 'CONFIRMED' } }),
  ]);
  logger.info(`[escrow] released (stub payout ₹${order.payoutInr}) for order ${orderId}`);
  return toOrderView(updated, viewerId);
}

/** Cron: auto-release escrow for delivered orders past their confirm window (no dispute). */
export async function runAutoConfirm(): Promise<number> {
  const due = await prisma.order.findMany({
    where: {
      status: 'ESCROW_HELD',
      autoConfirmAt: { lte: new Date() },
      request: { status: 'DELIVERED' },
      dispute: null,
    },
    select: { id: true, senderId: true },
  });
  for (const o of due) await doRelease(o.id, o.senderId);
  if (due.length) logger.info(`[escrow] auto-confirmed ${due.length} order(s)`);
  return due.length;
}

// ── Admin ──────────────────────────────────────────────

export async function listAllOrders(
  page: number,
  pageSize: number,
): Promise<Paginated<OrderView & { senderName: string | null; travelerName: string | null }>> {
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      include: withRelations,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count(),
  ]);
  return {
    items: items.map((o) => ({
      ...toOrderView(o, o.senderId),
      senderName: o.sender.fullName,
      travelerName: o.traveler.fullName,
    })),
    page,
    pageSize,
    total,
  };
}

export async function refundOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw AppError.notFound('Order not found');
  if (!['PENDING_PAYMENT', 'ESCROW_HELD', 'DISPUTED'].includes(order.status)) {
    throw new AppError(409, 'NOT_REFUNDABLE', 'This order cannot be refunded.');
  }
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: 'REFUNDED', refundedAt: new Date() },
    }),
    prisma.deliveryRequest.update({ where: { id: order.requestId }, data: { status: 'CANCELLED' } }),
  ]);
  logger.info(`[escrow] refunded order ${orderId}`);
}
