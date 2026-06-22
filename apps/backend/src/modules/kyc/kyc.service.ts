import type { KycDocType } from '@carrymate/shared';
import type { KycStatusResult } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { hmac } from '../../utils/crypto';
import { logger } from '../../utils/logger';
import { writeAudit } from '../../utils/audit';
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

  // Move the user into review unless they're already verified.
  await prisma.user.updateMany({
    where: { id: userId, kycStatus: { in: ['PENDING', 'REJECTED'] } },
    data: { kycStatus: 'IN_REVIEW' },
  });

  if (env.ENABLE_AUTO_KYC) {
    // Extension point: trigger IDFY verification here when configured.
    logger.info(`[KYC] auto-KYC flag on for user ${userId} (IDFY integration pending)`);
  }

  return getKycStatus(userId);
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
