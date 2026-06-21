import type { Response } from 'express';
import type { ApiSuccess } from '@carrymate/shared';

/** Send a standardized success envelope. */
export function ok<T>(res: Response, data: T, status = 200): Response<ApiSuccess<T>> {
  return res.status(status).json({ success: true, data });
}
