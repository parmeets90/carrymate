import { createHmac } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { mapDiditStatus, verifyDiditSignature } from '../../src/modules/kyc/didit';

describe('mapDiditStatus (case/space tolerant)', () => {
  it('maps approval to VERIFIED regardless of casing', () => {
    expect(mapDiditStatus('Approved')).toBe('VERIFIED');
    expect(mapDiditStatus('approved')).toBe('VERIFIED');
  });

  it('routes declined / in-review / expired to manual review (never auto-reject)', () => {
    expect(mapDiditStatus('In Review')).toBe('IN_REVIEW');
    expect(mapDiditStatus('Declined')).toBe('IN_REVIEW');
    expect(mapDiditStatus('Kyc Expired')).toBe('IN_REVIEW');
  });

  it('treats in-progress / not-started as PENDING', () => {
    expect(mapDiditStatus('In Progress')).toBe('PENDING');
    expect(mapDiditStatus('Not Started')).toBe('PENDING');
  });

  it('ignores unknown / missing statuses', () => {
    expect(mapDiditStatus('Abandoned')).toBe('IGNORE');
    expect(mapDiditStatus(undefined)).toBe('IGNORE');
  });
});

describe('verifyDiditSignature', () => {
  const secret = 'test-webhook-secret'; // matches test/setup.ts
  const body = Buffer.from(JSON.stringify({ session_id: 'abc', status: 'Approved' }));
  const sign = (b: Buffer) => createHmac('sha256', secret).update(b).digest('hex');

  it('accepts a correct signature', () => {
    expect(verifyDiditSignature(body, sign(body))).toBe(true);
  });

  it('rejects a tampered body', () => {
    const tampered = Buffer.from(JSON.stringify({ session_id: 'abc', status: 'Declined' }));
    expect(verifyDiditSignature(tampered, sign(body))).toBe(false);
  });

  it('rejects missing signature or body', () => {
    expect(verifyDiditSignature(body, undefined)).toBe(false);
    expect(verifyDiditSignature(undefined, sign(body))).toBe(false);
  });
});
