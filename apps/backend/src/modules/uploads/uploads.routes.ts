import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate';
import { ok } from '../../utils/response';
import { AppError } from '../../utils/errors';
import { storage, buildStorageKey } from '../../lib/storage';

const PURPOSES = ['kyc', 'item', 'ticket', 'delivery', 'openbox'] as const;

const presignSchema = z.object({
  purpose: z.enum(PURPOSES),
  ext: z.enum(['jpg', 'jpeg', 'png', 'heic', 'pdf']),
});

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'image/heif': 'heic',
  'application/pdf': 'pdf',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

export const uploadsRouter = Router();

uploadsRouter.use(authenticate);

/** Multipart upload: field `file` + `purpose`. Stores in Supabase, returns the key. */
uploadsRouter.post('/', upload.single('file'), async (req, res) => {
  const purpose = z.enum(PURPOSES).parse(req.body.purpose);
  if (!req.file) throw AppError.badRequest('A file is required.');
  const ext = MIME_EXT[req.file.mimetype];
  if (!ext) throw AppError.badRequest(`Unsupported file type: ${req.file.mimetype}`);
  const key = buildStorageKey(purpose, req.user!.id, ext);
  await storage().upload(key, req.file.buffer, req.file.mimetype);
  ok(res, { key }, 201);
});

/** Alternative: signed URL for direct-to-storage upload (unused by mobile for now). */
uploadsRouter.post('/presign', validateBody(presignSchema), async (req, res) => {
  const { purpose, ext } = req.body as z.infer<typeof presignSchema>;
  const key = buildStorageKey(purpose, req.user!.id, ext);
  const result = await storage().createUploadUrl(key);
  ok(res, result, 201);
});
