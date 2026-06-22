import type { AuditAction, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from './logger';

interface AuditArgs {
  /** Admin user id, or null/undefined for automated/system actions. */
  actorId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
  ip?: string | null;
}

/**
 * Append an immutable audit record. Audit writes must never break the action
 * they describe, so failures are logged and swallowed.
 */
export async function writeAudit(args: AuditArgs): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: args.actorId ?? null,
        action: args.action,
        entityType: args.entityType,
        entityId: args.entityId ?? null,
        meta: (args.meta ?? undefined) as Prisma.InputJsonValue | undefined,
        ip: args.ip ?? null,
      },
    });
  } catch (err) {
    logger.error(`[audit] failed to record ${args.action}: ${(err as Error).message}`);
  }
}
