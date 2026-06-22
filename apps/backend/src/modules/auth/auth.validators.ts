import { z } from 'zod';

/** E.164 phone, e.g. +919876543210. */
const phone = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, 'Enter a valid phone number in international format (e.g. +9198…).');

export const sendOtpSchema = z.object({
  phone,
});

export const verifyOtpSchema = z.object({
  phone,
  code: z.string().trim().regex(/^\d{4,8}$/, 'Enter the code sent to your phone.'),
  fcmToken: z.string().trim().min(1).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().trim().min(1, 'refreshToken is required'),
});

export const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().max(255).optional(),
    role: z.enum(['SENDER', 'TRAVELER', 'BOTH']).optional(),
  })
  .refine((v) => v.fullName !== undefined || v.email !== undefined || v.role !== undefined, {
    message: 'Provide at least one field to update',
  });

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
