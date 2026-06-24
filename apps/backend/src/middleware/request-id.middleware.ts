import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

/**
 * Assigns a correlation id to every request (honoring an inbound X-Request-Id
 * from a proxy if present) and echoes it back in the response header. Used to
 * tie together logs and Sentry events for a single request.
 */
export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header('x-request-id');
  req.id = incoming && incoming.length <= 100 ? incoming : randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};
