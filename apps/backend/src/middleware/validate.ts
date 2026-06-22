import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

/** Validate and coerce `req.body` against a Zod schema before the handler runs. */
export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
}
