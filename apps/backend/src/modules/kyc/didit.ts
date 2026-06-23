import { createHmac, timingSafeEqual } from 'node:crypto';
import { env, isDiditConfigured } from '../../config/env';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';

/**
 * Didit hosted KYC provider.
 * - createSession: opens a verification session for a user; returns the URL the
 *   app sends them to (system browser). vendor_data = our userId so the webhook
 *   can correlate the result back.
 * - verifySignature: HMAC-SHA256 of the raw webhook body against the shared secret.
 * - mapStatus: Didit status → our KYC state.
 */

export interface DiditSession {
  sessionId: string;
  url: string;
}

export async function createDiditSession(userId: string): Promise<DiditSession> {
  if (!isDiditConfigured) {
    throw new AppError(503, 'KYC_PROVIDER_DISABLED', 'Identity verification is not available right now.');
  }
  const res = await fetch(`${env.DIDIT_BASE_URL}/v2/session/`, {
    method: 'POST',
    headers: { 'x-api-key': env.DIDIT_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflow_id: env.DIDIT_WORKFLOW_ID,
      vendor_data: userId,
      // Where Didit returns the user after finishing (we rely on the webhook + polling).
      callback: `${env.DIDIT_BASE_URL}`,
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    logger.error(`[didit] create session ${res.status}: ${text.slice(0, 300)}`);
    throw new AppError(502, 'KYC_SESSION_FAILED', 'Could not start verification. Please try again.');
  }
  const body = (await res.json()) as { session_id?: string; url?: string; session_token?: string };
  const url = body.url;
  if (!url) throw new AppError(502, 'KYC_SESSION_FAILED', 'Verification session was not created.');
  return { sessionId: body.session_id ?? '', url };
}

/** Verify the Didit webhook HMAC signature (raw body) — timing-safe. */
export function verifyDiditSignature(rawBody: Buffer | undefined, signature: string | undefined): boolean {
  if (!env.DIDIT_WEBHOOK_SECRET || !signature || !rawBody) return false;
  const expected = createHmac('sha256', env.DIDIT_WEBHOOK_SECRET).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type KycOutcome = 'VERIFIED' | 'IN_REVIEW' | 'PENDING' | 'IGNORE';

/** Map a Didit session status to our KYC outcome. Never hard-rejects (per A2). */
export function mapDiditStatus(status: string | undefined): KycOutcome {
  switch ((status ?? '').toLowerCase().replace(/\s+/g, '_')) {
    case 'approved':
      return 'VERIFIED';
    case 'declined':
    case 'in_review':
    case 'kyc_expired':
      return 'IN_REVIEW'; // a human makes the final call
    case 'in_progress':
    case 'not_started':
      return 'PENDING';
    default:
      return 'IGNORE'; // abandoned/expired/unknown → leave state, timeout watcher handles
  }
}
