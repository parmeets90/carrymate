import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';
import { writeAudit } from '../../utils/audit';
import { MAX_DECLARED_VALUE_INR } from '@carrymate/shared';

/** Score thresholds (0–100). */
export const RISK_FLAG_THRESHOLD = 50; // surfaced in the admin risk queue
export const RISK_HOLD_THRESHOLD = 70; // escrow release blocked until an admin clears it

export interface RiskResult {
  score: number;
  factors: string[];
  hold: boolean;
}

interface RiskInput {
  orderId: string;
  senderId: string;
  travelerId: string;
  declaredValueInr: number;
}

const NEW_ACCOUNT_MS = 48 * 3_600_000;
const BURST_WINDOW_MS = 24 * 3_600_000;

/**
 * Rule-based risk scoring computed when an order is created. Deterministic and
 * explainable (every point maps to a named factor) — no ML, per MVP scope.
 * Persists the score on the order; ≥HOLD freezes escrow release for admin review.
 */
export async function scoreOrder(input: RiskInput): Promise<RiskResult> {
  const factors: string[] = [];
  let score = 0;

  const [sender, recentOrders, senderDisputesLost, dupKyc, highValueShare] = await Promise.all([
    prisma.user.findUnique({
      where: { id: input.senderId },
      select: { createdAt: true, ratingAvg: true, ratingCount: true },
    }),
    prisma.order.count({
      where: { senderId: input.senderId, createdAt: { gte: new Date(Date.now() - BURST_WINDOW_MS) } },
    }),
    // Disputes resolved against the sender (they were found at fault).
    prisma.dispute.count({
      where: { order: { senderId: input.senderId }, status: 'RESOLVED_TRAVELER' },
    }),
    // Same government ID hash shared with any other account (sender or traveler).
    sharesKycHash([input.senderId, input.travelerId]),
    Promise.resolve(input.declaredValueInr >= MAX_DECLARED_VALUE_INR * 0.8),
  ]);

  if (sender) {
    if (Date.now() - sender.createdAt.getTime() < NEW_ACCOUNT_MS) {
      score += 15;
      factors.push('NEW_SENDER');
    }
    if (sender.ratingCount >= 3 && Number(sender.ratingAvg) < 4) {
      score += 20;
      factors.push('LOW_RATING');
    }
  }
  if (senderDisputesLost > 0) {
    score += Math.min(30, senderDisputesLost * 15);
    factors.push('DISPUTE_HISTORY');
  }
  if (highValueShare) {
    score += 15;
    factors.push('HIGH_VALUE');
  }
  if (recentOrders >= 3) {
    score += 15;
    factors.push('BURST_ORDERS');
  }
  if (dupKyc) {
    score += 40;
    factors.push('DUPLICATE_KYC');
  }

  score = Math.min(100, score);
  const hold = score >= RISK_HOLD_THRESHOLD;

  await prisma.order.update({
    where: { id: input.orderId },
    data: { riskScore: score, riskFactors: factors, fraudHold: hold },
  });

  if (score >= RISK_FLAG_THRESHOLD) {
    logger.warn(`[fraud] order ${input.orderId} scored ${score} [${factors.join(', ')}]${hold ? ' — HELD' : ''}`);
    if (hold) {
      await writeAudit({
        action: 'ORDER_FRAUD_HOLD',
        entityType: 'order',
        entityId: input.orderId,
        meta: { score, factors },
      });
    }
  }

  return { score, factors, hold };
}

/** True if any two of the given users share a KYC document number hash. */
async function sharesKycHash(userIds: string[]): Promise<boolean> {
  const docs = await prisma.kycDocument.findMany({
    where: { userId: { in: userIds }, docNumberHash: { not: null } },
    select: { userId: true, docNumberHash: true },
  });
  const hashes = docs.map((d) => d.docNumberHash).filter((h): h is string => h !== null);
  if (!hashes.length) return false;
  const clash = await prisma.kycDocument.findFirst({
    where: { docNumberHash: { in: hashes }, userId: { notIn: userIds } },
    select: { id: true },
  });
  return clash !== null;
}
