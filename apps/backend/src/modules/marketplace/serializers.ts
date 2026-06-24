import type { TravelRoute, DeliveryRequest, Bid, Order, User } from '@prisma/client';
import type {
  TravelRouteDto,
  DeliveryRequestDto,
  DeliveryRequestSummary,
  BidDto,
  OrderDto,
} from '@carrymate/shared';

const dateOnly = (d: Date): string => d.toISOString().slice(0, 10);

export function toRouteDto(r: TravelRoute): TravelRouteDto {
  return {
    id: r.id,
    originAirport: r.originAirport,
    destinationAirport: r.destinationAirport,
    departureDate: dateOnly(r.departureDate),
    arrivalDate: r.arrivalDate ? dateOnly(r.arrivalDate) : null,
    capacityKg: Number(r.capacityKg),
    capacityUsedKg: Number(r.capacityUsedKg),
    flightNumber: r.flightNumber,
    airline: r.airline,
    ticketVerified: r.ticketVerified,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}

export function toRequestDto(r: DeliveryRequest): DeliveryRequestDto {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    weightKg: Number(r.weightKg),
    declaredValueInr: r.declaredValueInr,
    itemPhotos: r.itemPhotos,
    originCity: r.originCity,
    originAirport: r.originAirport,
    destinationCity: r.destinationCity,
    recipientName: r.recipientName,
    recipientPhone: r.recipientPhone,
    recipientAddress: r.recipientAddress,
    deadlineDate: dateOnly(r.deadlineDate),
    isFragile: r.isFragile,
    senderNotes: r.senderNotes,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}

export function toRequestSummary(r: DeliveryRequest & { sender: User }): DeliveryRequestSummary {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    weightKg: Number(r.weightKg),
    declaredValueInr: r.declaredValueInr,
    originCity: r.originCity,
    destinationCity: r.destinationCity,
    deadlineDate: dateOnly(r.deadlineDate),
    isFragile: r.isFragile,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    senderId: r.senderId,
    senderName: r.sender.fullName,
    senderRating: Number(r.sender.ratingAvg),
  };
}

export function toBidDto(b: Bid & { traveler: User; route: TravelRoute }): BidDto {
  return {
    id: b.id,
    requestId: b.requestId,
    carryFeeInr: b.carryFeeInr,
    commissionInr: b.commissionInr,
    payoutInr: b.payoutInr,
    message: b.message,
    pickupPreference: b.pickupPreference,
    pickupLocation: b.pickupLocation,
    estimatedDeliveryDate: dateOnly(b.estimatedDeliveryDate),
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    traveler: {
      id: b.traveler.id,
      fullName: b.traveler.fullName,
      ratingAvg: Number(b.traveler.ratingAvg),
      ratingCount: b.traveler.ratingCount,
      kycStatus: b.traveler.kycStatus,
    },
    route: {
      originAirport: b.route.originAirport,
      destinationAirport: b.route.destinationAirport,
      departureDate: dateOnly(b.route.departureDate),
      flightNumber: b.route.flightNumber,
      flightVerified: b.route.ticketVerified,
    },
  };
}

export function toOrderDto(o: Order): OrderDto {
  return {
    id: o.id,
    requestId: o.requestId,
    bidId: o.bidId,
    amountInr: o.amountInr,
    commissionInr: o.commissionInr,
    payoutInr: o.payoutInr,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  };
}
