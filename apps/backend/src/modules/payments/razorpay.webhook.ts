import { Router } from 'express';
import { logger } from '../../utils/logger';

/**
 * Razorpay webhook (scaffold). Wired in Phase 3 "real payments" task:
 *  - verify `X-Razorpay-Signature` (HMAC-SHA256 over the RAW body with the
 *    webhook secret) — requires a raw-body parser on this route,
 *  - idempotently handle `payment.captured` (→ ESCROW_HELD),
 *    `transfer.settled` (→ COMPLETED), `refund.processed` (→ REFUNDED),
 *  - store processed event IDs to skip duplicates.
 * Until ENABLE_REAL_PAYMENTS is on, payments run in stub mode (see orders.service).
 */
export const razorpayWebhookRouter = Router();

razorpayWebhookRouter.post('/razorpay', (req, res) => {
  logger.warn('[razorpay webhook] received but real payments are not enabled yet');
  res.status(200).json({ received: true });
});
