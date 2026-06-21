import { PrismaClient } from '@prisma/client';
import { isProd } from '../config/env';

/**
 * Single shared PrismaClient. Reused across hot reloads in dev to avoid
 * exhausting database connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error', 'warn'] : ['error', 'warn'],
  });

if (!isProd) globalForPrisma.prisma = prisma;
