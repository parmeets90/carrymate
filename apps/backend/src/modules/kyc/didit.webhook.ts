import { Router, type Request } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';
import { verifyDiditSignature } from './didit';
import { applyDiditResult } from './kyc.service';

/**
 * Didit verification webhook. HMAC-verified (raw body), idempotent, always 200.
 * Correlates via vendor_data (= our userId) set at session creation.
 */
export const diditWebhookRouter = Router();

diditWebhookRouter.post('/didit', async (req, res) => {
  const signature = req.header('x-signature') ?? req.header('x-didit-signature');
  const raw = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!verifyDiditSignature(raw, signature)) {
    logger.warn('[didit webhook] invalid signature');
    res.status(401).json({ error: 'invalid signature' });
    return;
  }

  const body = req.body as { session_id?: string; status?: string; vendor_data?: string };
  const userId = body.vendor_data;
  const status = body.status ?? 'unknown';
  const eventId = `${body.session_id ?? 'na'}:${status}`;

  try {
    await prisma.webhookEvent.create({
      data: { provider: 'didit', eventId, type: status, payload: body as Prisma.InputJsonValue },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      res.status(200).json({ received: true, duplicate: true });
      return;
    }
    throw err;
  }

  try {
    if (userId) await applyDiditResult(userId, status);
    else logger.warn('[didit webhook] missing vendor_data');
  } catch (err) {
    logger.error(`[didit webhook] processing error: ${(err as Error).message}`);
  }

  res.status(200).json({ received: true });
});
