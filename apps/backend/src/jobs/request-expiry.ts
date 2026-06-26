import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { createNotification } from '../modules/notifications/notifications.service';
import { NotificationType } from '@carrymate/shared';

/**
 * Challenge 05, Fix 1 — request lifecycle nudges (setInterval, hourly).
 *  - Requests within 48h of expiry get a one-time "expiring soon" reminder.
 *  - Past-due OPEN/BIDDING requests are moved to EXPIRED (re-listable for free).
 */
const REMINDER_WINDOW_MS = 48 * 3_600_000;

export async function runRequestExpirySweep(): Promise<{ expired: number; reminded: number }> {
  const now = new Date();
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);

  // 1. Expire un-matched requests past their listing life (expiresAt) OR whose
  //    delivery deadline has already passed. A past-deadline request can never
  //    match (matching requires deadline >= departure), so it must not linger as
  //    a "live" OPEN listing.
  const due = await prisma.deliveryRequest.findMany({
    where: {
      status: { in: ['OPEN', 'BIDDING'] },
      OR: [{ expiresAt: { lt: now } }, { deadlineDate: { lt: startToday } }],
    },
    select: { id: true, senderId: true, title: true },
  });
  for (const r of due) {
    await prisma.deliveryRequest.update({ where: { id: r.id }, data: { status: 'EXPIRED' } });
    await createNotification({
      userId: r.senderId,
      type: NotificationType.SYSTEM,
      title: 'Request expired',
      body: `“${r.title}” expired without a match. Re-list it free to try again.`,
      data: { requestId: r.id },
    });
  }

  // 2. One-time reminder for requests expiring within 48h.
  const soon = await prisma.deliveryRequest.findMany({
    where: {
      status: { in: ['OPEN', 'BIDDING'] },
      expiryReminderSentAt: null,
      expiresAt: { gte: now, lt: new Date(now.getTime() + REMINDER_WINDOW_MS) },
    },
    select: { id: true, senderId: true, title: true },
  });
  for (const r of soon) {
    await prisma.deliveryRequest.update({ where: { id: r.id }, data: { expiryReminderSentAt: now } });
    await createNotification({
      userId: r.senderId,
      type: NotificationType.SYSTEM,
      title: 'Request expiring soon',
      body: `“${r.title}” expires in under 48 hours. Tap to review or extend it.`,
      data: { requestId: r.id },
    });
  }

  if (due.length || soon.length) {
    logger.info(`[expiry] expired ${due.length}, reminded ${soon.length}`);
  }
  return { expired: due.length, reminded: soon.length };
}
