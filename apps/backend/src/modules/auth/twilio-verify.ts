import twilio from 'twilio';
import { env } from '../../config/env';

/** Twilio Verify: Twilio generates, delivers, and validates the OTP (no local storage). */
const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
const service = () => client.verify.v2.services(env.TWILIO_VERIFY_SERVICE_SID!);

/** Start a verification — Twilio sends the code via SMS. */
export async function startVerification(phone: string): Promise<void> {
  await service().verifications.create({ to: phone, channel: 'sms' });
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
