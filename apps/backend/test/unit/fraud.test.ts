import { describe, it, expect } from 'vitest';
import {
  computeRiskScore,
  RISK_FLAG_THRESHOLD,
  RISK_HOLD_THRESHOLD,
  type RiskFacts,
} from '../../src/modules/fraud/fraud.service';
import { MAX_DECLARED_VALUE_INR } from '@carrymate/shared';

const DAY = 86_400_000;

/** An established, clean sender with a low-value order. */
const baseline: RiskFacts = {
  senderAccountAgeMs: 30 * DAY,
  senderRatingAvg: 5,
  senderRatingCount: 10,
  senderDisputesLost: 0,
  recentOrders: 0,
  declaredValueInr: 500,
  duplicateKyc: false,
};

describe('computeRiskScore', () => {
  it('scores a clean, established order at zero (auto-clear)', () => {
    const r = computeRiskScore(baseline);
    expect(r.score).toBe(0);
    expect(r.factors).toEqual([]);
    expect(r.hold).toBe(false);
  });

  it('adds the new-account factor for sub-48h senders', () => {
    const r = computeRiskScore({ ...baseline, senderAccountAgeMs: 1 * DAY });
    expect(r.factors).toContain('NEW_SENDER');
    expect(r.score).toBe(15);
  });

  it('flags low rating only with enough rating history', () => {
    expect(computeRiskScore({ ...baseline, senderRatingAvg: 3, senderRatingCount: 2 }).factors)
      .not.toContain('LOW_RATING');
    expect(computeRiskScore({ ...baseline, senderRatingAvg: 3, senderRatingCount: 5 }).factors)
      .toContain('LOW_RATING');
  });

  it('caps dispute-history points at 30', () => {
    const r = computeRiskScore({ ...baseline, senderDisputesLost: 5 });
    expect(r.factors).toContain('DISPUTE_HISTORY');
    expect(r.score).toBe(30); // min(30, 5*15)
  });

  it('flags high declared value at ≥80% of the cap', () => {
    const r = computeRiskScore({ ...baseline, declaredValueInr: MAX_DECLARED_VALUE_INR * 0.8 });
    expect(r.factors).toContain('HIGH_VALUE');
  });

  it('flags burst ordering at 3+ recent orders', () => {
    expect(computeRiskScore({ ...baseline, recentOrders: 2 }).factors).not.toContain('BURST_ORDERS');
    expect(computeRiskScore({ ...baseline, recentOrders: 3 }).factors).toContain('BURST_ORDERS');
  });

  it('treats duplicate KYC as the strongest single signal', () => {
    const r = computeRiskScore({ ...baseline, duplicateKyc: true });
    expect(r.factors).toContain('DUPLICATE_KYC');
    expect(r.score).toBe(40);
  });

  it('holds escrow when stacked signals cross the hold threshold', () => {
    const r = computeRiskScore({
      ...baseline,
      senderAccountAgeMs: 1 * DAY, // +15
      duplicateKyc: true, // +40
      recentOrders: 3, // +15
    });
    expect(r.score).toBeGreaterThanOrEqual(RISK_HOLD_THRESHOLD);
    expect(r.hold).toBe(true);
  });

  it('flags (queue) without holding in the mid band', () => {
    const r = computeRiskScore({ ...baseline, duplicateKyc: true, senderAccountAgeMs: 1 * DAY }); // 55
    expect(r.score).toBeGreaterThanOrEqual(RISK_FLAG_THRESHOLD);
    expect(r.score).toBeLessThan(RISK_HOLD_THRESHOLD);
    expect(r.hold).toBe(false);
  });

  it('never exceeds 100', () => {
    const r = computeRiskScore({
      senderAccountAgeMs: 0,
      senderRatingAvg: 1,
      senderRatingCount: 10,
      senderDisputesLost: 10,
      recentOrders: 50,
      declaredValueInr: MAX_DECLARED_VALUE_INR,
      duplicateKyc: true,
    });
    expect(r.score).toBe(100);
  });
});
