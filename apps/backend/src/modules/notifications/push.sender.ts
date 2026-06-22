import { env, isPushConfigured } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';

/**
 * Best-effort push delivery via FCM (legacy HTTP API).
 *
 * Scaffolded like the OTP sender: when FCM_SERVER_KEY is unset (dev / not-yet-provisioned),
 * we log instead of sending so the rest of the notification flow works unchanged.
 * The in-app notification row is always the source of truth; push is additive.
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
  if (!user?.fcmToken) return; // no device registered → nothing to do

  if (!isPushConfigured) {
    logger.warn(`🔔 [DEV PUSH] → user ${userId}: ${title} — ${body} (FCM not configured; not sent)`);
    return;
  }

  const res = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      Authorization: `key=${env.FCM_SERVER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: user.fcmToken,
      notification: { title, body },
      data: data ?? {},
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`FCM responded ${res.status}`);
  }
}
