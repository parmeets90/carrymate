import type { CorsOptions } from 'cors';
import { env, isProd } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Single source of truth for cross-origin policy, shared by the Express HTTP
 * server and the Socket.IO transport so they can never drift.
 *
 * Policy:
 * - dev / test: reflect any origin (local admin on :5173, RN Metro, curl).
 * - production: only origins listed in CORS_ORIGINS may make browser requests.
 * - Requests with no Origin header (native mobile app, server-to-server, curl)
 *   are always allowed — Origin is a browser-enforced header, not an auth signal.
 */
const allowedOrigins = new Set(
  (env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
);

if (isProd && allowedOrigins.size === 0) {
  logger.warn(
    '⚠️  CORS_ORIGINS is empty in production — browser requests from the admin web app will be blocked. Set CORS_ORIGINS to your admin URL(s).',
  );
}

/** Whether a browser Origin is permitted to call the API. */
export function isOriginAllowed(origin?: string | null): boolean {
  if (!origin) return true; // non-browser client (mobile, curl, server-to-server)
  if (!isProd) return true; // permissive in dev/test
  return allowedOrigins.has(origin);
}

/** CORS options for the Express app. Disallowed origins simply get no CORS
 *  headers (the browser blocks them) rather than a 500. */
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => callback(null, isOriginAllowed(origin)),
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
