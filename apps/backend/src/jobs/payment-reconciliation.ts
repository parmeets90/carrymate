import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { transition } from '../modules/payments/payment-state-machine';

/**
 * Challenge 03, Fix 3 — payment reconciliation sweep.
 *
 * Backstop for missed/late Razorpay webhooks: any order stuck in PENDING_PAYMENT
 * past a grace window is re-checked against Razorpay; if the payment actually
 * captured, we drive the FSM to ESCROW_HELD. Runs on setInterval (we don't use
 * BullMQ in this stack). No-ops until ENABLE_REAL_PAYMENTS is on.
 */
const STALE_AFTER_MS = 10 * 60_000;

export async function runPaymentReconciliation(): Promise<number> {
  if (!env.ENABLE_REAL_PAYMENTS) return 0;

  const stale = await prisma.order.findMany({
    where: { status: 'PENDING_PAYMENT', createdAt: { lt: new Date(Date.now() - STALE_AFTER_MS) } },
    select: { id: true, razorpayOrderId: true },
  });
  if (!stale.length) return 0;

  let reconciled = 0;
  for (const order of stale) {
    try {
      const captured = await isRazorpayOrderPaid(order.razorpayOrderId);
      if (captured) {
        await transition(order.id, 'ESCROW_HELD', 'reconciliation', {
          data: { escrowHeldAt: new Date(), paymentMethod: 'razorpay' },
        });
        reconciled++;
      }
    } catch (err) {
      logger.error(`[reconciliation] order ${order.id} check failed: ${(err as Error).message}`);
    }
  }
  if (reconciled) logger.info(`[reconciliation] recovered ${reconciled} stuck payment(s)`);
  return reconciled;
}

/** Query Razorpay for whether an order has a captured payment. */
async function isRazorpayOrderPaid(razorpayOrderId: string | null): Promise<boolean> {
  if (!razorpayOrderId || !env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return false;
  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
  const res = await fetch(`https://api.razorpay.com/v1/orders/${razorpayOrderId}/payments`, {
    headers: { Authorization: `Basic ${auth}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { items?: { status?: string }[] };
  return (data.items ?? []).some((p) => p.status === 'captured');
}
