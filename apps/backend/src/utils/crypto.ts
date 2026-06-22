import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto';
import { jwtConfig } from '../config/env';

/** Server-side pepper for hashing low-entropy secrets (OTP codes). */
const PEPPER = jwtConfig.accessSecret;

/** HMAC-SHA256 hex digest, peppered. Used for OTP codes + refresh tokens. */
export function hmac(value: string): string {
  return createHmac('sha256', PEPPER).update(value).digest('hex');
}

/** Constant-time comparison of two hex strings. */
export function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Cryptographically-random numeric OTP of the given length. */
export function generateNumericOtp(length: number): string {
  let code = '';
  for (let i = 0; i < length; i += 1) code += randomInt(0, 10).toString();
  return code;
}

/** High-entropy opaque token (for refresh tokens), URL-safe. */
export function generateOpaqueToken(bytes = 48): string {
  return randomBytes(bytes).toString('base64url');
}

/** Hash a password with scrypt (salt embedded). Format: scrypt$<salt>$<hash>. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

/** Verify a password against a stored scrypt hash (constant-time). */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hash] = parts;
  const expected = Buffer.from(hash!, 'hex');
  const actual = scryptSync(password, salt!, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
