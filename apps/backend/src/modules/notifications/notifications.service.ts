import type { NotificationDto, Paginated } from '@carrymate/shared';
import type { NotificationType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { sendPush } from './push.sender';

interface CreateNotificationArgs {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Create an in-app notification (the source of truth) and best-effort fan it out
 * to external channels (push for now). External dispatch failures never block the
 * in-app record or the caller's transaction — we log and move on.
 */
export async function createNotification(args: CreateNotificationArgs): Promise<void> {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: args.userId,
        type: args.type,
        title: args.title,
        body: args.body,
        data: (args.data ?? undefined) as never,
      },
    });
    // Fire-and-forget push; do not await-block the caller's flow.
    void sendPush(args.userId, args.title, args.body, args.data).catch((err) =>
      logger.warn(`[notifications] push dispatch failed: ${(err as Error).message}`),
    );
    logger.info(`[notifications] ${args.type} → user ${args.userId} (${notification.id})`);
  } catch (err) {
    // Notifications are non-critical; never let them break the originating action.
    logger.error(`[notifications] failed to create ${args.type}: ${(err as Error).message}`);
  }
}

function toDto(n: {
  id: string;
  type: string;
  title: string;
  body: string;
  data: unknown;
  readAt: Date | null;
  createdAt: Date;
}): NotificationDto {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    data: (n.data as Record<string, unknown> | null) ?? null,
    read: n.readAt !== null,
    createdAt: n.createdAt.toISOString(),
  };
}

export async function listNotifications(
  userId: string,
  page = 1,
  pageSize = 20,
): Promise<Paginated<NotificationDto>> {
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { items: items.map(toDto), page, pageSize, total };
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function markRead(userId: string, notificationId: string): Promise<void> {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
  if (result.count === 0) {
    // Either already read or not owned — surface a clear 404 only when it doesn't exist.
    const exists = await prisma.notification.findFirst({ where: { id: notificationId, userId } });
    if (!exists) throw AppError.notFound('Notification not found');
  }
}

export async function markAllRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return result.count;
}
