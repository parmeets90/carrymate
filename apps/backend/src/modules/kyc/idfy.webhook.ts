import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';
import { parseIdfyScores } from './idfy';
import { applyIdfyResult } from './kyc.service';

/**
 * IDFY async result webhook (Challenge 02). Idempotent (webhook_events) and
 * always 200 so IDFY doesn't retry-storm. Correlates back to the user via the
 * task_id we set at submission (= userId).
 */
export const idfyWebhookRouter = Router();

idfyWebhookRouter.post('/idfy', async (req, res) => {
  const body = req.body as { task_id?: string; group_id?: string; request_id?: string };
  const userId = body.task_id ?? body.group_id;
  const eventId = body.request_id ?? `${userId}:${Date.now()}`;

  try {
    await prisma.webhookEvent.create({
      data: { provider: 'idfy', eventId, type: 'kyc_result', payload: body as Prisma.InputJsonValue },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      res.status(200).json({ received: true, duplicate: true });
      return;
    }
    throw err;
  }

  try {
    const scores = parseIdfyScores(body);
    if (userId && scores) {
      await applyIdfyResult(userId, scores);
    } else {
      logger.warn(`[idfy webhook] unusable payload (user=${userId ?? 'n/a'}, scores=${!!scores})`);
    }
  } catch (err) {
    logger.error(`[idfy webhook] processing error: ${(err as Error).message}`);
  }

  res.status(200).json({ received: true });
});
