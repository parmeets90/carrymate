import { describe, it, expect } from 'vitest';
import {
  checkProhibited,
  findProhibitedKeyword,
  computeFees,
  assertCorridor,
  assertDestinationCity,
} from '../../src/utils/marketplace';
import { COMMISSION_RATE } from '@carrymate/shared';

describe('checkProhibited (context-aware screening)', () => {
  it('blocks an electronics trigger only when an amplifier is present', () => {
    // "tablet" alone in a food context is fine (could be a chocolate tablet).
    expect(checkProhibited('Chocolate tablet', 'A sweet treat', 'FOOD').blocked).toBe(false);
    // "samsung tablet" is unambiguously a device → blocked.
    const r = checkProhibited('Samsung tablet', 'sealed box', 'GIFTS');
    expect(r.blocked).toBe(true);
    expect(r.reason).toBe('electronics');
  });

  it('blocks medicine triggers unless the category is FOOD', () => {
    expect(checkProhibited('Vitamin gummies', 'supplement', 'GIFTS').blocked).toBe(true);
    expect(checkProhibited('Vitamin gummies', 'supplement', 'FOOD').blocked).toBe(false);
  });

  it('blocks unconditional categories (valuables, weapons) regardless of context', () => {
    expect(checkProhibited('Gold chain', 'gift', 'GIFTS').blocked).toBe(true);
    expect(checkProhibited('Kitchen knife', 'present', 'OTHER').blocked).toBe(true);
  });

  it('does not false-positive on safe words (substring guard)', () => {
    // "scab" / "scan" must not trip on "can"; word-boundary matching matters.
    expect(checkProhibited('Homemade pickle', 'grandma recipe', 'FOOD').blocked).toBe(false);
    expect(checkProhibited('Birthday card', 'handwritten note', 'DOCUMENTS').blocked).toBe(false);
  });

  it('reports the matched word for blocked items', () => {
    // "phone" is the trigger; "samsung" the amplifier → unambiguous device.
    const r = checkProhibited('Samsung phone', 'new', 'GIFTS');
    expect(r.blocked).toBe(true);
    expect(r.matchedWord).toContain('phone');
  });
});

describe('findProhibitedKeyword', () => {
  it('returns the keyword on a hard match and null otherwise', () => {
    expect(findProhibitedKeyword('contains a gun')).toBeTruthy();
    expect(findProhibitedKeyword('homemade laddoo')).toBeNull();
  });
});

describe('computeFees', () => {
  it('takes the configured commission and rounds, leaving the rest as payout', () => {
    const { commissionInr, payoutInr } = computeFees(1000);
    expect(commissionInr).toBe(Math.round(1000 * COMMISSION_RATE));
    expect(commissionInr + payoutInr).toBe(1000);
  });

  it('never loses a rupee to rounding', () => {
    for (const fee of [1, 99, 333, 777, 1234]) {
      const { commissionInr, payoutInr } = computeFees(fee);
      expect(commissionInr + payoutInr).toBe(fee);
    }
  });
});

describe('assertCorridor / assertDestinationCity', () => {
  it('accepts a valid India → UAE corridor', () => {
    expect(() => assertCorridor('DEL', 'DXB')).not.toThrow();
    expect(() => assertDestinationCity('Dubai')).not.toThrow();
  });

  it('rejects a non-India origin', () => {
    expect(() => assertCorridor('JFK', 'DXB')).toThrow();
  });

  it('rejects a non-UAE destination', () => {
    expect(() => assertCorridor('DEL', 'LHR')).toThrow();
    expect(() => assertDestinationCity('London')).toThrow();
  });
});
