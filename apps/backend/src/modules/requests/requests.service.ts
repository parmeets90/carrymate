import type { DeliveryRequestDto, DeliveryRequestSummary } from '@carrymate/shared';
import { MAX_ACTIVE_REQUESTS_PER_SENDER, MIN_DEADLINE_DAYS, REQUEST_EXPIRY_DAYS } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import {
  findProhibitedKeyword,
  assertDestinationCity,
  AIRPORT_TO_CITY,
} from '../../utils/marketplace';
import { INDIA_ORIGIN_AIRPORTS } from '@carrymate/shared';
import { toRequestDto, toRequestSummary } from '../marketplace/serializers';
import type { CreateRequestInput } from './requests.validators';

const ACTIVE_STATUSES = ['OPEN', 'BIDDING', 'MATCHED', 'IN_TRANSIT'] as const;

export async function createRequest(
  senderId: string,
  input: CreateRequestInput,
): Promise<DeliveryRequestDto> {
  if (!(INDIA_ORIGIN_AIRPORTS as readonly string[]).includes(input.originAirport)) {
    throw new AppError(400, 'INVALID_AIRPORT', `Unsupported origin airport: ${input.originAirport}`);
  }
  assertDestinationCity(input.destinationCity);

  // Prohibited-item firewall — block before the request is ever published.
  const hit = findProhibitedKeyword(input.title, input.description);
  if (hit) {
    throw new AppError(400, 'ITEM_PROHIBITED', `This item is not allowed (matched "${hit}").`);
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
      prohibitedCheckPassed: true,
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
