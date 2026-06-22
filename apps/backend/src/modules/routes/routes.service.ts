import type { TravelRouteDto } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { assertCorridor } from '../../utils/marketplace';
import { toRouteDto } from '../marketplace/serializers';
import type { CreateRouteInput } from './routes.validators';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function createRoute(
  travelerId: string,
  input: CreateRouteInput,
): Promise<TravelRouteDto> {
  assertCorridor(input.originAirport, input.destinationAirport);

  if (input.departureDate < startOfToday()) {
    throw new AppError(400, 'FLIGHT_DEPARTED', 'Departure date cannot be in the past.');
  }
  if (input.arrivalDate && input.arrivalDate < input.departureDate) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Arrival cannot be before departure.');
  }

  const route = await prisma.travelRoute.create({
    data: {
      travelerId,
      originAirport: input.originAirport,
      destinationAirport: input.destinationAirport,
      departureDate: input.departureDate,
      arrivalDate: input.arrivalDate ?? null,
      capacityKg: input.capacityKg,
      flightNumber: input.flightNumber ?? null,
      airline: input.airline ?? null,
      deliveryArea: input.deliveryArea ?? null,
      notes: input.notes ?? null,
      // Ticket verification is a stub in MVP (real flow: OCR + schedule check).
      ticketVerified: false,
    },
  });

  return toRouteDto(route);
}

export async function listMyRoutes(travelerId: string): Promise<TravelRouteDto[]> {
  const routes = await prisma.travelRoute.findMany({
    where: { travelerId },
    orderBy: { departureDate: 'asc' },
  });
  return routes.map(toRouteDto);
}

async function ownRouteOrThrow(routeId: string, travelerId: string) {
  const route = await prisma.travelRoute.findUnique({ where: { id: routeId } });
  if (!route || route.travelerId !== travelerId) throw AppError.notFound('Route not found');
  return route;
}

export async function getRoute(routeId: string, travelerId: string): Promise<TravelRouteDto> {
  return toRouteDto(await ownRouteOrThrow(routeId, travelerId));
}

export async function cancelRoute(routeId: string, travelerId: string): Promise<TravelRouteDto> {
  await ownRouteOrThrow(routeId, travelerId);
  const route = await prisma.travelRoute.update({
    where: { id: routeId },
    data: { status: 'CANCELLED' },
  });
  return toRouteDto(route);
}
