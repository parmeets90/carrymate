import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { hashPassword } from '../utils/crypto';

/**
 * Database seed. Kept current each phase so admin + apps are always testable.
 * Admin logs in with email + password (set ADMIN_EMAIL / ADMIN_PASSWORD).
 */
async function main(): Promise<void> {
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@carrymate.in').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
  if (!process.env.ADMIN_PASSWORD) {
    logger.warn('⚠️  ADMIN_PASSWORD not set — using default "ChangeMe123!". Change it.');
  }
  const passwordHash = hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { phone: '+910000000000' },
    update: { email: adminEmail, passwordHash, role: 'ADMIN', status: 'ACTIVE' },
    create: {
      phone: '+910000000000',
      email: adminEmail,
      fullName: 'CarryMate Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
      passwordHash,
    },
  });
  logger.info(`Seeded admin: ${admin.email} (login with email + password)`);

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
