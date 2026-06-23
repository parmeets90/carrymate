import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { sendPush } from '../modules/notifications/push.sender';
import { logger } from '../utils/logger';

/**
 * Dev tool: send a single test push to a registered device.
 * Usage:
 *   ts-node src/scripts/test-push.ts            # latest device that registered a token
 *   ts-node src/scripts/test-push.ts +9198...   # a specific user's phone
 *
 * Uses the real sendPush() path (firebase-admin), so a success here proves the
 * production push pipeline end-to-end.
 */
async function main(): Promise<void> {
  const phone = process.argv[2];
  const user = phone
    ? await prisma.user.findUnique({ where: { phone } })
    : await prisma.user.findFirst({
        where: { fcmToken: { not: null } },
        orderBy: { updatedAt: 'desc' },
      });

  if (!user) {
    logger.warn('No user found. Open the app + sign in (grant notifications) first.');
    return;
  }
  if (!user.fcmToken) {
    logger.warn(`User ${user.phone ?? user.email ?? user.id} has no device token yet. Sign in on the app first.`);
    return;
  }

  logger.info(`Sending test push → ${user.phone ?? user.email ?? user.id} (token …${user.fcmToken.slice(-8)})`);
  await sendPush(
    user.id,
    'CarryMate test 🔔',
    'Push notifications are working! Tap to open.',
    { test: 'true' },
  );
  logger.info('Test push dispatched. Check the device.');
}

main()
  .catch((err) => logger.error('test-push failed', err))
  .finally(() => void prisma.$disconnect());
