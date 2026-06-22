import { prisma } from '../../lib/prisma';
import { env, isTwilioVerifyConfigured } from '../../config/env';
import { AppError } from '../../utils/errors';
import { generateNumericOtp, hmac, safeEqualHex } from '../../utils/crypto';
import { logDevOtp } from './sms/sms.sender';
import { startVerification, checkVerification } from './twilio-verify';

const MAX_SENDS_PER_WINDOW = 3;
const SEND_WINDOW_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;

/** Numbers that bypass Twilio and accept a fixed code — for demos/testing only. */
const TEST_NUMBERS = new Set(
  (env.OTP_TEST_NUMBERS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);
const isTestNumber = (phone: string): boolean => TEST_NUMBERS.has(phone);

/**
 * Issue a login OTP.
 * - Twilio Verify (when configured): Twilio generates + delivers the code.
 * - Local fallback (dev): generate, store hashed, and log to the console.
 */
export async function requestOtp(phone: string): Promise<{ expiresInSeconds: number }> {
  // Test numbers never hit Twilio — the code is fixed (OTP_TEST_CODE).
  if (isTestNumber(phone)) return { expiresInSeconds: 10 * 60 };
  if (isTwilioVerifyConfigured) {
    await startVerification(phone);
    return { expiresInSeconds: 10 * 60 };
  }
  return localRequestOtp(phone);
}

/** Verify a submitted OTP. Throws on invalid/expired/locked. */
export async function verifyOtp(phone: string, code: string): Promise<void> {
  if (isTestNumber(phone)) {
    if (code.trim() !== env.OTP_TEST_CODE) throw new AppError(400, 'OTP_INVALID', 'Invalid or expired code.');
    return;
  }
  if (isTwilioVerifyConfigured) {
    const approved = await checkVerification(phone, code);
    if (!approved) throw new AppError(400, 'OTP_INVALID', 'Invalid or expired code.');
    return;
  }
  return localVerifyOtp(phone, code);
}

// ── Local (dev) provider — used when Twilio Verify isn't configured ──────────

async function localRequestOtp(phone: string): Promise<{ expiresInSeconds: number }> {
  const windowStart = new Date(Date.now() - SEND_WINDOW_MINUTES * 60_000);
  const recentSends = await prisma.phoneOtp.count({
    where: { phone, createdAt: { gte: windowStart } },
  });
  if (recentSends >= MAX_SENDS_PER_WINDOW) {
    throw new AppError(429, 'OTP_RATE_LIMITED', 'Too many code requests. Please try again later.');
  }

  const code = generateNumericOtp(env.OTP_LENGTH);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60_000);
  await prisma.phoneOtp.create({ data: { phone, codeHash: hmac(code), expiresAt } });
  logDevOtp(phone, code);
  return { expiresInSeconds: env.OTP_EXPIRY_MINUTES * 60 };
}

async function localVerifyOtp(phone: string, code: string): Promise<void> {
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

  if (!safeEqualHex(otp.codeHash, hmac(code))) {
    await prisma.phoneOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw new AppError(400, 'OTP_INVALID', 'Invalid or expired code.');
  }

  await prisma.phoneOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
}
