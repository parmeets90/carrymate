import { Router } from 'express';
import type { HealthStatus } from '@carrymate/shared';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

export const healthRouter = Router();

/**
 * Liveness/readiness check. Reports DB connectivity; returns 503 when degraded
 * so load balancers and CI can gate on it.
 */
healthRouter.get('/health', async (_req, res) => {
  const database = await prisma
    .$queryRaw`SELECT 1`
    .then(() => true)
    .catch(() => false);

  const payload: HealthStatus = {
    status: database ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: env.APP_VERSION,
    checks: { database },
  };

  res.status(database ? 200 : 503).json(payload);
});
