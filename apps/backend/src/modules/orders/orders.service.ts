import type { OrderView, Paginated } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { toOrderView } from './orders.serializer';

const withRelations = { request: true, sender: true, traveler: true } as const;

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
 * Sender confirms receipt → release escrow to the traveler.
 * (Phase 4 will gate this behind delivery proof + OTP; here it's a direct confirm.)
 */
export async function releaseOrder(orderId: string, senderId: string): Promise<OrderView> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.senderId !== senderId) throw AppError.notFound('Order not found');
  if (order.status !== 'ESCROW_HELD') {
    throw new AppError(409, 'ESCROW_NOT_HELD', 'Escrow is not currently held for this order.');
  }

  const [updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED', releasedAt: new Date() },
      include: withRelations,
    }),
    prisma.deliveryRequest.update({ where: { id: order.requestId }, data: { status: 'CONFIRMED' } }),
  ]);
  logger.info(`[escrow] released (stub payout ₹${order.payoutInr}) for order ${orderId}`);
  return toOrderView(updated, senderId);
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
