import type { AuthResult, AuthTokens } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { toPublicUser } from '../users/user.serializer';
import { requestOtp, verifyOtp } from './otp.service';
import { issueTokens, rotateRefreshToken, revokeRefreshToken } from './token.service';

/** Step 1: send a login OTP to a phone number. */
export async function sendLoginOtp(phone: string): Promise<{ expiresInSeconds: number }> {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (user && user.status === 'BANNED') {
    throw new AppError(403, 'USER_BANNED', 'This account has been banned.');
  }
  return requestOtp(phone);
}

/** Step 2: verify the OTP, upsert the user, and issue tokens. */
export async function verifyLoginOtp(
  phone: string,
  code: string,
  fcmToken?: string,
): Promise<AuthResult> {
  await verifyOtp(phone, code);

  const existing = await prisma.user.findUnique({ where: { phone } });
  const isNewUser = !existing;

  if (existing && existing.status === 'BANNED') {
    throw new AppError(403, 'USER_BANNED', 'This account has been banned.');
  }

  const user = await prisma.user.upsert({
    where: { phone },
    update: { phoneVerified: true, lastActiveAt: new Date(), ...(fcmToken ? { fcmToken } : {}) },
    create: { phone, phoneVerified: true, lastActiveAt: new Date(), fcmToken: fcmToken ?? null },
  });

  const tokens = await issueTokens(user.id);
  return { user: toPublicUser(user), tokens, isNewUser };
}

/** Rotate tokens using a valid refresh token. */
export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  return rotateRefreshToken(refreshToken);
}

/** Log out by revoking the supplied refresh token. */
export async function logout(refreshToken: string): Promise<void> {
  await revokeRefreshToken(refreshToken);
}
