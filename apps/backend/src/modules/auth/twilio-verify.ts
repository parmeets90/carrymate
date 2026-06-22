import twilio from 'twilio';
import { env } from '../../config/env';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';

/** Twilio Verify: Twilio generates, delivers, and validates the OTP (no local storage). */
const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
const service = () => client.verify.v2.services(env.TWILIO_VERIFY_SERVICE_SID!);

/** Start a verification — Twilio sends the code via SMS. Surfaces a clear, non-500 error. */
export async function startVerification(phone: string): Promise<void> {
  try {
    await service().verifications.create({ to: phone, channel: 'sms' });
  } catch (err) {
    const e = err as { code?: number; status?: number; message?: string };
    logger.error(`[twilio] startVerification failed for ${phone}: code=${e.code} status=${e.status} ${e.message}`);
    // 21608: trial account can only message verified numbers.
    if (e.code === 21608) {
      throw new AppError(
        400,
        'PHONE_NOT_ALLOWED',
        'This number isn’t enabled for SMS yet (our provider is in trial mode). Use a verified test number.',
      );
    }
    // 60200 / 21211: malformed phone number.
    if (e.code === 60200 || e.code === 21211) {
      throw new AppError(400, 'PHONE_INVALID', 'That phone number looks invalid. Please check and try again.');
    }
    // 60203: too many send attempts for this number.
    if (e.code === 60203) {
      throw new AppError(429, 'OTP_RATE_LIMITED', 'Too many code requests for this number. Try again later.');
    }
    throw new AppError(502, 'OTP_SEND_FAILED', 'Couldn’t send the verification code right now. Please try again.');
  }
}

/** Check a submitted code. Returns true when approved. */
export async function checkVerification(phone: string, code: string): Promise<boolean> {
  try {
    const result = await service().verificationChecks.create({ to: phone, code });
    return result.status === 'approved';
  } catch {
    // Twilio 404s an expired/consumed verification — treat as a failed check.
    return false;
  }
}
