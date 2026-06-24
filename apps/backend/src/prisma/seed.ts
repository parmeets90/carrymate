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

  await seedDemoMarketplace();

  logger.info('Seed complete: admin + sender (in review) + traveler + demo marketplace.');
}

// ── Demo marketplace data ─────────────────────────────────────
// 20 verified users with varied roles, plus requests (senders) and trips
// (travelers) so the app looks live. Idempotent: keyed by deterministic phones.

const NAMES = [
  'Aarav Mehta', 'Priya Nair', 'Rohan Gupta', 'Sneha Iyer', 'Karan Singh',
  'Ananya Reddy', 'Vivek Joshi', 'Meera Pillai', 'Aditya Verma', 'Isha Kapoor',
  'Nikhil Rao', 'Diya Shah', 'Arjun Menon', 'Pooja Desai', 'Sahil Khan',
  'Riya Sharma', 'Manav Patel', 'Tara Krishnan', 'Yash Agarwal', 'Neha Bhat',
];

const ORIGINS: { airport: string; city: string }[] = [
  { airport: 'DEL', city: 'Delhi' },
  { airport: 'BOM', city: 'Mumbai' },
  { airport: 'BLR', city: 'Bengaluru' },
  { airport: 'HYD', city: 'Hyderabad' },
  { airport: 'MAA', city: 'Chennai' },
  { airport: 'COK', city: 'Kochi' },
];

const DESTS: { airport: string; city: string }[] = [
  { airport: 'DXB', city: 'Dubai' },
  { airport: 'AUH', city: 'Abu Dhabi' },
  { airport: 'SHJ', city: 'Sharjah' },
];

// Non-prohibited items only (avoids the PROHIBITED_KEYWORDS firewall).
const ITEMS: { category: 'FOOD' | 'DOCUMENTS' | 'CLOTHING' | 'GIFTS' | 'OTHER'; title: string; description: string }[] = [
  { category: 'FOOD', title: 'Homemade mango pickle jars', description: 'Two sealed jars of homemade mango pickle for family.' },
  { category: 'FOOD', title: 'Box of soan papdi sweets', description: 'Festive sweets box, factory sealed, for a relative.' },
  { category: 'DOCUMENTS', title: 'Notarized property papers', description: 'Sealed envelope with notarized property documents.' },
  { category: 'DOCUMENTS', title: 'University transcript envelope', description: 'Official university transcripts in a sealed envelope.' },
  { category: 'CLOTHING', title: 'Silk saree for a wedding', description: 'Handwoven silk saree packed for a cousin’s wedding.' },
  { category: 'CLOTHING', title: 'Woolen sweaters bundle', description: 'Three woolen sweaters for the winter season.' },
  { category: 'GIFTS', title: 'Handmade rakhi gift box', description: 'Decorative rakhi set with dry fruits for a brother.' },
  { category: 'GIFTS', title: 'Brass diya decorative set', description: 'A small brass diya set as a housewarming present.' },
  { category: 'OTHER', title: 'Childrens story books', description: 'A bundle of childrens picture story books in Hindi.' },
  { category: 'OTHER', title: 'Handicraft wall hanging', description: 'A light handcrafted wall hanging, carefully packed.' },
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]!;
}

function daysFromNow(d: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + d);
  return date;
}

async function seedDemoMarketplace(): Promise<void> {
  const roles: Array<'SENDER' | 'TRAVELER'> = [];
  for (let i = 0; i < NAMES.length; i++) {
    roles.push(i % 2 === 0 ? 'SENDER' : 'TRAVELER');
  }

  for (let i = 0; i < NAMES.length; i++) {
    const phone = `+91900000${String(100 + i).padStart(4, '0')}`; // +919000000100…0119
    const role = roles[i]!;
    const user = await prisma.user.upsert({
      where: { phone },
      update: { role },
      create: {
        phone,
        fullName: NAMES[i]!,
        role,
        kycStatus: 'VERIFIED',
        phoneVerified: true,
        ratingAvg: 4 + ((i % 10) / 10), // 4.0–4.9
        ratingCount: (i % 7) + 1,
      },
    });

    const isSender = role === 'SENDER';
    const isTraveler = role === 'TRAVELER';

    // Senders post 1–2 open requests (skip if they already have some).
    if (isSender) {
      const existing = await prisma.deliveryRequest.count({ where: { senderId: user.id } });
      if (existing === 0) {
        const count = (i % 2) + 1;
        for (let j = 0; j < count; j++) {
          const item = pick(ITEMS, i + j);
          const origin = pick(ORIGINS, i + j);
          const dest = pick(DESTS, i);
          await prisma.deliveryRequest.create({
            data: {
              senderId: user.id,
              title: item.title,
              description: item.description,
              category: item.category,
              weightKg: 0.5 + ((i + j) % 4),
              declaredValueInr: 1000 + ((i + j) % 9) * 800,
              itemPhotos: [],
              originCity: origin.city,
              originAirport: origin.airport,
              destinationCountry: 'UAE',
              destinationCity: dest.city,
              recipientName: pick(NAMES, i + 5),
              recipientPhone: `+9715${String(10000000 + i * 137 + j).slice(0, 8)}`,
              recipientAddress: `${100 + i} ${dest.city} Marina, ${dest.city}, UAE`,
              deadlineDate: daysFromNow(10 + ((i + j) % 15)),
              isFragile: (i + j) % 3 === 0,
              status: 'OPEN',
              prohibitedCheckPassed: true,
              expiresAt: daysFromNow(7),
            },
          });
        }
      }
    }

    // Travelers announce an active trip (skip if they already have one).
    if (isTraveler) {
      const existing = await prisma.travelRoute.count({ where: { travelerId: user.id } });
      if (existing === 0) {
        const origin = pick(ORIGINS, i + 2);
        const dest = pick(DESTS, i + 1);
        const departure = daysFromNow(5 + (i % 12));
        await prisma.travelRoute.create({
          data: {
            travelerId: user.id,
            flightNumber: `6E${100 + i}`,
            airline: pick(['IndiGo', 'Emirates', 'Air India', 'Vistara'], i),
            originAirport: origin.airport,
            destinationAirport: dest.airport,
            departureDate: departure,
            arrivalDate: departure,
            capacityKg: 5 + (i % 4) * 3,
            deliveryArea: `${dest.city} city`,
            ticketVerified: true,
            status: 'ACTIVE',
          },
        });
      }
    }
  }

  const [reqs, routes] = await Promise.all([
    prisma.deliveryRequest.count({ where: { status: 'OPEN' } }),
    prisma.travelRoute.count({ where: { status: 'ACTIVE' } }),
  ]);
  logger.info(`Demo marketplace: ${NAMES.length} users, ${reqs} open requests, ${routes} active trips.`);
}

main()
  .catch((err) => {
    logger.error('Seed failed', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
