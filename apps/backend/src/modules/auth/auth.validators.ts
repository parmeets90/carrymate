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

export const googleAuthSchema = z.object({
  idToken: z.string().trim().min(1, 'idToken is required'),
  fcmToken: z.string().trim().min(1).optional(),
});

export const startPhoneSchema = z.object({ phone });

export const verifyPhoneSchema = z.object({
  phone,
  code: z.string().trim().regex(/^\d{4,8}$/, 'Enter the code sent to your phone.'),
});

export const fcmTokenSchema = z.object({ token: z.string().trim().min(1) });

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().max(255).optional(),
    role: z.enum(['SENDER', 'TRAVELER']).optional(),
  })
  .refine((v) => v.fullName !== undefined || v.email !== undefined || v.role !== undefined, {
    message: 'Provide at least one field to update',
  });

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type StartPhoneInput = z.infer<typeof startPhoneSchema>;
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>;
export type FcmTokenInput = z.infer<typeof fcmTokenSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
