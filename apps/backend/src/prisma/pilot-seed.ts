import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

/**
 * Closed-pilot seed — the single Delhi → Dubai corridor (PLAN.md Phase 7).
 *
 * Solves the cold-start "empty marketplace" problem by seeding vetted SUPPLY
 * first: 50 KYC-verified, flight-confirmed travellers each with one DEL→DXB trip
 * across the next ~4 weeks, plus a handful of open sender requests so the board
 * looks two-sided from day one.
 *
 * Safe to run repeatedly (idempotent — keyed by deterministic phones) and easy to
 * remove: every pilot account uses a +9170… (traveller) or +9171… (sender)
 * prefix. Cleanup query is printed at the end.
 *
 * Run:  npm run pilot:seed -w @carrymate/backend
 */

const PILOT_TRAVELER_COUNT = 50;
const PILOT_SENDER_COUNT = 12;

// 50 distinct, realistic Indian names for the pilot travellers.
const TRAVELER_NAMES = [
  'Aarav Mehta', 'Priya Nair', 'Rohan Gupta', 'Sneha Iyer', 'Karan Singh',
  'Ananya Reddy', 'Vivek Joshi', 'Meera Pillai', 'Aditya Verma', 'Isha Kapoor',
  'Nikhil Rao', 'Diya Shah', 'Arjun Menon', 'Pooja Desai', 'Sahil Khan',
  'Riya Sharma', 'Manav Patel', 'Tara Krishnan', 'Yash Agarwal', 'Neha Bhat',
  'Dev Saxena', 'Kavya Naidu', 'Aryan Malhotra', 'Sara Chopra', 'Rahul Bose',
  'Anika Sethi', 'Kabir Anand', 'Mira Dutta', 'Ishaan Roy', 'Nisha Pandey',
  'Veer Chauhan', 'Aisha Qureshi', 'Reyansh Jain', 'Lakshmi Menon', 'Om Prakash',
  'Tanvi Rana', 'Harsh Vyas', 'Zoya Ahmed', 'Krish Bansal', 'Naina Kohli',
  'Parth Shetty', 'Ira Goswami', 'Shaurya Nanda', 'Avni Trivedi', 'Dhruv Sinha',
  'Myra Fernandes', 'Atharv Kulkarni', 'Saanvi Rastogi', 'Laksh Bhatia', 'Gauri Mathur',
];

const SENDER_NAMES = [
  'Anjali Sharma', 'Rakesh Khanna', 'Deepa Menon', 'Suresh Iyer', 'Fatima Sheikh',
  'Vinod Aggarwal', 'Shalini Rao', 'Imran Ali', 'Geeta Pillai', 'Mohit Jindal',
  'Sunita Bose', 'Ramesh Nair',
];

// Realistic DEL→DXB carriers + flight numbers.
const FLIGHTS = [
  { airline: 'Emirates', no: 'EK511' },
  { airline: 'Emirates', no: 'EK513' },
  { airline: 'Emirates', no: 'EK515' },
  { airline: 'flydubai', no: 'FZ438' },
  { airline: 'IndiGo', no: '6E1407' },
  { airline: 'IndiGo', no: '6E1431' },
  { airline: 'Air India', no: 'AI915' },
  { airline: 'Vistara', no: 'UK243' },
];

const DUBAI_AREAS = [
  'Dubai Marina', 'Deira', 'Bur Dubai', 'JLT', 'Business Bay',
  'Al Barsha', 'Downtown Dubai', 'Jumeirah', 'International City', 'Karama',
];

const ITEMS: { category: 'FOOD' | 'DOCUMENTS' | 'CLOTHING' | 'GIFTS' | 'OTHER'; title: string; description: string }[] = [
  { category: 'FOOD', title: 'Homemade mango pickle jars', description: 'Two sealed jars of homemade mango pickle for family.' },
  { category: 'FOOD', title: 'Box of soan papdi sweets', description: 'Festive sweets box, factory sealed, for a relative.' },
  { category: 'DOCUMENTS', title: 'Notarized property papers', description: 'Sealed envelope with notarized property documents.' },
  { category: 'CLOTHING', title: 'Silk saree for a wedding', description: 'Handwoven silk saree packed for a cousin’s wedding.' },
  { category: 'GIFTS', title: 'Handmade rakhi gift box', description: 'Decorative rakhi set with dry fruits for a brother.' },
  { category: 'OTHER', title: 'Childrens story books', description: 'A bundle of childrens picture story books in Hindi.' },
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

async function seedTravelers(): Promise<number> {
  let trips = 0;
  for (let i = 0; i < PILOT_TRAVELER_COUNT; i++) {
    const phone = `+9170${String(i + 1).padStart(8, '0')}`; // +917000000001 … +917000000050
    const user = await prisma.user.upsert({
      where: { phone },
      update: { role: 'TRAVELER', kycStatus: 'VERIFIED', status: 'ACTIVE' },
      create: {
        phone,
        fullName: TRAVELER_NAMES[i]!,
        role: 'TRAVELER',
        kycStatus: 'VERIFIED',
        phoneVerified: true,
        ratingAvg: Number((4.2 + (i % 9) * 0.09).toFixed(2)), // 4.2–5.0
        ratingCount: (i % 35) + 3,
      },
    });

    const existing = await prisma.travelRoute.count({ where: { travelerId: user.id } });
    if (existing === 0) {
      const flight = pick(FLIGHTS, i);
      const departure = daysFromNow(2 + (i % 28)); // spread across ~4 weeks
      await prisma.travelRoute.create({
        data: {
          travelerId: user.id,
          flightNumber: flight.no,
          airline: flight.airline,
          originAirport: 'DEL',
          destinationAirport: 'DXB',
          departureDate: departure,
          arrivalDate: departure,
          capacityKg: 3 + (i % 5) * 3, // 3–15kg
          deliveryArea: `${pick(DUBAI_AREAS, i)}, Dubai`,
          // ~1 in 10 left unverified so the admin flight-verify queue is realistic.
          ticketVerified: i % 10 !== 0,
          status: 'ACTIVE',
        },
      });
      trips += 1;
    }
  }
  return trips;
}

async function seedSenders(): Promise<number> {
  let requests = 0;
  for (let i = 0; i < PILOT_SENDER_COUNT; i++) {
    const phone = `+9171${String(i + 1).padStart(8, '0')}`; // +917100000001 …
    const user = await prisma.user.upsert({
      where: { phone },
      update: { role: 'SENDER', kycStatus: 'VERIFIED', status: 'ACTIVE' },
      create: {
        phone,
        fullName: SENDER_NAMES[i]!,
        role: 'SENDER',
        kycStatus: 'VERIFIED',
        phoneVerified: true,
        ratingAvg: Number((4.3 + (i % 7) * 0.1).toFixed(2)),
        ratingCount: (i % 12) + 1,
      },
    });

    const existing = await prisma.deliveryRequest.count({ where: { senderId: user.id } });
    if (existing === 0) {
      const item = pick(ITEMS, i);
      await prisma.deliveryRequest.create({
        data: {
          senderId: user.id,
          title: item.title,
          description: item.description,
          category: item.category,
          weightKg: 0.5 + (i % 4),
          declaredValueInr: 1200 + (i % 9) * 700,
          itemPhotos: [],
          originCity: 'Delhi',
          originAirport: 'DEL',
          destinationCountry: 'UAE',
          destinationCity: 'Dubai',
          recipientName: pick(TRAVELER_NAMES, i + 13),
          recipientPhone: `+9715${String(20000000 + i * 311).slice(0, 8)}`,
          recipientAddress: `${120 + i} ${pick(DUBAI_AREAS, i)}, Dubai, UAE`,
          deadlineDate: daysFromNow(12 + (i % 18)),
          isFragile: i % 3 === 0,
          status: 'OPEN',
          prohibitedCheckPassed: true,
          expiresAt: daysFromNow(10),
        },
      });
      requests += 1;
    }
  }
  return requests;
}

async function main(): Promise<void> {
  logger.info('Seeding Delhi → Dubai closed pilot…');
  const trips = await seedTravelers();
  const requests = await seedSenders();

  const [activeTrips, openReqs] = await Promise.all([
    prisma.travelRoute.count({ where: { originAirport: 'DEL', destinationAirport: 'DXB', status: 'ACTIVE' } }),
    prisma.deliveryRequest.count({ where: { originAirport: 'DEL', destinationCity: 'Dubai', status: 'OPEN' } }),
  ]);

  logger.info(`Pilot seed complete: +${trips} trips, +${requests} requests this run.`);
  logger.info(`DEL→DXB now live: ${activeTrips} active trips, ${openReqs} open requests.`);
  logger.info('Remove pilot data later with: DELETE FROM users WHERE phone LIKE \'+9170%\' OR phone LIKE \'+9171%\';');
}

main()
  .catch((err) => {
    logger.error('Pilot seed failed', err);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
