import { z } from 'zod';
import { PickupPreference, MIN_CARRY_FEE_INR, MAX_CARRY_FEE_INR } from '@carrymate/shared';

export const createBidSchema = z.object({
  requestId: z.string().uuid(),
  routeId: z.string().uuid(),
  carryFeeInr: z.coerce.number().int().min(MIN_CARRY_FEE_INR).max(MAX_CARRY_FEE_INR),
  message: z.string().trim().max(500).optional(),
  pickupPreference: z.nativeEnum(PickupPreference),
  pickupLocation: z.string().trim().max(200).optional(),
  estimatedDeliveryDate: z.coerce.date(),
});

export type CreateBidInput = z.infer<typeof createBidSchema>;
