import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { ERROR_CODES, type ApiError } from '@carrymate/shared';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { captureException } from '../lib/observability';
import { isProd } from '../config/env';

/** 404 handler for unmatched routes. */
export const notFoundHandler: RequestHandler = (req, res) => {
  const body: ApiError = {
    success: false,
    error: { code: ERROR_CODES.NOT_FOUND, message: `Route not found: ${req.method} ${req.path}` },
  };
  res.status(404).json(body);
};

/** Global error handler — converts thrown errors into the standard envelope. */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    const body: ApiError = {
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details: err.flatten().fieldErrors as Record<string, string[]>,
      },
    };
    res.status(400).json(body);
    return;
  }

  if (err instanceof AppError) {
    // Server-fault AppErrors (5xx) are worth alerting on; client 4xx are not.
    if (err.statusCode >= 500) {
      captureException(err, { requestId: req.id, userId: req.user?.id, method: req.method, path: req.path });
    }
    const body: ApiError = {
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  captureException(err, { requestId: req.id, userId: req.user?.id, method: req.method, path: req.path });
  logger.error(`Unhandled error [${req.id ?? '-'}]`, err instanceof Error ? err : { err });
  const body: ApiError = {
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: isProd ? 'Something went wrong' : String((err as Error)?.message ?? err),
    },
  };
  res.status(500).json(body);
};
