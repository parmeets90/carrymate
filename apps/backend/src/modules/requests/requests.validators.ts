import { z } from 'zod';
import { RequestCategory, UAE_DESTINATION_CITIES } from '@carrymate/shared';

export const createRequestSchema = z.object({
  title: z.string().trim().min(5).max(100),
  description: z.string().trim().min(10).max(500),
  category: z.nativeEnum(RequestCategory),
  weightKg: z.coerce.number().min(0.1).max(5),
  declaredValueInr: z.coerce.number().int().min(1).max(10000),
  itemPhotos: z.array(z.string().trim().min(1)).max(5).optional().default([]),
  originCity: z.string().trim().min(2).max(50),
  originAirport: z.string().trim().length(3).toUpperCase(),
  destinationCity: z.enum([...UAE_DESTINATION_CITIES] as [string, ...string[]]),
  recipientName: z.string().trim().min(2).max(100),
  recipientPhone: z
    .string()
    .trim()
    .regex(/^\+971\d{7,9}$/, 'Recipient phone must be a UAE number (+971…).'),
  recipientAddress: z.string().trim().min(5).max(300),
  deadlineDate: z.coerce.date(),
  isFragile: z.coerce.boolean().optional().default(false),
  senderNotes: z.string().trim().max(200).optional(),
  /** Sender must accept the item declaration to post (Challenge 08). */
  declarationAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the item declaration to post.' }),
  }),
  /** When a prohibited-rule blocks the item, the sender can ask for manual review. */
  requestReview: z.boolean().optional().default(false),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

/** Edit an existing request — any subset of editable fields (≥1 required). */
export const updateRequestSchema = createRequestSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field to update' });

export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
