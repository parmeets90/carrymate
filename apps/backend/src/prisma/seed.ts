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

  // A sender awaiting KYC review (populates the admin queue).
  const sender = await prisma.user.upsert({
    where: { phone: '+919876500001' },
    update: {},
    create: {
      phone: '+919876500001',
      fullName: 'Anjali Sharma',
      role: 'SENDER',
      kycStatus: 'IN_REVIEW',
      phoneVerified: true,
    },
  });
  await prisma.kycDocument.upsert({
    where: { userId_docType: { userId: sender.id, docType: 'AADHAAR' } },
    update: {},
    create: {
      userId: sender.id,
      docType: 'AADHAAR',
      docNumberMasked: '********1234',
      status: 'PENDING',
      provider: 'manual',
    },
  });

  // A verified traveler.
  await prisma.user.upsert({
    where: { phone: '+919876500002' },
    update: {},
    create: {
      phone: '+919876500002',
      fullName: 'Vikram Rao',
      role: 'TRAVELER',
      kycStatus: 'VERIFIED',
      phoneVerified: true,
    },
  });

  logger.info('Seed complete: 1 admin, 1 sender (in review), 1 traveler.');
}

main()
  .catch((err) => {
    logger.error('Seed failed', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
