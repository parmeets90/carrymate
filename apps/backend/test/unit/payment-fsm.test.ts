import { describe, it, expect } from 'vitest';
import { canTransition } from '../../src/modules/payments/payment-state-machine';

describe('payment FSM — canTransition', () => {
  it('allows the happy-path money flow', () => {
    expect(canTransition('PENDING_PAYMENT', 'ESCROW_HELD')).toBe(true);
    expect(canTransition('ESCROW_HELD', 'IN_TRANSIT')).toBe(true);
    expect(canTransition('IN_TRANSIT', 'DELIVERY_PROOF_UPLOADED')).toBe(true);
    expect(canTransition('DELIVERY_PROOF_UPLOADED', 'PAYOUT_INITIATED')).toBe(true);
    expect(canTransition('PAYOUT_INITIATED', 'COMPLETED')).toBe(true);
  });

  it('allows disputes from in-flight states and refunds before payout', () => {
    expect(canTransition('ESCROW_HELD', 'DISPUTED')).toBe(true);
    expect(canTransition('IN_TRANSIT', 'DISPUTED')).toBe(true);
    expect(canTransition('ESCROW_HELD', 'REFUNDED')).toBe(true);
    expect(canTransition('DISPUTED', 'REFUNDED')).toBe(true);
    expect(canTransition('DISPUTED', 'PAYOUT_INITIATED')).toBe(true);
  });

  it('rejects skipping escrow (money before it is held)', () => {
    expect(canTransition('PENDING_PAYMENT', 'PAYOUT_INITIATED')).toBe(false);
    expect(canTransition('PENDING_PAYMENT', 'IN_TRANSIT')).toBe(false);
  });

  it('treats COMPLETED and REFUNDED as terminal', () => {
    expect(canTransition('COMPLETED', 'REFUNDED')).toBe(false);
    expect(canTransition('COMPLETED', 'PAYOUT_INITIATED')).toBe(false);
    expect(canTransition('REFUNDED', 'ESCROW_HELD')).toBe(false);
  });

  it('cannot refund a payout that already initiated past completion, but can before', () => {
    expect(canTransition('PAYOUT_INITIATED', 'REFUNDED')).toBe(true);
    expect(canTransition('DELIVERY_PROOF_UPLOADED', 'REFUNDED')).toBe(false);
  });

  it('rejects backward transitions', () => {
    expect(canTransition('ESCROW_HELD', 'PENDING_PAYMENT')).toBe(false);
    expect(canTransition('IN_TRANSIT', 'ESCROW_HELD')).toBe(false);
  });
});
