import twilio from 'twilio';
import { env, isTwilioConfigured } from '../../../config/env';
import { logger } from '../../../utils/logger';

/** Transport for delivering an OTP to a phone number. */
export interface SmsSender {
  sendOtp(phone: string, code: string): Promise<void>;
}

/** Dev sender: logs the OTP to the server console instead of sending an SMS. */
class ConsoleSmsSender implements SmsSender {
  async sendOtp(phone: string, code: string): Promise<void> {
    logger.warn(`📲 [DEV OTP] ${phone} → ${code} (Twilio not configured; not sent)`);
  }
}

/** Production sender backed by Twilio. */
class TwilioSmsSender implements SmsSender {
  private readonly client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  async sendOtp(phone: string, code: string): Promise<void> {
    await this.client.messages.create({
      to: phone,
      from: env.TWILIO_FROM_NUMBER,
      body: `${code} is your CarryMate verification code. It expires in ${env.OTP_EXPIRY_MINUTES} minutes.`,
    });
  }
}

export const smsSender: SmsSender = isTwilioConfigured
  ? new TwilioSmsSender()
  : new ConsoleSmsSender();
