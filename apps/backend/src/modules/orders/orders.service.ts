import type { OrderView, Paginated } from '@carrymate/shared';
import { DELIVERY_AUTO_CONFIRM_HOURS } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { generateNumericOtp } from '../../utils/crypto';
import { NotificationType } from '@carrymate/shared';
import { createNotification } from '../notifications/notifications.service';
import { writeAudit } from '../../utils/audit';
import { RISK_FLAG_THRESHOLD } from '../fraud/fraud.service';
import { transition, runTransition } from '../payments/payment-state-machine';
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

  await transition(orderId, 'ESCROW_HELD', 'pay_stub', {
    data: { escrowHeldAt: new Date(), paymentMethod: 'stub' },
  });
  const updated = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: withRelations });
  logger.info(`[escrow] held (stub) for order ${orderId}`);
  await createNotification({
    userId: updated.travelerId,
    type: NotificationType.ORDER_PAID,
    title: 'Payment secured in escrow',
    body: `Funds for “${updated.request.title}” are held. You can pick up and start the trip.`,
    data: { orderId },
  });
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
  await prisma.$transaction(async (tx) => {
    await runTransition(tx, orderId, 'IN_TRANSIT', 'open_box', {
      data: {
        openBox: { checklist: input.checklist, photos: input.photos, lat: input.lat, lng: input.lng, at: new Date().toISOString() },
        openBoxAt: new Date(),
        pickedUpAt: new Date(),
        deliveryOtp,
      },
      meta: { photos: input.photos.length },
    });
    await tx.deliveryRequest.update({ where: { id: order.requestId }, data: { status: 'IN_TRANSIT' } });
  });
  const fresh = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: withRelations });
  logger.info(`[fulfillment] open-box done, in transit: order ${orderId}`);
  await createNotification({
    userId: fresh.senderId,
    type: NotificationType.IN_TRANSIT,
    title: 'Your item is on the way',
    body: `The traveler completed the open-box check for “${fresh.request.title}” and is in transit.`,
    data: { orderId },
  });
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
  await prisma.$transaction(async (tx) => {
    await runTransition(tx, orderId, 'DELIVERY_PROOF_UPLOADED', 'deliver', {
      data: { deliveryProof: input.photos, deliveredAt: new Date(), autoConfirmAt },
      meta: { proofPhotos: input.photos.length },
    });
    await tx.deliveryRequest.update({ where: { id: order.requestId }, data: { status: 'DELIVERED' } });
  });
  const fresh = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: withRelations });
  logger.info(`[fulfillment] delivered: order ${orderId} (auto-confirm ${autoConfirmAt.toISOString()})`);
  await createNotification({
    userId: fresh.senderId,
    type: NotificationType.DELIVERED,
    title: 'Item delivered — please confirm',
    body: `“${fresh.request.title}” was delivered. Confirm receipt to release payment (auto-confirms in ${DELIVERY_AUTO_CONFIRM_HOURS}h).`,
    data: { orderId },
  });
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
  if (order.fraudHold) {
    throw new AppError(409, 'FRAUD_HOLD', 'This order is under a safety review. Our team will resolve it shortly.');
  }
  if (order.status !== 'DELIVERY_PROOF_UPLOADED') {
    throw new AppError(409, 'NOT_DELIVERED', 'You can release escrow only after delivery.');
  }
  return doRelease(orderId, senderId);
}

/**
 * Release escrow to the traveler: PAYOUT_INITIATED → COMPLETED.
 * Stub mode settles the payout instantly; real mode would mark PAYOUT_INITIATED
 * and let the Razorpay transfer.settled webhook drive COMPLETED.
 * Works from DELIVERY_PROOF_UPLOADED (normal) or DISPUTED (admin release).
 */
async function doRelease(orderId: string, viewerId: string): Promise<OrderView> {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  await prisma.$transaction(async (tx) => {
    await runTransition(tx, orderId, 'PAYOUT_INITIATED', 'release', {
      data: { payoutStatus: 'INITIATED', payoutInitiatedAt: new Date(), releasedAt: new Date() },
    });
    // Stub payout settles immediately. (Real mode: webhook completes this.)
    await runTransition(tx, orderId, 'COMPLETED', 'payout_settled', {
      data: { payoutStatus: 'PAID', payoutPaidAt: new Date() },
    });
    await tx.deliveryRequest.update({ where: { id: order.requestId }, data: { status: 'CONFIRMED' } });
  });
  const updated = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: withRelations });
  logger.info(`[escrow] released (stub payout ₹${order.payoutInr}) for order ${orderId}`);
  await createNotification({
    userId: updated.travelerId,
    type: NotificationType.ESCROW_RELEASED,
    title: 'Payout released 🎉',
    body: `₹${updated.payoutInr} for “${updated.request.title}” has been released to you.`,
    data: { orderId },
  });
  return toOrderView(updated, viewerId);
}

/** Cron: auto-release escrow for delivered orders past their confirm window (no dispute). */
export async function runAutoConfirm(): Promise<number> {
  const due = await prisma.order.findMany({
    where: {
      status: 'DELIVERY_PROOF_UPLOADED',
      autoConfirmAt: { lte: new Date() },
      dispute: null,
      fraudHold: false,
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

/** Admin clears a fraud hold so escrow can be released/auto-confirmed normally. */
export async function clearFraudHold(orderId: string, adminId: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw AppError.notFound('Order not found');
  if (!order.fraudHold) throw new AppError(409, 'NOT_HELD', 'This order is not under a fraud hold.');
  await prisma.order.update({
    where: { id: orderId },
    data: { fraudHold: false, fraudClearedAt: new Date(), fraudClearedById: adminId },
  });
  await writeAudit({
    actorId: adminId,
    action: 'ORDER_HOLD_CLEARED',
    entityType: 'order',
    entityId: orderId,
    meta: { riskScore: order.riskScore, riskFactors: order.riskFactors },
  });
  logger.info(`[fraud] hold cleared on order ${orderId} by admin ${adminId}`);
}

/** Orders flagged by the risk engine (score ≥ flag threshold) or currently held. */
export async function listFraudQueue(): Promise<
  (OrderView & { senderName: string | null; travelerName: string | null; riskScore: number; riskFactors: string[]; fraudHold: boolean })[]
> {
  const orders = await prisma.order.findMany({
    where: { OR: [{ riskScore: { gte: RISK_FLAG_THRESHOLD } }, { fraudHold: true }] },
    include: withRelations,
    orderBy: [{ fraudHold: 'desc' }, { riskScore: 'desc' }, { createdAt: 'desc' }],
  });
  return orders.map((o) => ({
    ...toOrderView(o, o.senderId),
    senderName: o.sender.fullName,
    travelerName: o.traveler.fullName,
    riskScore: o.riskScore,
    riskFactors: o.riskFactors,
    fraudHold: o.fraudHold,
  }));
}

/** Orders whose payout failed — the admin recovery queue (Challenge 03, Fix 5). */
export async function listFailedPayouts(): Promise<
  import('@carrymate/shared').FailedPayoutItem[]
> {
  const orders = await prisma.order.findMany({
    where: { payoutStatus: 'FAILED' },
    include: { traveler: true, request: true },
    orderBy: { payoutInitiatedAt: 'desc' },
  });
  return orders.map((o) => ({
    orderId: o.id,
    travelerName: o.traveler.fullName,
    payoutInr: o.payoutInr,
    requestTitle: o.request.title,
    failureReason: o.payoutFailureReason,
    payoutInitiatedAt: o.payoutInitiatedAt ? o.payoutInitiatedAt.toISOString() : null,
  }));
}

/** Admin retries a failed payout. Stub settles instantly; real mode re-initiates the transfer. */
export async function retryPayout(orderId: string, adminId: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw AppError.notFound('Order not found');
  if (order.payoutStatus !== 'FAILED') {
    throw new AppError(409, 'NOT_FAILED', 'This payout is not in a failed state.');
  }

  if (env.ENABLE_REAL_PAYMENTS) {
    // Real mode: re-create the Razorpay Route transfer here; COMPLETED arrives via webhook.
    await prisma.order.update({
      where: { id: orderId },
      data: { payoutStatus: 'INITIATED', payoutFailureReason: null, payoutInitiatedAt: new Date() },
    });
  } else {
    // Stub: settle immediately and complete the order if still mid-payout.
    if (order.status === 'PAYOUT_INITIATED') {
      await transition(orderId, 'COMPLETED', 'payout_retry', {
        data: { payoutStatus: 'PAID', payoutPaidAt: new Date(), payoutFailureReason: null },
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { payoutStatus: 'PAID', payoutPaidAt: new Date(), payoutFailureReason: null },
      });
    }
  }
  logger.info(`[payout] retry by admin ${adminId} for order ${orderId}`);
}

export async function refundOrder(orderId: string, adminId?: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw AppError.notFound('Order not found');
  await prisma.$transaction(async (tx) => {
    await runTransition(tx, orderId, 'REFUNDED', adminId ? 'admin_refund' : 'refund', {
      data: { refundedAt: new Date() },
    });
    await tx.deliveryRequest.update({ where: { id: order.requestId }, data: { status: 'CANCELLED' } });
  });
  await writeAudit({
    actorId: adminId ?? null,
    action: 'ORDER_REFUNDED',
    entityType: 'order',
    entityId: orderId,
    meta: { amountInr: order.amountInr },
  });
  logger.info(`[escrow] refunded order ${orderId}`);
}
