import { Router, type Request } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { env } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';
import { transition } from './payment-state-machine';

/**
 * Razorpay webhook (Challenge 03 — idempotent money ingress).
 *
 * Flow on every receipt:
 *  1. Verify X-Razorpay-Signature (HMAC-SHA256 over the RAW body).
 *  2. Dedupe via the webhook_events table (unique provider+event_id) — a
 *     redelivered event is recognised and skipped.
 *  3. Drive the payment FSM for the relevant order.
 *  4. Always return 200 (so Razorpay doesn't hammer us with retries) — except an
 *     invalid signature, which is a 400.
 *
 * Inactive until ENABLE_REAL_PAYMENTS is on; until then events are acknowledged
 * (and deduped) but no state changes are applied.
 */
export const razorpayWebhookRouter = Router();

function verifySignature(req: Request): boolean {
  const secret = env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.header('x-razorpay-signature');
  const raw = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!secret || !signature || !raw) return false;
  const expected = createHmac('sha256', secret).update(raw).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Find the order a Razorpay event refers to (by our stored order/payment ids). */
async function findOrderId(entity: Record<string, unknown> | undefined): Promise<string | null> {
  if (!entity) return null;
  const orderId = entity.order_id as string | undefined;
  const paymentId = entity.id as string | undefined;
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        orderId ? { razorpayOrderId: orderId } : undefined,
        paymentId ? { razorpayPaymentId: paymentId } : undefined,
      ].filter(Boolean) as Prisma.OrderWhereInput[],
    },
    select: { id: true },
  });
  return order?.id ?? null;
}

razorpayWebhookRouter.post('/razorpay', async (req, res) => {
  if (!verifySignature(req)) {
    logger.warn('[razorpay webhook] invalid signature');
    res.status(400).json({ error: 'invalid signature' });
    return;
  }

  const body = req.body as { event?: string; payload?: Record<string, { entity?: Record<string, unknown> }> };
  const eventType = body.event ?? 'unknown';
  // Razorpay doesn't guarantee a unique id header, so key on it when present
  // else a stable hash of the raw payload.
  const eventId =
    req.header('x-razorpay-event-id') ??
    createHmac('sha256', 'cm').update((req as Request & { rawBody?: Buffer }).rawBody ?? Buffer.from('')).digest('hex');

  // Idempotency: first writer wins; a duplicate hits the unique constraint.
  try {
    await prisma.webhookEvent.create({
      data: { provider: 'razorpay', eventId, type: eventType, payload: body as Prisma.InputJsonValue },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      logger.info(`[razorpay webhook] duplicate ${eventType} (${eventId}) — skipped`);
      res.status(200).json({ received: true, duplicate: true });
      return;
    }
    throw err;
  }

  if (!env.ENABLE_REAL_PAYMENTS) {
    logger.warn(`[razorpay webhook] ${eventType} recorded but real payments are off`);
    res.status(200).json({ received: true });
    return;
  }

  try {
    const entity =
      body.payload?.payment?.entity ?? body.payload?.refund?.entity ?? body.payload?.transfer?.entity;
    const orderId = await findOrderId(entity);
    if (orderId) {
      switch (eventType) {
        case 'payment.captured':
          await transition(orderId, 'ESCROW_HELD', 'razorpay:payment.captured', {
            data: { escrowHeldAt: new Date(), paymentMethod: 'razorpay' },
          });
          break;
        case 'transfer.settled':
          await transition(orderId, 'COMPLETED', 'razorpay:transfer.settled', {
            data: { payoutStatus: 'PAID', payoutPaidAt: new Date() },
          });
          break;
        case 'transfer.failed':
          await prisma.order.update({
            where: { id: orderId },
            data: { payoutStatus: 'FAILED', payoutFailureReason: 'razorpay transfer failed' },
          });
          break;
        case 'refund.processed':
          await transition(orderId, 'REFUNDED', 'razorpay:refund.processed', {
            data: { refundedAt: new Date() },
          });
          break;
        default:
          logger.info(`[razorpay webhook] unhandled event ${eventType}`);
      }
    }
  } catch (err) {
    // Never 500 — log and ack so Razorpay doesn't retry-storm; reconciliation backstops.
    logger.error(`[razorpay webhook] processing error: ${(err as Error).message}`);
  }

  res.status(200).json({ received: true });
});
