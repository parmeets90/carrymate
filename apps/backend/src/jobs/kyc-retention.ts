import { KYC_IMAGE_RETENTION_DAYS } from '@carrymate/shared';
import { prisma } from '../lib/prisma';
import { storage } from '../lib/storage';
import { logger } from '../utils/logger';
import { writeAudit } from '../utils/audit';
import { isStorageConfigured } from '../config/env';

/**
 * DPDP data minimization — purge raw KYC ID images once they've served their
 * purpose. For APPROVED documents reviewed longer than the retention window, we
 * delete the underlying storage object and null its fileKey, while keeping the
 * row (status + masked number) as durable proof-of-verification for audit.
 * setInterval-based (no BullMQ), idempotent, safe to run repeatedly.
 */
export async function runKycRetentionSweep(): Promise<number> {
  if (!isStorageConfigured) return 0;

  const cutoff = new Date(Date.now() - KYC_IMAGE_RETENTION_DAYS * 86_400_000);
  const due = await prisma.kycDocument.findMany({
    where: { status: 'APPROVED', fileKey: { not: null }, reviewedAt: { lt: cutoff } },
    select: { id: true, userId: true, fileKey: true },
    take: 200, // bounded batch per tick
  });
  if (!due.length) return 0;

  let purged = 0;
  for (const doc of due) {
    try {
      await storage().remove([doc.fileKey!]);
      await prisma.kycDocument.update({ where: { id: doc.id }, data: { fileKey: null } });
      purged += 1;
    } catch (e) {
      logger.error(`[kyc-retention] purge failed for doc ${doc.id}: ${(e as Error).message}`);
    }
  }

  if (purged) {
    logger.info(`[kyc-retention] purged ${purged} raw KYC image(s) past ${KYC_IMAGE_RETENTION_DAYS}d`);
    await writeAudit({ action: 'KYC_DOCS_PURGED', entityType: 'kyc', meta: { count: purged } });
  }
  return purged;
}
