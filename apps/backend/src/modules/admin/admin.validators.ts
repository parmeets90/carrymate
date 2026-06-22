import { z } from 'zod';

export const rejectKycSchema = z.object({
  reason: z.string().trim().min(3, 'A rejection reason is required').max(500),
});

export const listUsersSchema = z.object({
  q: z.string().trim().max(100).optional().default(''),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const setStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']),
});

export const listRequestsSchema = z.object({
  status: z.string().trim().max(20).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type RejectKycInput = z.infer<typeof rejectKycSchema>;
export type SetStatusInput = z.infer<typeof setStatusSchema>;
