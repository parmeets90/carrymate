import type { BankAccountDto } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { hmac } from '../../utils/crypto';
import type { BankAccountInput } from './bankaccount.validators';

/** Order states where escrow is committed to this traveler — bank edits are locked. */
const LOCKED_STATES = ['ESCROW_HELD', 'IN_TRANSIT', 'DELIVERY_PROOF_UPLOADED', 'PAYOUT_INITIATED'] as const;

function mask(accountNumber: string): string {
  const n = accountNumber.replace(/\s+/g, '');
  return n.length <= 4 ? n : `${'*'.repeat(n.length - 4)}${n.slice(-4)}`;
}

function toDto(a: {
  id: string;
  accountHolderName: string;
  accountNumberMasked: string;
  ifsc: string;
  updatedAt: Date;
}): BankAccountDto {
  return {
    id: a.id,
    accountHolderName: a.accountHolderName,
    accountNumberMasked: a.accountNumberMasked,
    ifsc: a.ifsc,
    updatedAt: a.updatedAt.toISOString(),
  };
}

export async function getBankAccount(userId: string): Promise<BankAccountDto | null> {
  const account = await prisma.bankAccount.findUnique({ where: { userId } });
  return account ? toDto(account) : null;
}

/**
 * Create or update the payout account. Blocked while a delivery is in progress so
 * funds in escrow can't be redirected after the fact (Challenge 03, Fix 4).
 */
export async function upsertBankAccount(
  userId: string,
  input: BankAccountInput,
): Promise<BankAccountDto> {
  const active = await prisma.order.count({
    where: { travelerId: userId, status: { in: [...LOCKED_STATES] } },
  });
  if (active > 0) {
    throw new AppError(
      400,
      'BANK_LOCKED',
      'Bank account cannot be changed while a delivery is in progress.',
    );
  }

  const ifsc = input.ifsc.toUpperCase();
  const account = await prisma.bankAccount.upsert({
    where: { userId },
    update: {
      accountHolderName: input.accountHolderName,
      accountNumberMasked: mask(input.accountNumber),
      accountNumberHash: hmac(input.accountNumber.replace(/\s+/g, '')),
      ifsc,
    },
    create: {
      userId,
      accountHolderName: input.accountHolderName,
      accountNumberMasked: mask(input.accountNumber),
      accountNumberHash: hmac(input.accountNumber.replace(/\s+/g, '')),
      ifsc,
    },
  });
  return toDto(account);
}
