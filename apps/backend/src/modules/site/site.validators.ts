import { z } from 'zod';

const accent = z.enum(['gold', 'mint', 'sky', 'ember']);

export const testimonialCreateSchema = z.object({
  quote: z.string().trim().min(10).max(600),
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().min(2).max(80),
  rating: z.number().int().min(1).max(5).optional(),
  accent: accent.optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  active: z.boolean().optional(),
});
export const testimonialUpdateSchema = testimonialCreateSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field' });

export const founderCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().min(2).max(80),
  initials: z.string().trim().min(1).max(4),
  accent: accent.optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  active: z.boolean().optional(),
});
export const founderUpdateSchema = founderCreateSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field' });

export const faqCreateSchema = z.object({
  question: z.string().trim().min(5).max(200),
  answer: z.string().trim().min(10).max(2000),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  active: z.boolean().optional(),
});
export const faqUpdateSchema = faqCreateSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field' });

const url = z.string().trim().max(200);
export const settingsUpdateSchema = z
  .object({
    brandName: z.string().trim().min(1).max(60),
    tagline: z.string().trim().max(200),
    contactEmail: z.string().trim().max(120),
    supportEmail: z.string().trim().max(120),
    contactPhone: z.string().trim().max(40),
    twitterUrl: url,
    instagramUrl: url,
    linkedinUrl: url,
    appStoreUrl: url,
    playStoreUrl: url,
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field' });

export type TestimonialCreateInput = z.infer<typeof testimonialCreateSchema>;
export type TestimonialUpdateInput = z.infer<typeof testimonialUpdateSchema>;
export type FounderCreateInput = z.infer<typeof founderCreateSchema>;
export type FounderUpdateInput = z.infer<typeof founderUpdateSchema>;
export type FaqCreateInput = z.infer<typeof faqCreateSchema>;
export type FaqUpdateInput = z.infer<typeof faqUpdateSchema>;
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
