import type { User } from '@prisma/client';
import type { PublicUser } from '@carrymate/shared';

/** Map a Prisma User to the client-safe shape. */
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    phone: user.phone,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    kycStatus: user.kycStatus,
    phoneVerified: user.phoneVerified,
    ratingAvg: Number(user.ratingAvg),
    ratingCount: user.ratingCount,
    createdAt: user.createdAt.toISOString(),
  };
}
