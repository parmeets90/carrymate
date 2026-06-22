/**
 * Shared API and domain types.
 */

import type { ErrorCode } from './constants';

/** Standard envelope every API endpoint returns. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode | string;
    message: string;
    /** Optional field-level validation details. */
    details?: Record<string, string[]>;
    requestId?: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Cursor/offset pagination wrapper. */
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

/** A user as exposed to clients (no sensitive fields). */
export interface PublicUser {
  id: string;
  phone: string;
  email: string | null;
  fullName: string | null;
  role: string;
  status: string;
  kycStatus: string;
  phoneVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
}

/** Access + refresh tokens returned to the client. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
}

/** Result of a successful OTP verification / login. */
export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
  isNewUser: boolean;
}

/** Health-check payload. */
export interface HealthStatus {
  status: 'healthy' | 'degraded';
  timestamp: string;
  version: string;
  checks: {
    database: boolean;
  };
}
