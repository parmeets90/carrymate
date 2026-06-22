import type { BidDto, OrderDto } from '@carrymate/shared';
import { MAX_ACTIVE_BIDS_PER_TRAVELER } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { computeFees } from '../../utils/marketplace';
import { NotificationType } from '@carrymate/shared';
import { createNotification } from '../notifications/notifications.service';
import { scoreOrder } from '../fraud/fraud.service';
import { toBidDto, toOrderDto } from '../marketplace/serializers';
import type { CreateBidInput } from './bids.validators';

export async function createBid(travelerId: string, input: CreateBidInput): Promise<BidDto> {
  const [request, route] = await Promise.all([
    prisma.deliveryRequest.findUnique({ where: { id: input.requestId } }),
    prisma.travelRoute.findUnique({ where: { id: input.routeId } }),
  ]);

  if (!request) throw AppError.notFound('Request not found');
  if (!route || route.travelerId !== travelerId) throw AppError.notFound('Route not found');
  if (request.senderId === travelerId) {
    throw AppError.forbidden('You cannot bid on your own request', 'SELF_BID');
  }
  if (request.status !== 'OPEN' && request.status !== 'BIDDING') {
    throw new AppError(409, 'REQUEST_NOT_OPEN', 'This request is no longer accepting bids.');
  }
  if (route.status !== 'ACTIVE') {
    throw new AppError(409, 'ROUTE_INACTIVE', 'This route is not active.');
  }

  const remaining = Number(route.capacityKg) - Number(route.capacityUsedKg);
  if (Number(request.weightKg) > remaining) {
    throw new AppError(409, 'INSUFFICIENT_CAPACITY', 'This item exceeds your remaining capacity.');
  }

  const existing = await prisma.bid.findUnique({
    where: { requestId_travelerId: { requestId: input.requestId, travelerId } },
  });
  if (existing) throw new AppError(409, 'DUPLICATE_BID', 'You have already bid on this request.');

  const activeBids = await prisma.bid.count({ where: { travelerId, status: 'PENDING' } });
  if (activeBids >= MAX_ACTIVE_BIDS_PER_TRAVELER) {
    throw new AppError(409, 'MAX_BIDS_EXCEEDED', `At most ${MAX_ACTIVE_BIDS_PER_TRAVELER} active bids.`);
  }

  const { commissionInr, payoutInr } = computeFees(input.carryFeeInr);

  const bid = await prisma.bid.create({
    data: {
      requestId: input.requestId,
      travelerId,
      routeId: input.routeId,
      carryFeeInr: input.carryFeeInr,
      commissionInr,
      payoutInr,
      message: input.message ?? null,
      pickupPreference: input.pickupPreference,
      pickupLocation: input.pickupLocation ?? null,
      estimatedDeliveryDate: input.estimatedDeliveryDate,
    },
    include: { traveler: true, route: true },
  });

  // First bid moves the request into BIDDING.
  if (request.status === 'OPEN') {
    await prisma.deliveryRequest.update({
      where: { id: request.id },
      data: { status: 'BIDDING' },
    });
  }

  await createNotification({
    userId: request.senderId,
    type: NotificationType.BID_RECEIVED,
    title: 'New bid on your request',
    body: `A traveler offered to carry “${request.title}” for ₹${input.carryFeeInr}.`,
    data: { requestId: request.id, bidId: bid.id },
  });

  return toBidDto(bid);
}

/** Bids visible to the sender who owns the request. */
export async function listBidsForRequest(requestId: string, senderId: string): Promise<BidDto[]> {
  const request = await prisma.deliveryRequest.findUnique({ where: { id: requestId } });
  if (!request || request.senderId !== senderId) throw AppError.notFound('Request not found');

  const bids = await prisma.bid.findMany({
    where: { requestId, status: { in: ['PENDING', 'ACCEPTED'] } },
    include: { traveler: true, route: true },
    orderBy: [{ traveler: { ratingAvg: 'desc' } }, { carryFeeInr: 'asc' }],
  });
  return bids.map(toBidDto);
}

export async function listMyBids(travelerId: string): Promise<BidDto[]> {
  const bids = await prisma.bid.findMany({
    where: { travelerId },
    include: { traveler: true, route: true },
    orderBy: { createdAt: 'desc' },
  });
  return bids.map(toBidDto);
}

export async function withdrawBid(bidId: string, travelerId: string): Promise<BidDto> {
  const bid = await prisma.bid.findUnique({ where: { id: bidId } });
  if (!bid || bid.travelerId !== travelerId) throw AppError.notFound('Bid not found');
  if (bid.status !== 'PENDING') throw new AppError(409, 'BID_LOCKED', 'This bid cannot be withdrawn.');

  const updated = await prisma.bid.update({
    where: { id: bidId },
    data: { status: 'WITHDRAWN' },
    include: { traveler: true, route: true },
  });
  return toBidDto(updated);
}

/**
 * Sender accepts a bid: atomically accept it, reject the rest, match the request,
 * reserve route capacity, and open an order (awaiting payment in Phase 3).
 */
export async function acceptBid(
  requestId: string,
  bidId: string,
  senderId: string,
): Promise<OrderDto> {
  const result = await prisma.$transaction(async (tx) => {
    const request = await tx.deliveryRequest.findUnique({ where: { id: requestId } });
    if (!request || request.senderId !== senderId) throw AppError.notFound('Request not found');
    if (request.status !== 'OPEN' && request.status !== 'BIDDING') {
      throw new AppError(409, 'REQUEST_NOT_OPEN', 'This request can no longer be matched.');
    }

    const bid = await tx.bid.findUnique({ where: { id: bidId } });
    if (!bid || bid.requestId !== requestId) throw AppError.notFound('Bid not found');
    if (bid.status !== 'PENDING') throw new AppError(409, 'BID_NOT_PENDING', 'Bid is not available.');

    const route = await tx.travelRoute.findUniqueOrThrow({ where: { id: bid.routeId } });
    const remaining = Number(route.capacityKg) - Number(route.capacityUsedKg);
    if (Number(request.weightKg) > remaining) {
      throw new AppError(409, 'INSUFFICIENT_CAPACITY', 'Traveler no longer has capacity.');
    }

    await tx.bid.update({ where: { id: bidId }, data: { status: 'ACCEPTED' } });
    await tx.bid.updateMany({
      where: { requestId, id: { not: bidId }, status: 'PENDING' },
      data: { status: 'REJECTED' },
    });
    await tx.deliveryRequest.update({
      where: { id: requestId },
      data: { status: 'MATCHED', matchedTravelerId: bid.travelerId, acceptedBidId: bidId },
    });
    await tx.travelRoute.update({
      where: { id: route.id },
      data: { capacityUsedKg: { increment: request.weightKg } },
    });

    const order = await tx.order.create({
      data: {
        requestId,
        bidId,
        senderId,
        travelerId: bid.travelerId,
        amountInr: bid.carryFeeInr,
        commissionInr: bid.commissionInr,
        payoutInr: bid.payoutInr,
      },
    });

    return {
      dto: toOrderDto(order),
      travelerId: bid.travelerId,
      title: request.title,
      amountInr: bid.carryFeeInr,
      declaredValueInr: request.declaredValueInr,
    };
  });

  // Risk-score the new order (off the hot path of the transaction).
  await scoreOrder({
    orderId: result.dto.id,
    senderId,
    travelerId: result.travelerId,
    declaredValueInr: result.declaredValueInr,
  });

  await createNotification({
    userId: result.travelerId,
    type: NotificationType.BID_ACCEPTED,
    title: 'Your bid was accepted 🎉',
    body: `You're matched for “${result.title}” (₹${result.amountInr}). Awaiting the sender's payment into escrow.`,
    data: { orderId: result.dto.id, requestId },
  });

  return result.dto;
}
