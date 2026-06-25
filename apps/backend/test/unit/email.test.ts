import { describe, it, expect } from 'vitest';
import type { NotificationType } from '@prisma/client';
import { shouldEmail } from '../../src/modules/notifications/email.sender';

describe('shouldEmail (notification → email routing)', () => {
  it('emails high-signal, account-level events', () => {
    const emailed: NotificationType[] = [
      'BID_ACCEPTED', 'ORDER_PAID', 'IN_TRANSIT', 'DELIVERED',
      'ESCROW_RELEASED', 'DISPUTE_OPENED', 'DISPUTE_RESOLVED',
      'KYC_VERIFIED', 'KYC_REJECTED', 'SYSTEM',
    ];
    for (const t of emailed) expect(shouldEmail(t)).toBe(true);
  });

  it('keeps chatty / low-signal events push-only (no email)', () => {
    const pushOnly: NotificationType[] = ['NEW_MESSAGE', 'BID_RECEIVED', 'RATING_RECEIVED', 'OPEN_BOX_DONE'];
    for (const t of pushOnly) expect(shouldEmail(t)).toBe(false);
  });
});
