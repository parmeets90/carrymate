import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { createNotification } from '../modules/notifications/notifications.service';
import { NotificationType } from '@carrymate/shared';

/**
 * Challenge 02, Fix 1 — IDFY webhook timeout watcher.
 *
 * If a verification is still VERIFYING past the grace window (the IDFY webhook
 * never arrived), route the user to manual review so they're never stuck in
 * limbo. setInterval-based (no BullMQ in this stack).
 */
const TIMEOUT_MS = 10 * 60_000;

export async function runKycTimeoutSweep(): Promise<number> {
  const stuck = await prisma.user.findMany({
    where: { kycStatus: 'VERIFYING', kycSubmittedAt: { lt: new Date(Date.now() - TIMEOUT_MS) } },
    select: { id: true },
  });
  if (!stuck.length) return 0;

  for (const u of stuck) {
    await prisma.user.update({
      where: { id: u.id },
      data: { kycStatus: 'IN_REVIEW', kycFailureReason: 'IDFY_TIMEOUT' },
    });
    await createNotification({
      userId: u.id,
      type: NotificationType.SYSTEM,
      title: 'Verifying your details',
      body: 'We’re verifying your details — our team will get back to you within 2 hours.',
    });
  }
  logger.info(`[kyc] timeout sweep moved ${stuck.length} stuck verification(s) to manual review`);
  return stuck.length;
}
