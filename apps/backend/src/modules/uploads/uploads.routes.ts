import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate';
import { ok } from '../../utils/response';
import { storage, buildStorageKey } from '../../lib/storage';

const presignSchema = z.object({
  purpose: z.enum(['kyc', 'item', 'ticket', 'delivery']),
  ext: z.enum(['jpg', 'jpeg', 'png', 'heic', 'pdf']),
});

export const uploadsRouter = Router();

uploadsRouter.use(authenticate);

/** Mint a signed URL the client PUTs a file to; returns the stored key. */
uploadsRouter.post('/presign', validateBody(presignSchema), async (req, res) => {
  const { purpose, ext } = req.body as z.infer<typeof presignSchema>;
  const key = buildStorageKey(purpose, req.user!.id, ext);
  const result = await storage().createUploadUrl(key);
  ok(res, result, 201);
});
