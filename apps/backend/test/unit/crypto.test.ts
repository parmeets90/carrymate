import { describe, it, expect } from 'vitest';
import {
  hmac,
  safeEqualHex,
  generateNumericOtp,
  generateOpaqueToken,
  hashPassword,
  verifyPassword,
} from '../../src/utils/crypto';

describe('hmac', () => {
  it('is deterministic for the same input', () => {
    expect(hmac('123456')).toBe(hmac('123456'));
  });
  it('differs for different inputs', () => {
    expect(hmac('123456')).not.toBe(hmac('123457'));
  });
});

describe('safeEqualHex', () => {
  it('matches identical hex and rejects mismatches / length diffs', () => {
    const a = hmac('x');
    expect(safeEqualHex(a, a)).toBe(true);
    expect(safeEqualHex(a, hmac('y'))).toBe(false);
    expect(safeEqualHex('ab', 'abcd')).toBe(false);
  });
});

describe('generateNumericOtp', () => {
  it('returns a numeric string of the requested length', () => {
    const otp = generateNumericOtp(6);
    expect(otp).toHaveLength(6);
    expect(otp).toMatch(/^\d{6}$/);
  });
});

describe('generateOpaqueToken', () => {
  it('produces URL-safe, unique tokens', () => {
    const a = generateOpaqueToken();
    const b = generateOpaqueToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe('password hashing (scrypt)', () => {
  it('round-trips a correct password and rejects a wrong one', () => {
    const stored = hashPassword('S3cret!pass');
    expect(stored.startsWith('scrypt$')).toBe(true);
    expect(verifyPassword('S3cret!pass', stored)).toBe(true);
    expect(verifyPassword('wrong', stored)).toBe(false);
  });

  it('salts: the same password hashes differently each time', () => {
    expect(hashPassword('same')).not.toBe(hashPassword('same'));
  });

  it('rejects a malformed stored hash without throwing', () => {
    expect(verifyPassword('x', 'not-a-valid-hash')).toBe(false);
  });
});
