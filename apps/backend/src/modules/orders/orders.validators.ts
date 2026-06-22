import { z } from 'zod';
import { DisputeReason } from '@carrymate/shared';

/** A single open-box photo with its capture location + time (the legal firewall). */
export const inspectionPhotoSchema = z.object({
  key: z.string().trim().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  takenAt: z.string().trim().optional(),
});

export const openBoxSchema = z.object({
  checklist: z.object({
    inspected: z.boolean(),
    contentsMatch: z.boolean(),
    noProhibited: z.boolean(),
    sealed: z.boolean(),
  }),
  photos: z.array(inspectionPhotoSchema).min(1).max(5),
});

export const deliverSchema = z.object({
  otp: z.string().trim().regex(/^\d{4,8}$/, 'Enter the handover code.'),
  photos: z.array(z.string().trim().min(1)).min(1).max(3),
});

export const disputeSchema = z.object({
  reason: z.nativeEnum(DisputeReason),
  description: z.string().trim().min(10).max(1000),
  evidence: z.array(z.string().trim().min(1)).max(5).optional(),
});

export const rateSchema = z.object({
  stars: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export type OpenBoxInput = z.infer<typeof openBoxSchema>;
export type DeliverInput = z.infer<typeof deliverSchema>;
export type DisputeInput = z.infer<typeof disputeSchema>;
export type RateInput = z.infer<typeof rateSchema>;
