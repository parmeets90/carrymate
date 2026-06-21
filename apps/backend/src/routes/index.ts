import { Router } from 'express';
import { ok } from '../utils/response';
import { env } from '../config/env';

/**
 * Versioned API router. All feature modules mount under /v1.
 * The contract is additive — never break an existing endpoint; add new ones.
 */
export const v1Router = Router();

v1Router.get('/', (_req, res) => {
  ok(res, {
    name: env.APP_NAME,
    version: env.APP_VERSION,
    message: 'CarryMate API v1',
  });
});

// Feature modules are mounted here per phase, e.g.:
// v1Router.use('/auth', authRouter);
// v1Router.use('/kyc', kycRouter);
