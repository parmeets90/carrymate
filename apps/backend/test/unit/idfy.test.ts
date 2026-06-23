import { describe, it, expect } from 'vitest';
import { decideFromScores, KYC_THRESHOLDS } from '../../src/modules/kyc/idfy';

describe('decideFromScores (KYC face-match + OCR decision)', () => {
  it('auto-approves only when BOTH face and OCR clear their high bars', () => {
    expect(decideFromScores(95, 95)).toBe('APPROVE');
    // strong face but weak OCR → not an auto-approve.
    expect(decideFromScores(95, 80)).not.toBe('APPROVE');
  });

  it('routes to manual review in the middle band', () => {
    expect(decideFromScores(KYC_THRESHOLDS.MANUAL_FLOOR, 99)).toBe('MANUAL');
    expect(decideFromScores(88, 70)).toBe('MANUAL');
  });

  it('asks for a retry when the face match is below the floor', () => {
    expect(decideFromScores(KYC_THRESHOLDS.MANUAL_FLOOR - 1, 99)).toBe('RETRY');
    expect(decideFromScores(10, 10)).toBe('RETRY');
  });
});
