import { getMessaging } from 'firebase-admin/messaging';
import { isFirebaseConfigured } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { firebaseApp } from '../../lib/firebase';
import { logger } from '../../utils/logger';

/**
 * Push delivery via Firebase Admin (FCM). Uses the same service account as auth —
 * no separate server key. Best-effort: the in-app notification row is the source
 * of truth, so push failures never block the originating action. A stale/invalid
 * device token is cleared so we don't keep retrying it.
 */
export async function sendPush(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });
  if (!user?.fcmToken) return; // no device registered

  if (!isFirebaseConfigured) {
    logger.warn(`🔔 [DEV PUSH] → user ${userId}: ${title} — ${body} (Firebase not configured; not sent)`);
    return;
  }

  // FCM data values must be strings.
  const stringData: Record<string, string> = {};
  for (const [k, v] of Object.entries(data ?? {})) {
    if (v != null) stringData[k] = String(v);
  }

  try {
    await getMessaging(firebaseApp()).send({
      token: user.fcmToken,
      notification: { title, body },
      data: stringData,
      android: { priority: 'high', notification: { sound: 'default' } },
    });
  } catch (err) {
    const code = (err as { code?: string }).code ?? '';
    // Drop tokens FCM says are gone, so we stop pushing to dead installs.
    if (code.includes('registration-token-not-registered') || code.includes('invalid-argument')) {
      await prisma.user.update({ where: { id: userId }, data: { fcmToken: null } }).catch(() => undefined);
      logger.info(`[push] cleared stale FCM token for user ${userId}`);
    } else {
      throw err;
    }
  }
}
