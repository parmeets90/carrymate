import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
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
