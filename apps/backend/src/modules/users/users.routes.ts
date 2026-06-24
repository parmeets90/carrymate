import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { ok } from '../../utils/response';
import { getTrustProfile } from './users.service';

export const usersRouter = Router();

// Any signed-in user may view another user's public trust profile.
usersRouter.use(authenticate);

const idSchema = z.string().uuid();

/** GET /v1/users/:id/profile — public trust profile (no PII). */
const getProfile: RequestHandler = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  ok(res, await getTrustProfile(id));
};

usersRouter.get('/:id/profile', getProfile);
