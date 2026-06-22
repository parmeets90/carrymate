import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AppError } from '../../utils/errors';
import { generateNumericOtp, hmac, safeEqualHex } from '../../utils/crypto';
import { smsSender } from './sms/sms.sender';

const MAX_SENDS_PER_WINDOW = 3;
const SEND_WINDOW_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;

/** Issue an OTP to a phone number (rate-limited), delivering via the SMS sender. */
export async function requestOtp(phone: string): Promise<{ expiresInSeconds: number }> {
  const windowStart = new Date(Date.now() - SEND_WINDOW_MINUTES * 60_000);
  const recentSends = await prisma.phoneOtp.count({
    where: { phone, createdAt: { gte: windowStart } },
  });
  if (recentSends >= MAX_SENDS_PER_WINDOW) {
    throw new AppError(429, 'OTP_RATE_LIMITED', 'Too many code requests. Please try again later.');
  }

  const code = generateNumericOtp(env.OTP_LENGTH);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60_000);

  await prisma.phoneOtp.create({
    data: { phone, codeHash: hmac(code), expiresAt },
  });

  await smsSender.sendOtp(phone, code);

  return { expiresInSeconds: env.OTP_EXPIRY_MINUTES * 60 };
}

/**
 * Verify a submitted OTP for a phone. Throws on invalid/expired/locked.
 * Consumes the code on success so it can't be reused.
 */
export async function verifyOtp(phone: string, code: string): Promise<void> {
  const otp = await prisma.phoneOtp.findFirst({
    where: { phone, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) throw new AppError(400, 'OTP_INVALID', 'Invalid or expired code.');
  if (otp.expiresAt.getTime() < Date.now()) {
    throw new AppError(400, 'OTP_EXPIRED', 'This code has expired. Request a new one.');
  }
  if (otp.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new AppError(429, 'OTP_MAX_ATTEMPTS', 'Too many attempts. Request a new code.');
  }

  const matches = safeEqualHex(otp.codeHash, hmac(code));
  if (!matches) {
    await prisma.phoneOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    throw new AppError(400, 'OTP_INVALID', 'Invalid or expired code.');
  }

  await prisma.phoneOtp.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });
}
