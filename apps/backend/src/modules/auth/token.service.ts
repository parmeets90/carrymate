import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { jwtConfig } from '../../config/env';
import { AppError } from '../../utils/errors';
import { generateOpaqueToken, hmac } from '../../utils/crypto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number; // seconds
}

export interface AccessClaims {
  sub: string; // userId
}

/** Parse durations like "15m", "7d", "3600" into milliseconds. */
function durationToMs(value: string): number {
  const match = /^(\d+)(s|m|h|d)?$/.exec(value.trim());
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const factor = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 1_000;
  return amount * factor;
}

function signAccessToken(userId: string): string {
  return jwt.sign({}, jwtConfig.accessSecret, {
    subject: userId,
    expiresIn: jwtConfig.accessExpiry as jwt.SignOptions['expiresIn'],
  });
}

/** Issue a fresh access + refresh pair and persist the (hashed) refresh token. */
export async function issueTokens(userId: string): Promise<TokenPair> {
  const refreshToken = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + durationToMs(jwtConfig.refreshExpiry));

  await prisma.refreshToken.create({
    data: { userId, tokenHash: hmac(refreshToken), expiresAt },
  });

  return {
    accessToken: signAccessToken(userId),
    refreshToken,
    accessExpiresIn: Math.floor(durationToMs(jwtConfig.accessExpiry) / 1000),
  };
}

/** Verify an access token and return its claims. */
export function verifyAccessToken(token: string): AccessClaims {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret);
    if (typeof decoded === 'string' || !decoded.sub) {
      throw new AppError(401, 'TOKEN_INVALID', 'Invalid token');
    }
    return { sub: String(decoded.sub) };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'TOKEN_EXPIRED', 'Access token expired');
    }
    throw new AppError(401, 'TOKEN_INVALID', 'Invalid token');
  }
}

/** Rotate a refresh token: revoke the old one and issue a new pair. */
export async function rotateRefreshToken(refreshToken: string): Promise<TokenPair> {
  const tokenHash = hmac(refreshToken);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!existing || existing.revokedAt || existing.expiresAt.getTime() < Date.now()) {
    throw new AppError(401, 'REFRESH_TOKEN_INVALID', 'Session expired. Please sign in again.');
  }

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  return issueTokens(existing.userId);
}

/** Revoke a single refresh token (logout). */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await prisma.refreshToken
    .updateMany({
      where: { tokenHash: hmac(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    })
    .catch(() => undefined);
}

/** Revoke every active refresh token for a user (logout everywhere). */
export async function revokeAllForUser(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
