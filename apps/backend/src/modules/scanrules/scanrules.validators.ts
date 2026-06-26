import { z } from 'zod';

export const createScanRuleSchema = z.object({
  label: z.string().trim().min(2).max(60),
  kind: z.enum(['PROHIBITED', 'ALLOWED']).default('PROHIBITED'),
  category: z.string().trim().max(40).optional().nullable(),
  active: z.boolean().optional(),
});

export const updateScanRuleSchema = createScanRuleSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field to update' });

export type CreateScanRuleInput = z.infer<typeof createScanRuleSchema>;
export type UpdateScanRuleInput = z.infer<typeof updateScanRuleSchema>;
