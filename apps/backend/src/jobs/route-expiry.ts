import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

/**
 * Challenge 09, Layer 3 — departure-date lock.
 *
 * Once a trip's departure date has passed, it can no longer accept new bids:
 * we move ACTIVE routes past departure to EXPIRED. setInterval-based (no BullMQ).
 * In-flight orders are unaffected — they progress through the order FSM.
 */
export async function runRouteExpirySweep(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await prisma.travelRoute.updateMany({
    where: { status: 'ACTIVE', departureDate: { lt: today } },
    data: { status: 'EXPIRED' },
  });
  if (result.count) logger.info(`[route-expiry] deactivated ${result.count} departed trip(s)`);
  return result.count;
}
