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
  // Layer 2 (Challenge 09): a ticket photo is always required as evidence.
  ticketFileKey: z.string().trim().min(1, 'A flight ticket photo is required.'),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;

/** Edit an existing trip — any subset of fields (≥1 required). */
export const updateRouteSchema = createRouteSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field to update' });

export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
