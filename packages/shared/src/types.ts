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

/** Health-check payload. */
export interface HealthStatus {
  status: 'healthy' | 'degraded';
  timestamp: string;
  version: string;
  checks: {
    database: boolean;
  };
}
