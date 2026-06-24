import type { AuthResult, AuthTokens } from '@carrymate/shared';
import { CURRENT_TERMS_VERSION } from '@carrymate/shared';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { toPublicUser } from '../users/user.serializer';
import { verifyPassword } from '../../utils/crypto';
import { requestOtp, verifyOtp } from './otp.service';
import { issueTokens, rotateRefreshToken, revokeRefreshToken } from './token.service';
import { verifyFirebaseToken } from '../../lib/firebase';

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
    create: {
      phone,
      phoneVerified: true,
      lastActiveAt: new Date(),
      fcmToken: fcmToken ?? null,
      consentVersion: CURRENT_TERMS_VERSION,
      consentedAt: new Date(),
    },
  });

  const tokens = await issueTokens(user.id);
  return { user: toPublicUser(user), tokens, isNewUser };
}

/**
 * Sign in / sign up with Google (Firebase). Verifies the Firebase ID token,
 * then matches an existing account by firebaseUid or email, else creates one.
 * Phone stays unset until the user verifies it in their profile.
 */
export async function googleAuth(idToken: string, fcmToken?: string): Promise<AuthResult> {
  const identity = await verifyFirebaseToken(idToken);

  let user =
    (await prisma.user.findUnique({ where: { firebaseUid: identity.uid } })) ??
    (identity.email ? await prisma.user.findUnique({ where: { email: identity.email } }) : null);

  if (user && user.status === 'BANNED') {
    throw new AppError(403, 'USER_BANNED', 'This account has been banned.');
  }

  const isNewUser = !user;
  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        firebaseUid: identity.uid,
        email: user.email ?? identity.email,
        lastActiveAt: new Date(),
        ...(fcmToken ? { fcmToken } : {}),
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        firebaseUid: identity.uid,
        email: identity.email,
        fullName: identity.name,
        lastActiveAt: new Date(),
        fcmToken: fcmToken ?? null,
        consentVersion: CURRENT_TERMS_VERSION,
        consentedAt: new Date(),
      },
    });
  }

  const tokens = await issueTokens(user.id);
  return { user: toPublicUser(user), tokens, isNewUser };
}

/** Send an OTP to attach/verify a phone on the logged-in account (profile flow). */
export async function startPhoneVerification(
  userId: string,
  phone: string,
): Promise<{ expiresInSeconds: number }> {
  const clash = await prisma.user.findUnique({ where: { phone } });
  if (clash && clash.id !== userId) {
    throw new AppError(409, 'PHONE_IN_USE', 'That phone number is already linked to another account.');
  }
  return requestOtp(phone);
}

/** Verify the OTP and attach the (now verified) phone to the logged-in account. */
export async function confirmPhoneVerification(
  userId: string,
  phone: string,
  code: string,
): Promise<ReturnType<typeof toPublicUser>> {
  const clash = await prisma.user.findUnique({ where: { phone } });
  if (clash && clash.id !== userId) {
    throw new AppError(409, 'PHONE_IN_USE', 'That phone number is already linked to another account.');
  }
  await verifyOtp(phone, code);
  const user = await prisma.user.update({
    where: { id: userId },
    data: { phone, phoneVerified: true },
  });
  return toPublicUser(user);
}

/** Register/refresh the logged-in user's FCM device token for push. */
export async function updateFcmToken(userId: string, token: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { fcmToken: token } });
}

/** Update the current user's profile (name, email, role). */
export async function updateProfile(
  userId: string,
  data: { fullName?: string; email?: string; role?: 'SENDER' | 'TRAVELER' },
): Promise<ReturnType<typeof toPublicUser>> {
  const user = await prisma.user.update({ where: { id: userId }, data });
  return toPublicUser(user);
}

/** Admin login with email + password (no OTP). Only ADMIN accounts. */
export async function adminLogin(email: string, password: string): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  const invalid = AppError.unauthorized('INVALID_CREDENTIALS', 'Invalid email or password.');

  // Run a hash verify even when the user/hash is missing to avoid timing leaks.
  const stored = user?.passwordHash ?? 'scrypt$0$0';
  const ok = verifyPassword(password, stored);

  if (!user || !user.passwordHash || !ok) throw invalid;
  if (user.role !== 'ADMIN') throw AppError.forbidden('Not an administrator account.');
  if (user.status !== 'ACTIVE') throw AppError.forbidden('Account is not active.', 'USER_SUSPENDED');

  const tokens = await issueTokens(user.id);
  return { user: toPublicUser(user), tokens, isNewUser: false };
}

/** Rotate tokens using a valid refresh token. */
export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  return rotateRefreshToken(refreshToken);
}

/** Log out by revoking the supplied refresh token. */
export async function logout(refreshToken: string): Promise<void> {
  await revokeRefreshToken(refreshToken);
}
