import type { Order, OrderStatus, Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';

/**
 * Challenge 03 — single source of truth for the money path.
 *
 * Every payment-state change goes through one guarded transition: it validates
 * the move against an explicit FSM, applies it as a compare-and-swap (so two
 * concurrent triggers can't both win), and appends to payment_state_logs.
 * No code should write `orders.status` directly — always go through here.
 */

/** Allowed forward/exception transitions. Terminal states map to []. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['ESCROW_HELD', 'REFUNDED'],
  ESCROW_HELD: ['IN_TRANSIT', 'DISPUTED', 'REFUNDED'],
  IN_TRANSIT: ['DELIVERY_PROOF_UPLOADED', 'DISPUTED', 'REFUNDED'],
  DELIVERY_PROOF_UPLOADED: ['PAYOUT_INITIATED', 'DISPUTED'],
  PAYOUT_INITIATED: ['COMPLETED', 'REFUNDED'],
  DISPUTED: ['PAYOUT_INITIATED', 'REFUNDED'],
  COMPLETED: [],
  REFUNDED: [],
};

type Db = PrismaClient | Prisma.TransactionClient;

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

interface TransitionOpts {
  /** Extra order columns to set atomically with the status (e.g. escrowHeldAt). */
  data?: Prisma.OrderUpdateManyMutationInput;
  /** Structured context stored on the audit row. */
  meta?: Record<string, unknown>;
}

/**
 * Apply a transition using the provided client (so it can join a caller's
 * transaction). Compare-and-swap on the current status guarantees correctness
 * under concurrency. Re-entering the same state is a no-op (idempotent).
 */
export async function runTransition(
  db: Db,
  orderId: string,
  to: OrderStatus,
  triggerEvent: string,
  opts: TransitionOpts = {},
): Promise<Order> {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw AppError.notFound('Order not found');

  const from = order.status;
  if (from === to) return order; // idempotent — already there

  if (!canTransition(from, to)) {
    throw new AppError(409, 'INVALID_TRANSITION', `Cannot move payment from ${from} to ${to}.`);
  }

  const updated = await db.order.updateMany({
    where: { id: orderId, status: from }, // CAS: only if still in the expected state
    data: { ...opts.data, status: to },
  });
  if (updated.count === 0) {
    throw new AppError(409, 'CONCURRENT_TRANSITION', 'Order changed concurrently. Retry.');
  }

  await db.paymentStateLog.create({
    data: {
      orderId,
      fromState: from,
      toState: to,
      triggerEvent,
      meta: (opts.meta ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
  logger.info(`[fsm] order ${orderId}: ${from} → ${to} (${triggerEvent})`);

  return db.order.findUniqueOrThrow({ where: { id: orderId } });
}

/** Standalone transition (opens its own transaction). */
export function transition(
  orderId: string,
  to: OrderStatus,
  triggerEvent: string,
  opts: TransitionOpts = {},
): Promise<Order> {
  return prisma.$transaction((tx) => runTransition(tx, orderId, to, triggerEvent, opts));
}
