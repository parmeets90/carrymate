import { env, isIdfyConfigured } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';

/**
 * IDFY automated-KYC provider (Challenge 02).
 *
 * Submission is fire-and-forget; the result arrives asynchronously on the IDFY
 * webhook (see idfy.webhook.ts). All scoring/retry decisions live in pure
 * functions here so they're testable without the live API.
 */

export const KYC_THRESHOLDS = {
  AUTO_APPROVE_FACE: 92, // ≥ → auto-approve (paired with OCR floor)
  AUTO_APPROVE_OCR: 90,
  MANUAL_FLOOR: 85, // ≥ but below auto → human review
  MAX_SELFIE_ATTEMPTS: 3, // below floor → retry up to this many times
} as const;

export type KycDecision = 'APPROVE' | 'MANUAL' | 'RETRY';

/** Map IDFY confidence scores to an action. Pure + deterministic. */
export function decideFromScores(faceMatchScore: number, ocrConfidence: number): KycDecision {
  if (faceMatchScore >= KYC_THRESHOLDS.AUTO_APPROVE_FACE && ocrConfidence >= KYC_THRESHOLDS.AUTO_APPROVE_OCR) {
    return 'APPROVE';
  }
  if (faceMatchScore >= KYC_THRESHOLDS.MANUAL_FLOOR) return 'MANUAL';
  return 'RETRY';
}

/**
 * Kick off async verification with IDFY. Throws on transport/availability errors
 * so the caller can fall back to manual review (Fix 3). Reference id = userId so
 * the webhook can correlate the result back to the user.
 */
export async function submitVerification(userId: string): Promise<string> {
  if (!isIdfyConfigured) throw new Error('IDFY_NOT_CONFIGURED');

  const docs = await prisma.kycDocument.findMany({
    where: { userId, docType: { in: ['PASSPORT', 'SELFIE'] } },
    select: { docType: true, fileKey: true },
  });
  const passport = docs.find((d) => d.docType === 'PASSPORT')?.fileKey ?? null;
  const selfie = docs.find((d) => d.docType === 'SELFIE')?.fileKey ?? null;

  const res = await fetch(`${env.IDFY_BASE_URL}/v3/tasks/async/verify_with_source/ind_face_match`, {
    method: 'POST',
    headers: {
      'api-key': env.IDFY_API_KEY!,
      'account-id': env.IDFY_ACCOUNT_ID!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task_id: userId,
      group_id: userId,
      data: { document1: passport, selfie },
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`IDFY responded ${res.status}`);
  const body = (await res.json()) as { request_id?: string };
  logger.info(`[idfy] submitted verification for user ${userId} (req ${body.request_id ?? 'n/a'})`);
  return body.request_id ?? userId;
}

/**
 * Parse the confidence scores out of an IDFY webhook payload, defensively
 * (their nesting varies by task). Returns null if no usable scores are present.
 */
export function parseIdfyScores(payload: unknown): { faceMatchScore: number; ocrConfidence: number } | null {
  const p = payload as Record<string, any>;
  const result = p?.result ?? p?.data?.result ?? p;
  const face =
    result?.face_match?.confidence ??
    result?.face_match_score ??
    result?.faceMatchScore ??
    result?.source_output?.face_match?.match_score;
  const ocr =
    result?.ocr?.confidence ??
    result?.ocr_confidence ??
    result?.ocrConfidence ??
    result?.source_output?.ocr?.confidence;
  if (typeof face !== 'number' || typeof ocr !== 'number') return null;
  return { faceMatchScore: face, ocrConfidence: ocr };
}
