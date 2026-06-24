import type { NotificationType } from '@prisma/client';
import { env, isBrevoConfigured } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';

/**
 * Transactional email via Brevo (free tier: 300/day). Best-effort, config-gated:
 * with no API key/sender it logs instead of sending. The in-app notification is
 * the source of truth, so email failures never block the originating action.
 *
 * Only high-signal, account-level events are emailed (see EMAIL_TYPES) — chatty
 * events like new messages / new bids stay push-only to respect the daily cap
 * and avoid inbox fatigue.
 */
const EMAIL_TYPES = new Set<NotificationType>([
  'BID_ACCEPTED',
  'ORDER_PAID',
  'IN_TRANSIT',
  'DELIVERED',
  'ESCROW_RELEASED',
  'DISPUTE_OPENED',
  'DISPUTE_RESOLVED',
  'KYC_VERIFIED',
  'KYC_REJECTED',
  'SYSTEM',
]);

export function shouldEmail(type: NotificationType): boolean {
  return EMAIL_TYPES.has(type);
}

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Branded HTML body — navy header, sky accents, plain and email-client-safe. */
function renderHtml(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F5F6F8;font-family:Helvetica,Arial,sans-serif;color:#1C2330">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F6F8;padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E0E3E9">
        <tr><td style="background:#0F1629;padding:20px 24px">
          <span style="color:#FFFFFF;font-size:18px;font-weight:700;letter-spacing:-0.3px">CarryMate</span>
        </td></tr>
        <tr><td style="padding:28px 24px">
          <h1 style="margin:0 0 12px;font-size:20px;color:#1C2330">${esc(title)}</h1>
          <p style="margin:0;font-size:15px;line-height:22px;color:#5E6878">${esc(body)}</p>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #E0E3E9">
          <p style="margin:0;font-size:12px;color:#8E97A8">Delivered through trusted travelers · India → UAE</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendEmail(userId: string, subject: string, body: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true, status: true },
  });
  if (!user?.email || user.status === 'DELETED') return; // no address / erased account

  if (!isBrevoConfigured) {
    logger.info(`📧 [DEV EMAIL] → ${user.email}: ${subject} (Brevo not configured; not sent)`);
    return;
  }

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY!,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: env.BREVO_SENDER_NAME, email: env.BREVO_SENDER_EMAIL },
        to: [{ email: user.email, name: user.fullName ?? undefined }],
        subject,
        htmlContent: renderHtml(subject, body),
        textContent: `${subject}\n\n${body}`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      logger.warn(`[email] Brevo ${res.status} for user ${userId}: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    logger.warn(`[email] send failed for user ${userId}: ${(err as Error).message}`);
  }
}
