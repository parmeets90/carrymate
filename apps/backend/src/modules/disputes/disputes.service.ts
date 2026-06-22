import type { DisputeReason } from '@carrymate/shared';
import type { DisputeView } from '@carrymate/shared';
import { NotificationType } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { writeAudit } from '../../utils/audit';
import { createNotification } from '../notifications/notifications.service';
import { runTransition } from '../payments/payment-state-machine';

/** Auto-suspend a user once they're found at fault in this many disputes. */
const DISPUTE_FAULT_SUSPEND_THRESHOLD = 2;

/** States in which escrow is still held, so a dispute can freeze it. */
const DISPUTABLE_STATES = ['ESCROW_HELD', 'IN_TRANSIT', 'DELIVERY_PROOF_UPLOADED'];

/** Either party opens a dispute while escrow is held → freezes the order. */
export async function raiseDispute(
  orderId: string,
  userId: string,
  input: { reason: DisputeReason; description: string; evidence?: string[] },
): Promise<{ id: string; status: string }> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { dispute: true } });
  if (!order || (order.senderId !== userId && order.travelerId !== userId)) {
    throw AppError.notFound('Order not found');
  }
  if (!DISPUTABLE_STATES.includes(order.status)) {
    throw new AppError(409, 'NOT_DISPUTABLE', 'Disputes are only allowed while escrow is held.');
  }
  if (order.dispute) throw new AppError(409, 'DISPUTE_EXISTS', 'A dispute already exists.');

  const dispute = await prisma.$transaction(async (tx) => {
    const d = await tx.dispute.create({
      data: {
        orderId,
        raisedById: userId,
        reason: input.reason,
        description: input.description,
        evidence: input.evidence ?? [],
      },
    });
    await runTransition(tx, orderId, 'DISPUTED', 'dispute_opened', { meta: { reason: input.reason } });
    await tx.deliveryRequest.update({ where: { id: order.requestId }, data: { status: 'DISPUTED' } });
    return d;
  });
  logger.warn(`[dispute] opened on order ${orderId} by ${userId} (${input.reason})`);
  const otherPartyId = order.senderId === userId ? order.travelerId : order.senderId;
  await createNotification({
    userId: otherPartyId,
    type: NotificationType.DISPUTE_OPENED,
    title: 'A dispute was opened',
    body: 'The other party raised a dispute on your order. Our team will review it shortly.',
    data: { orderId, disputeId: dispute.id },
  });
  return { id: dispute.id, status: dispute.status };
}

/**
 * Suspend a user once they've been found at fault in too many disputes.
 * "At fault" = traveler on a RESOLVED_SENDER order, or sender on a RESOLVED_TRAVELER one.
 */
async function maybeAutoSuspend(userId: string): Promise<void> {
  const [asTraveler, asSender, user] = await Promise.all([
    prisma.dispute.count({ where: { order: { travelerId: userId }, status: 'RESOLVED_SENDER' } }),
    prisma.dispute.count({ where: { order: { senderId: userId }, status: 'RESOLVED_TRAVELER' } }),
    prisma.user.findUnique({ where: { id: userId }, select: { status: true, role: true } }),
  ]);
  const faults = asTraveler + asSender;
  if (faults < DISPUTE_FAULT_SUSPEND_THRESHOLD) return;
  if (!user || user.role === 'ADMIN' || user.status !== 'ACTIVE') return;

  await prisma.user.update({ where: { id: userId }, data: { status: 'SUSPENDED' } });
  await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  await writeAudit({
    action: 'USER_AUTO_SUSPENDED',
    entityType: 'user',
    entityId: userId,
    meta: { reason: 'dispute_fault_threshold', faults },
  });
  logger.warn(`[fraud] auto-suspended user ${userId} (${faults} at-fault disputes)`);
}

export async function listOpenDisputes(): Promise<DisputeView[]> {
  const disputes = await prisma.dispute.findMany({
    where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } },
    orderBy: { createdAt: 'asc' },
    include: { order: { include: { request: true, sender: true, traveler: true } } },
  });
  return disputes.map((d) => ({
    id: d.id,
    orderId: d.orderId,
    reason: d.reason,
    description: d.description,
    evidence: d.evidence,
    status: d.status,
    raisedByRole: d.raisedById === d.order.senderId ? 'SENDER' : 'TRAVELER',
    requestTitle: d.order.request.title,
    amountInr: d.order.amountInr,
    senderName: d.order.sender.fullName,
    travelerName: d.order.traveler.fullName,
    createdAt: d.createdAt.toISOString(),
  }));
}

/** Admin resolves: refund the sender, or release escrow to the traveler. */
export async function resolveDispute(
  disputeId: string,
  adminId: string,
  decision: 'REFUND_SENDER' | 'RELEASE_TRAVELER',
  note: string,
): Promise<void> {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId }, include: { order: true } });
  if (!dispute) throw AppError.notFound('Dispute not found');
  if (dispute.status !== 'OPEN' && dispute.status !== 'UNDER_REVIEW') {
    throw new AppError(409, 'ALREADY_RESOLVED', 'This dispute is already resolved.');
  }
  const { order } = dispute;

  const refund = decision === 'REFUND_SENDER';
  await prisma.$transaction(async (tx) => {
    if (refund) {
      await runTransition(tx, order.id, 'REFUNDED', 'dispute_refund', {
        data: { refundedAt: new Date() },
      });
      await tx.deliveryRequest.update({ where: { id: order.requestId }, data: { status: 'CANCELLED' } });
    } else {
      // Release to traveler: DISPUTED → PAYOUT_INITIATED → COMPLETED.
      await runTransition(tx, order.id, 'PAYOUT_INITIATED', 'dispute_release', {
        data: { payoutStatus: 'INITIATED', payoutInitiatedAt: new Date(), releasedAt: new Date() },
      });
      await runTransition(tx, order.id, 'COMPLETED', 'payout_settled', {
        data: { payoutStatus: 'PAID', payoutPaidAt: new Date() },
      });
      await tx.deliveryRequest.update({ where: { id: order.requestId }, data: { status: 'CONFIRMED' } });
    }
    await tx.dispute.update({
      where: { id: disputeId },
      data: {
        status: refund ? 'RESOLVED_SENDER' : 'RESOLVED_TRAVELER',
        resolvedById: adminId,
        resolutionNote: note,
        resolvedAt: new Date(),
      },
    });
  });
  logger.info(`[dispute] ${disputeId} resolved → ${decision}`);
  await writeAudit({
    actorId: adminId,
    action: 'DISPUTE_RESOLVED',
    entityType: 'dispute',
    entityId: disputeId,
    meta: { orderId: order.id, decision },
  });

  // The party found at fault: refund ⇒ traveler at fault; release ⇒ sender at fault.
  const atFaultId = refund ? order.travelerId : order.senderId;
  await maybeAutoSuspend(atFaultId);

  const outcome = refund
    ? 'resolved in the sender’s favour (refund issued).'
    : 'resolved in the traveler’s favour (payout released).';
  await Promise.all(
    [order.senderId, order.travelerId].map((uid) =>
      createNotification({
        userId: uid,
        type: NotificationType.DISPUTE_RESOLVED,
        title: 'Dispute resolved',
        body: `Your dispute has been ${outcome}`,
        data: { orderId: order.id, disputeId },
      }),
    ),
  );
}
