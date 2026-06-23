import type {
  DeliveryRequestDto,
  DeliveryRequestSummary,
  RequestInsights,
  MarketplacePulse,
} from '@carrymate/shared';
import { MAX_ACTIVE_REQUESTS_PER_SENDER, MIN_DEADLINE_DAYS, REQUEST_EXPIRY_DAYS } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import {
  checkProhibited,
  assertDestinationCity,
  AIRPORT_TO_CITY,
} from '../../utils/marketplace';

/** UAE destination city → its airports (reverse of AIRPORT_TO_CITY). */
const CITY_TO_AIRPORTS: Record<string, string[]> = Object.entries(AIRPORT_TO_CITY).reduce(
  (acc, [airport, city]) => {
    (acc[city] ??= []).push(airport);
    return acc;
  },
  {} as Record<string, string[]>,
);
import { INDIA_ORIGIN_AIRPORTS } from '@carrymate/shared';
import { toRequestDto, toRequestSummary } from '../marketplace/serializers';
import type { CreateRequestInput, UpdateRequestInput } from './requests.validators';

const EDITABLE_STATUSES = ['OPEN', 'BIDDING'] as const;

const ACTIVE_STATUSES = ['OPEN', 'BIDDING', 'MATCHED', 'IN_TRANSIT'] as const;

export async function createRequest(
  senderId: string,
  input: CreateRequestInput,
  ip?: string,
): Promise<DeliveryRequestDto> {
  if (!(INDIA_ORIGIN_AIRPORTS as readonly string[]).includes(input.originAirport)) {
    throw new AppError(400, 'INVALID_AIRPORT', `Unsupported origin airport: ${input.originAirport}`);
  }
  assertDestinationCity(input.destinationCity);

  // Context-aware prohibited-item firewall (Challenge 08).
  const prohibited = checkProhibited(input.title, input.description, input.category);
  // Blocked + not asking for review → reject with a specific, actionable reason.
  if (prohibited.blocked && !input.requestReview) {
    throw new AppError(
      400,
      'ITEM_PROHIBITED',
      `This looks like ${prohibited.reason} (matched “${prohibited.matchedWord}”). If it isn’t, rephrase or request a manual review.`,
      { item: [prohibited.reason ?? 'prohibited'] },
    );
  }

  const minDeadline = new Date();
  minDeadline.setHours(0, 0, 0, 0);
  minDeadline.setDate(minDeadline.getDate() + MIN_DEADLINE_DAYS);
  if (input.deadlineDate < minDeadline) {
    throw new AppError(
      400,
      'DEADLINE_TOO_SOON',
      `Deadline must be at least ${MIN_DEADLINE_DAYS} days away.`,
    );
  }

  const activeCount = await prisma.deliveryRequest.count({
    where: { senderId, status: { in: [...ACTIVE_STATUSES] } },
  });
  if (activeCount >= MAX_ACTIVE_REQUESTS_PER_SENDER) {
    throw new AppError(
      409,
      'MAX_REQUESTS_EXCEEDED',
      `You can have at most ${MAX_ACTIVE_REQUESTS_PER_SENDER} active requests.`,
    );
  }

  const expiresAt = new Date(Date.now() + REQUEST_EXPIRY_DAYS * 86_400_000);
  // A blocked item the sender escalated goes to admin review, not live.
  const flaggedForReview = prohibited.blocked && input.requestReview === true;

  const request = await prisma.deliveryRequest.create({
    data: {
      senderId,
      title: input.title,
      description: input.description,
      category: input.category,
      weightKg: input.weightKg,
      declaredValueInr: input.declaredValueInr,
      itemPhotos: input.itemPhotos,
      originCity: input.originCity,
      originAirport: input.originAirport,
      destinationCity: input.destinationCity,
      recipientName: input.recipientName,
      recipientPhone: input.recipientPhone,
      recipientAddress: input.recipientAddress,
      deadlineDate: input.deadlineDate,
      isFragile: input.isFragile,
      senderNotes: input.senderNotes ?? null,
      prohibitedCheckPassed: !flaggedForReview,
      status: flaggedForReview ? 'PENDING_REVIEW' : 'OPEN',
      declarationAcceptedAt: new Date(),
      declarationIp: ip ?? null,
      expiresAt,
    },
  });

  return toRequestDto(request);
}

export async function listMyRequests(senderId: string): Promise<DeliveryRequestDto[]> {
  const requests = await prisma.deliveryRequest.findMany({
    where: { senderId },
    orderBy: { createdAt: 'desc' },
  });
  return requests.map(toRequestDto);
}

async function ownRequestOrThrow(requestId: string, senderId: string) {
  const request = await prisma.deliveryRequest.findUnique({ where: { id: requestId } });
  if (!request || request.senderId !== senderId) throw AppError.notFound('Request not found');
  return request;
}

/** Edit a request — only before it's matched, and re-running the safety checks. */
export async function updateRequest(
  requestId: string,
  senderId: string,
  input: UpdateRequestInput,
): Promise<DeliveryRequestDto> {
  const request = await ownRequestOrThrow(requestId, senderId);
  if (!(EDITABLE_STATUSES as readonly string[]).includes(request.status)) {
    throw new AppError(409, 'NOT_EDITABLE', 'Only open requests can be edited.');
  }

  const title = input.title ?? request.title;
  const description = input.description ?? request.description;
  const prohibited = checkProhibited(title, description, input.category ?? request.category);
  if (prohibited.blocked) {
    throw new AppError(
      400,
      'ITEM_PROHIBITED',
      `This looks like ${prohibited.reason} (matched “${prohibited.matchedWord}”). Please rephrase.`,
      { item: [prohibited.reason ?? 'prohibited'] },
    );
  }

  if (input.originAirport && !(INDIA_ORIGIN_AIRPORTS as readonly string[]).includes(input.originAirport)) {
    throw new AppError(400, 'INVALID_AIRPORT', `Unsupported origin airport: ${input.originAirport}`);
  }
  if (input.destinationCity) assertDestinationCity(input.destinationCity);
  if (input.deadlineDate) {
    const minDeadline = new Date();
    minDeadline.setHours(0, 0, 0, 0);
    minDeadline.setDate(minDeadline.getDate() + MIN_DEADLINE_DAYS);
    if (input.deadlineDate < minDeadline) {
      throw new AppError(400, 'DEADLINE_TOO_SOON', `Deadline must be at least ${MIN_DEADLINE_DAYS} days away.`);
    }
  }

  const updated = await prisma.deliveryRequest.update({
    where: { id: requestId },
    data: { ...input, senderNotes: input.senderNotes ?? undefined },
  });
  return toRequestDto(updated);
}

/** One free re-list of an expired request (Challenge 05, Fix 2). */
export async function relistRequest(requestId: string, senderId: string): Promise<DeliveryRequestDto> {
  const request = await ownRequestOrThrow(requestId, senderId);
  if (request.status !== 'EXPIRED') {
    throw new AppError(409, 'NOT_EXPIRED', 'Only an expired request can be re-listed.');
  }
  if (request.relistCount >= 1) {
    throw new AppError(409, 'RELIST_USED', 'You’ve already used your free re-list for this request.');
  }
  const updated = await prisma.deliveryRequest.update({
    where: { id: requestId },
    data: {
      status: 'OPEN',
      expiresAt: new Date(Date.now() + REQUEST_EXPIRY_DAYS * 86_400_000),
      relistCount: { increment: 1 },
      expiryReminderSentAt: null,
    },
  });
  return toRequestDto(updated);
}

/** Liquidity signals for a request detail (Challenge 05, Fix 3). */
export async function getRequestInsights(
  requestId: string,
  senderId: string,
): Promise<RequestInsights> {
  const request = await ownRequestOrThrow(requestId, senderId);
  const airports = CITY_TO_AIRPORTS[request.destinationCity] ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today.getTime() + 7 * 86_400_000);

  const [activeTravelers, recentOrders] = await Promise.all([
    prisma.travelRoute.count({
      where: {
        status: 'ACTIVE',
        destinationAirport: { in: airports.length ? airports : ['__none__'] },
        departureDate: { gte: today, lte: weekEnd },
      },
    }),
    // Historical time-to-match on this route (order created = matched moment).
    prisma.order.findMany({
      where: { request: { destinationCity: request.destinationCity } },
      select: { createdAt: true, request: { select: { createdAt: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  const days = recentOrders.map(
    (o) => (o.createdAt.getTime() - o.request.createdAt.getTime()) / 86_400_000,
  );
  const avgDaysToMatch = days.length
    ? Math.max(1, Math.round(days.reduce((a, b) => a + b, 0) / days.length))
    : null;

  return { activeTravelers, avgDaysToMatch, destinationCity: request.destinationCity };
}

/** Marketplace pulse for the home screen (Challenge 05, Fix 4). */
export async function getTodayPulse(): Promise<MarketplacePulse> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const matchedToday = await prisma.order.count({ where: { createdAt: { gte: start } } });
  return { matchedToday };
}

/** Delete a request outright — allowed only before it's matched (cascades any bids). */
export async function deleteRequest(requestId: string, senderId: string): Promise<void> {
  const request = await ownRequestOrThrow(requestId, senderId);
  if (!(EDITABLE_STATUSES as readonly string[]).includes(request.status)) {
    throw new AppError(409, 'NOT_DELETABLE', 'A matched request cannot be deleted — cancel it from the order.');
  }
  await prisma.deliveryRequest.delete({ where: { id: requestId } });
}

export async function getMyRequest(
  requestId: string,
  senderId: string,
): Promise<DeliveryRequestDto> {
  return toRequestDto(await ownRequestOrThrow(requestId, senderId));
}

export async function cancelRequest(
  requestId: string,
  senderId: string,
): Promise<DeliveryRequestDto> {
  const request = await ownRequestOrThrow(requestId, senderId);
  if (['MATCHED', 'IN_TRANSIT', 'DELIVERED', 'CONFIRMED'].includes(request.status)) {
    throw new AppError(409, 'REQUEST_LOCKED', 'This request can no longer be cancelled.');
  }
  const updated = await prisma.deliveryRequest.update({
    where: { id: requestId },
    data: { status: 'CANCELLED' },
  });
  return toRequestDto(updated);
}

/**
 * Requests a traveler can bid on for a given route:
 * same destination city, deadline on/after departure, fits remaining capacity,
 * still open, and not already bid on by this traveler (or owned by them).
 */
export async function browseForRoute(
  routeId: string,
  travelerId: string,
): Promise<DeliveryRequestSummary[]> {
  const route = await prisma.travelRoute.findUnique({ where: { id: routeId } });
  if (!route || route.travelerId !== travelerId) throw AppError.notFound('Route not found');

  const city = AIRPORT_TO_CITY[route.destinationAirport];
  if (!city) return [];

  const remaining = Number(route.capacityKg) - Number(route.capacityUsedKg);
  const alreadyBid = await prisma.bid.findMany({
    where: { travelerId },
    select: { requestId: true },
  });
  const excludedRequestIds = alreadyBid.map((b) => b.requestId);

  const requests = await prisma.deliveryRequest.findMany({
    where: {
      status: 'OPEN',
      destinationCity: city,
      deadlineDate: { gte: route.departureDate },
      weightKg: { lte: remaining },
      senderId: { not: travelerId },
      id: { notIn: excludedRequestIds.length ? excludedRequestIds : undefined },
    },
    include: { sender: true },
    orderBy: [{ deadlineDate: 'asc' }, { declaredValueInr: 'desc' }],
    take: 50,
  });

  return requests.map(toRequestSummary);
}
