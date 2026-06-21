import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

/**
 * Database seed. Kept current each phase so admin + apps are always testable.
 * Phase 0: a single admin user placeholder. Expanded per phase.
 */
async function main(): Promise<void> {
  const admin = await prisma.user.upsert({
    where: { phone: '+910000000000' },
    update: {},
    create: {
      phone: '+910000000000',
      email: 'admin@carrymate.in',
      fullName: 'CarryMate Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
    },
  });

  logger.info(`Seeded admin user: ${admin.id}`);
}

main()
  .catch((err) => {
    logger.error('Seed failed', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
