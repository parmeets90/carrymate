import type { DisputeReason } from '@carrymate/shared';
import type { DisputeView } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';

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
  if (order.status !== 'ESCROW_HELD') {
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
    await tx.order.update({ where: { id: orderId }, data: { status: 'DISPUTED' } });
    await tx.deliveryRequest.update({ where: { id: order.requestId }, data: { status: 'DISPUTED' } });
    return d;
  });
  logger.warn(`[dispute] opened on order ${orderId} by ${userId} (${input.reason})`);
  return { id: dispute.id, status: dispute.status };
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
  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: refund
        ? { status: 'REFUNDED', refundedAt: new Date() }
        : { status: 'COMPLETED', releasedAt: new Date() },
    }),
    prisma.deliveryRequest.update({
      where: { id: order.requestId },
      data: { status: refund ? 'CANCELLED' : 'CONFIRMED' },
    }),
    prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: refund ? 'RESOLVED_SENDER' : 'RESOLVED_TRAVELER',
        resolvedById: adminId,
        resolutionNote: note,
        resolvedAt: new Date(),
      },
    }),
  ]);
  logger.info(`[dispute] ${disputeId} resolved → ${decision}`);
}
