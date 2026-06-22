import type { RequestHandler } from 'express';
import { UserRole } from '@carrymate/shared';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/errors';
import { verifyAccessToken } from '../modules/auth/token.service';

/** Require a valid access token; loads the user onto req.user. */
export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized('NO_TOKEN', 'Authentication required');
  }

  const claims = verifyAccessToken(header.slice(7));
  const user = await prisma.user.findUnique({ where: { id: claims.sub } });

  if (!user) throw AppError.unauthorized('USER_NOT_FOUND', 'Account not found');
  if (user.status === 'SUSPENDED') throw AppError.forbidden('Account suspended', 'USER_SUSPENDED');
  if (user.status === 'BANNED') throw AppError.forbidden('Account banned', 'USER_BANNED');

  req.user = user;
  next();
};

/** Require KYC to be VERIFIED. Use on all transaction routes. */
export const requireKyc: RequestHandler = (req, _res, next) => {
  if (req.user?.kycStatus !== 'VERIFIED') {
    throw AppError.forbidden('Complete KYC verification to continue', 'KYC_NOT_VERIFIED');
  }
  next();
};

/** Require the user to hold one of the given roles (BOTH and ADMIN always pass). */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    const role = req.user?.role as UserRole | undefined;
    if (!role) throw AppError.unauthorized();
    const allowed = role === UserRole.ADMIN || role === UserRole.BOTH || roles.includes(role);
    if (!allowed) throw AppError.forbidden('You do not have access to this resource');
    next();
  };
}
