import { z } from 'zod';

export const bankAccountSchema = z.object({
  accountHolderName: z.string().trim().min(2).max(100),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{9,18}$/, 'Enter a valid bank account number.'),
  ifsc: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, 'Enter a valid IFSC code.'),
});

export type BankAccountInput = z.infer<typeof bankAccountSchema>;
