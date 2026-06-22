import { logger } from '../../../utils/logger';

/**
 * Dev OTP delivery: prints the code to the server console.
 * Real OTP delivery in production goes through Twilio Verify (see twilio-verify.ts),
 * not this sender.
 */
export function logDevOtp(phone: string, code: string): void {
  logger.warn(`📲 [DEV OTP] ${phone} → ${code} (Twilio Verify not configured; not sent)`);
}
