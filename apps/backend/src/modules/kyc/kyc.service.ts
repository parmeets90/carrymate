import type { KycDocType } from '@carrymate/shared';
import type { KycStatusResult } from '@carrymate/shared';
import { NotificationType } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { isIdfyConfigured } from '../../config/env';
import { hmac } from '../../utils/crypto';
import { logger } from '../../utils/logger';
import { writeAudit } from '../../utils/audit';
import { createNotification } from '../notifications/notifications.service';
import { submitVerification, decideFromScores, KYC_THRESHOLDS } from './idfy';
import { createDiditSession, mapDiditStatus } from './didit';
import { toKycDocumentDto } from './kyc.serializer';

interface SubmitDocInput {
  docType: KycDocType;
  fileKey?: string;
  docNumber?: string;
}

function maskTail(value: string, visible = 4): string {
  const trimmed = value.replace(/\s+/g, '');
  if (trimmed.length <= visible) return trimmed;
  return `${'*'.repeat(trimmed.length - visible)}${trimmed.slice(-visible)}`;
}

/**
 * Submit (or replace) a KYC document and move the user into review.
 *
 * Phase 1 uses a manual review path: documents land as PENDING and an admin
 * approves/rejects them. When ENABLE_AUTO_KYC is on (and IDFY is configured),
 * this is where automated verification will be kicked off.
 */
export async function submitKycDocument(
  userId: string,
  input: SubmitDocInput,
): Promise<KycStatusResult> {
  const docNumberHash = input.docNumber ? hmac(input.docNumber) : null;
  const docNumberMasked = input.docNumber ? maskTail(input.docNumber) : null;

  // Guard against the same government ID being reused across accounts.
  if (docNumberHash) {
    const clash = await prisma.kycDocument.findFirst({
      where: { docNumberHash, userId: { not: userId } },
      select: { id: true },
    });
    if (clash) {
      logger.warn(`KYC duplicate doc number attempt by user ${userId} (${input.docType})`);
      await writeAudit({
        action: 'KYC_DUPLICATE_FLAGGED',
        entityType: 'user',
        entityId: userId,
        meta: { docType: input.docType },
      });
    }
  }

  await prisma.kycDocument.upsert({
    where: { userId_docType: { userId, docType: input.docType } },
    update: {
      fileKey: input.fileKey ?? null,
      docNumberHash,
      docNumberMasked,
      status: 'PENDING',
      rejectReason: null,
      reviewedAt: null,
      reviewedById: null,
      provider: 'manual',
    },
    create: {
      userId,
      docType: input.docType,
      fileKey: input.fileKey ?? null,
      docNumberHash,
      docNumberMasked,
      status: 'PENDING',
      provider: 'manual',
    },
  });

  if (isIdfyConfigured) {
    // Automated path: the selfie is the final step that kicks off verification.
    if (input.docType === 'SELFIE') {
      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus: 'VERIFYING', kycSubmittedAt: new Date(), kycFailureReason: null },
      });
      try {
        await submitVerification(userId);
      } catch (err) {
        // Fix 3 — IDFY down/unavailable → graceful fallback to manual review.
        logger.error(`[KYC] IDFY submit failed for ${userId}: ${(err as Error).message}`);
        await prisma.user.update({
          where: { id: userId },
          data: { kycStatus: 'IN_REVIEW', kycFailureReason: 'IDFY_UNAVAILABLE' },
        });
      }
    }
    // Non-selfie docs are stored but don't move the user into a queue yet.
  } else {
    // Manual path: move the user into the admin review queue.
    await prisma.user.updateMany({
      where: { id: userId, kycStatus: { in: ['PENDING', 'REJECTED'] } },
      data: { kycStatus: 'IN_REVIEW' },
    });
  }

  return getKycStatus(userId);
}

/**
 * Apply an IDFY async result (Challenge 02 + B1 Fix 2). Never auto-rejects on a
 * face-match miss alone — it retries up to a cap, then routes to manual review.
 */
export async function applyIdfyResult(
  userId: string,
  scores: { faceMatchScore: number; ocrConfidence: number },
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  // Ignore late results for an already-decided user.
  if (user.kycStatus === 'VERIFIED' || user.kycStatus === 'IN_REVIEW') return;

  // Stash the scores on the selfie doc for the admin reviewer.
  await prisma.kycDocument.updateMany({
    where: { userId, docType: 'SELFIE' },
    data: { provider: 'idfy', meta: scores as never },
  });

  const decision = decideFromScores(scores.faceMatchScore, scores.ocrConfidence);

  if (decision === 'APPROVE') {
    await prisma.$transaction([
      prisma.kycDocument.updateMany({
        where: { userId },
        data: { status: 'APPROVED', reviewedAt: new Date(), rejectReason: null },
      }),
      prisma.user.update({ where: { id: userId }, data: { kycStatus: 'VERIFIED', kycFailureReason: null } }),
    ]);
    logger.info(`[KYC] auto-approved ${userId} (face ${scores.faceMatchScore}, ocr ${scores.ocrConfidence})`);
    await createNotification({
      userId,
      type: NotificationType.KYC_VERIFIED,
      title: 'Identity verified ✅',
      body: 'Your KYC is approved. You can now send and carry items on CarryMate.',
    });
    return;
  }

  if (decision === 'MANUAL') {
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'IN_REVIEW', kycFailureReason: `Low confidence (face ${scores.faceMatchScore})` },
    });
    await createNotification({
      userId,
      type: NotificationType.SYSTEM,
      title: 'Verifying your details',
      body: 'Our team is reviewing your documents — we’ll get back to you within 2 hours.',
    });
    return;
  }

  // RETRY — face match below the floor.
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { selfieAttemptCount: { increment: 1 } },
  });
  if (updated.selfieAttemptCount >= KYC_THRESHOLDS.MAX_SELFIE_ATTEMPTS) {
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'IN_REVIEW', kycFailureReason: 'FACE_MATCH_FAILED_MAX_RETRIES' },
    });
    await createNotification({
      userId,
      type: NotificationType.SYSTEM,
      title: 'Verifying your details',
      body: 'We couldn’t auto-verify your selfie. Our team will review it within 2 hours.',
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'PENDING', kycFailureReason: 'FACE_MATCH_FAILED' },
    });
    await createNotification({
      userId,
      type: NotificationType.SYSTEM,
      title: 'Selfie didn’t match',
      body: 'Please retake your selfie in good lighting, facing the camera, without glasses.',
    });
  }
}

/** Start a Didit hosted verification: returns the URL the app opens. */
export async function startKycVerification(userId: string): Promise<{ url: string }> {
  const session = await createDiditSession(userId);
  await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: 'VERIFYING', kycSubmittedAt: new Date(), kycFailureReason: null },
  });
  logger.info(`[didit] session started for user ${userId} (${session.sessionId})`);
  return { url: session.url };
}

/** Apply a Didit webhook result. Approved → VERIFIED; In Review/Declined → manual queue. */
export async function applyDiditResult(userId: string, status: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.kycStatus === 'VERIFIED') return;

  const outcome = mapDiditStatus(status);
  if (outcome === 'IGNORE') return;

  if (outcome === 'VERIFIED') {
    await prisma.user.update({ where: { id: userId }, data: { kycStatus: 'VERIFIED', kycFailureReason: null } });
    logger.info(`[didit] ${userId} → VERIFIED`);
    await createNotification({
      userId,
      type: NotificationType.KYC_VERIFIED,
      title: 'Identity verified ✅',
      body: 'Your KYC is approved. You can now send and carry items on CarryMate.',
    });
    return;
  }

  if (outcome === 'IN_REVIEW') {
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'IN_REVIEW', kycFailureReason: `Didit: ${status}` },
    });
    await createNotification({
      userId,
      type: NotificationType.SYSTEM,
      title: 'Verifying your details',
      body: 'Our team is reviewing your verification — we’ll get back to you shortly.',
    });
    return;
  }

  // PENDING (in progress) — make sure we're showing the verifying state.
  if (user.kycStatus !== 'VERIFYING') {
    await prisma.user.update({ where: { id: userId }, data: { kycStatus: 'VERIFYING', kycSubmittedAt: new Date() } });
  }
}

export async function getKycStatus(userId: string): Promise<KycStatusResult> {
  const [user, documents] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { kycStatus: true } }),
    prisma.kycDocument.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
  ]);

  return {
    kycStatus: user.kycStatus,
    documents: documents.map(toKycDocumentDto),
  };
}
