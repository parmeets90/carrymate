import { z } from 'zod';
import { KycDocType } from '@carrymate/shared';

export const submitKycSchema = z.object({
  docType: z.nativeEnum(KycDocType),
  fileKey: z.string().trim().min(1).max(512).optional(),
  docNumber: z.string().trim().min(4).max(40).optional(),
});

export type SubmitKycInput = z.infer<typeof submitKycSchema>;
