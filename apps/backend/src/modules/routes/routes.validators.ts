import { z } from 'zod';

export const createRouteSchema = z.object({
  originAirport: z.string().trim().length(3).toUpperCase(),
  destinationAirport: z.string().trim().length(3).toUpperCase(),
  departureDate: z.coerce.date(),
  arrivalDate: z.coerce.date().optional(),
  capacityKg: z.coerce.number().min(0.5).max(30),
  flightNumber: z.string().trim().max(10).optional(),
  airline: z.string().trim().max(50).optional(),
  deliveryArea: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
